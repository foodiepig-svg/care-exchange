import os, uuid
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from models import Document, Participant

documents_bp = Blueprint('documents', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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
    user_id = int(get_jwt_identity())
    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    title = request.form.get('title', file.filename)
    category = request.form.get('category', 'general')
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
    user_id = int(get_jwt_identity())
    doc = db.session.get(Document, doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or doc.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

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

    # Remove file from disk
    upload_folder = current_app.config.get('UPLOAD_FOLDER', '/tmp/careexchange/uploads')
    filepath = os.path.join(upload_folder, doc.filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    db.session.delete(doc)
    db.session.commit()
    return jsonify({'message': 'Document deleted'})
