import os, uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from models import Document, Participant

documents_bp = Blueprint('documents', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
PRESIGN_EXPIRY_SECONDS = 3600  # 1 hour


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _get_s3_client():
    """Return an S3-compatible client (boto3). Works for AWS S3 and Cloudflare R2."""
    import botocore.config
    import boto3

    # Cloudflare R2
    if current_app.config.get('CLOUDFLARE_R2_ACCESS_KEY_ID'):
        session = boto3.session.Session()
        return session.client(
            's3',
            region_name=current_app.config.get('CLOUDFLARE_ACCOUNT_ID', 'auto'),
            endpoint_url=f"https://{current_app.config['CLOUDFLARE_ACCOUNT_ID']}.r2.cloudflarestorage.com",
            aws_access_key_id=current_app.config['CLOUDFLARE_R2_ACCESS_KEY_ID'],
            aws_secret_access_key=current_app.config['CLOUDFLARE_R2_SECRET_ACCESS_KEY'],
            config=botocore.config.Config(signature_version='s3v4'),
        )
    # AWS S3
    return boto3.client(
        's3',
        region_name=current_app.config.get('AWS_REGION', 'us-east-1'),
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
    )


def _get_bucket():
    return current_app.config.get('S3_BUCKET') or current_app.config.get('R2_BUCKET')


def _has_s3_configured():
    return bool(
        (current_app.config.get('AWS_ACCESS_KEY_ID') and current_app.config.get('AWS_SECRET_ACCESS_KEY') and current_app.config.get('S3_BUCKET'))
        or
        (current_app.config.get('CLOUDFLARE_R2_ACCESS_KEY_ID') and current_app.config.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY') and current_app.config.get('R2_BUCKET'))
    )


@documents_bp.route('/presign', methods=['POST'])
@jwt_required()
def presign_upload():
    """Generate a presigned PUT URL for direct browser-to-S3 upload.

    The frontend calls this endpoint to get a presigned URL, then uploads
    the file directly to S3/R2. After upload, the frontend calls
    POST /documents with { storage_key, title, category, description }
    to create the DB record.

    Request body (JSON):
        filename: original filename (e.g. "report.pdf")
        content_type: MIME type (e.g. "application/pdf")

    Returns:
        { upload_url: "https://...", storage_key: "uploads/abc123.pdf", expires_in: 3600 }
    """
    if not _has_s3_configured():
        return jsonify({'error': 'S3/R2 storage not configured'}), 503

    data = request.get_json() or {}
    filename = data.get('filename', '')
    content_type = data.get('content_type', 'application/octet-stream')

    if not allowed_file(filename):
        return jsonify({'error': f'File type not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    ext = secure_filename(filename).rsplit('.', 1)[-1].lower()
    storage_key = f"documents/{uuid.uuid4().hex}.{ext}"

    try:
        s3 = _get_s3_client()
        bucket = _get_bucket()
        upload_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket,
                'Key': storage_key,
                'ContentType': content_type,
            },
            ExpiresIn=PRESIGN_EXPIRY_SECONDS,
        )
        return jsonify({
            'upload_url': upload_url,
            'storage_key': storage_key,
            'expires_in': PRESIGN_EXPIRY_SECONDS,
        })
    except Exception as e:
        current_app.logger.error(f'Presign error: {e}')
        return jsonify({'error': 'Failed to generate upload URL'}), 500


@documents_bp.route('/presign-download/<int:doc_id>', methods=['GET'])
@jwt_required()
def presign_download(doc_id):
    """Generate a presigned GET URL for secure file download from S3/R2.

    Returns:
        { download_url: "https://...", expires_in: 3600 }
    """
    user_id = int(get_jwt_identity())
    doc = db.session.get(Document, doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or doc.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    if doc.storage_key:
        if not _has_s3_configured():
            return jsonify({'error': 'S3/R2 storage not configured'}), 503
        try:
            s3 = _get_s3_client()
            bucket = _get_bucket()
            download_url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket, 'Key': doc.storage_key},
                ExpiresIn=PRESIGN_EXPIRY_SECONDS,
            )
            return jsonify({'download_url': download_url, 'expires_in': PRESIGN_EXPIRY_SECONDS})
        except Exception as e:
            current_app.logger.error(f'Presign download error: {e}')
            return jsonify({'error': 'Failed to generate download URL'}), 500

    # Local file fallback
    upload_folder = current_app.config.get('UPLOAD_FOLDER', '/tmp/careexchange/uploads')
    filepath = os.path.join(upload_folder, doc.filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404

    from flask import send_file
    return send_file(filepath, as_attachment=True, download_name=doc.original_filename)


@documents_bp.route('', methods=['GET'])
@jwt_required()
def list_documents():
    user_id = int(get_jwt_identity())
    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    category = request.args.get('category')
    query = Document.query.filter_by(participant_id=participant.id)
    if category:
        query = query.filter_by(category=category)
    docs = query.order_by(Document.created_at.desc()).all()
    return jsonify({'documents': [d.to_dict() for d in docs]})


@documents_bp.route('', methods=['POST'])
@jwt_required()
def upload_document():
    """Create a document record.

    Two modes:
    1. With storage_key: file was uploaded to S3/R2 via presigned URL (preferred)
       Body (JSON): { storage_key, original_filename, file_type, file_size, title, category, description }
    2. With file: direct multipart upload to the server (fallback / dev)
       Body (multipart): file + title + category + description
    """
    user_id = int(get_jwt_identity())
    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    content_type = request.headers.get('Content-Type', '')

    # Mode 1: S3/R2 presigned upload (JSON body)
    if content_type.startswith('application/json') or request.is_json:
        data = request.get_json() or {}
        storage_key = data.get('storage_key')
        original_filename = data.get('original_filename', 'uploaded_file')
        file_type = data.get('file_type', 'application/octet-stream')
        file_size = data.get('file_size', 0)
        title = data.get('title', original_filename)
        category = data.get('category', 'other')
        description = data.get('description', '')

        if not storage_key:
            return jsonify({'error': 'storage_key is required for presigned uploads'}), 400
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File exceeds 10MB limit'}), 400

        # Verify the file actually exists in S3
        if _has_s3_configured():
            try:
                s3 = _get_s3_client()
                bucket = _get_bucket()
                s3.head_object(Bucket=bucket, Key=storage_key)
            except Exception:
                return jsonify({'error': 'File not found in storage. Upload may have failed.'}), 400

        doc = Document(
            participant_id=participant.id,
            uploaded_by_id=user_id,
            title=title,
            filename=storage_key,  # Store S3 key in filename column for S3-stored files
            original_filename=secure_filename(original_filename),
            file_type=file_type,
            file_size=file_size,
            category=category,
            description=description,
            storage_key=storage_key,
        )
        db.session.add(doc)
        db.session.commit()
        return jsonify({'document': doc.to_dict()}), 201

    # Mode 2: Direct multipart upload (fallback / dev)
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    title = request.form.get('title', file.filename)
    category = request.form.get('category', 'other')
    description = request.form.get('description', '')

    if not allowed_file(file.filename):
        return jsonify({'error': f'File type not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    original_filename = secure_filename(file.filename)
    ext = original_filename.rsplit('.', 1)[1].lower()
    stored_filename = f"{uuid.uuid4().hex}.{ext}"

    upload_folder = current_app.config.get('UPLOAD_FOLDER', '/tmp/careexchange/uploads')
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, stored_filename)
    file.save(filepath)
    file_size = os.path.getsize(filepath)

    if file_size > MAX_FILE_SIZE:
        os.remove(filepath)
        return jsonify({'error': 'File exceeds 10MB limit'}), 400

    doc = Document(
        participant_id=participant.id,
        uploaded_by_id=user_id,
        title=title,
        filename=stored_filename,
        original_filename=original_filename,
        file_type=file.content_type or f'application/{ext}',
        file_size=file_size,
        category=category,
        description=description,
    )
    db.session.add(doc)
    db.session.commit()

    return jsonify({'document': doc.to_dict()}), 201


@documents_bp.route('/<int:doc_id>', methods=['GET'])
@jwt_required()
def get_document(doc_id):
    user_id = int(get_jwt_identity())
    doc = db.session.get(Document, doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or doc.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify({'document': doc.to_dict()})


@documents_bp.route('/<int:doc_id>/download', methods=['GET'])
@jwt_required()
def download_document(doc_id):
    """Download a document. For S3-stored files, redirects to presigned GET URL."""
    user_id = int(get_jwt_identity())
    doc = db.session.get(Document, doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or doc.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    # S3/R2: generate presigned download URL and redirect
    if doc.storage_key:
        if not _has_s3_configured():
            return jsonify({'error': 'S3/R2 storage not configured'}), 503
        try:
            s3 = _get_s3_client()
            bucket = _get_bucket()
            download_url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket, 'Key': doc.storage_key, 'ResponseContentDisposition': f'attachment; filename="{doc.original_filename}"'},
                ExpiresIn=PRESIGN_EXPIRY_SECONDS,
            )
            from flask import redirect
            return redirect(download_url)
        except Exception as e:
            current_app.logger.error(f'Download error: {e}')
            return jsonify({'error': 'Failed to generate download URL'}), 500

    # Local file fallback
    upload_folder = current_app.config.get('UPLOAD_FOLDER', '/tmp/careexchange/uploads')
    filepath = os.path.join(upload_folder, doc.filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found on disk'}), 404

    return send_file(filepath, as_attachment=True, download_name=doc.original_filename)


@documents_bp.route('/<int:doc_id>', methods=['DELETE'])
@jwt_required()
def delete_document(doc_id):
    user_id = int(get_jwt_identity())
    doc = db.session.get(Document, doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or doc.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    # Delete from S3 if stored there
    if doc.storage_key and _has_s3_configured():
        try:
            s3 = _get_s3_client()
            bucket = _get_bucket()
            s3.delete_object(Bucket=bucket, Key=doc.storage_key)
        except Exception as e:
            current_app.logger.warning(f'Failed to delete S3 object {doc.storage_key}: {e}')

    # Remove local file if it exists
    if not doc.storage_key:
        upload_folder = current_app.config.get('UPLOAD_FOLDER', '/tmp/careexchange/uploads')
        filepath = os.path.join(upload_folder, doc.filename)
        if os.path.exists(filepath):
            os.remove(filepath)

    db.session.delete(doc)
    db.session.commit()
    return jsonify({'message': 'Document deleted'})
