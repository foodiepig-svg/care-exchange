import os
import uuid
import base64

from flask import Blueprint, request, jsonify, abort, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Thread, Message, User

messages_bp = Blueprint('messages', __name__)


@messages_bp.route('/threads', methods=['GET'])
@jwt_required()
def list_threads():
    user_id = int(get_jwt_identity())
    from models import User
    threads = Thread.query.filter(
        Thread.messages.any(Message.sender_id == user_id) |
        (Thread.created_by_id == user_id) |
        Thread.participants.any(User.id == user_id)
    ).all()
    return jsonify({'threads': [t.to_dict() for t in threads]})


@messages_bp.route('/threads', methods=['POST'])
@jwt_required()
def create_thread():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    topic = data.get('topic', '')
    participant_id = data.get('participant_id')
    thread_type = data.get('thread_type', 'direct')
    participant_ids = data.get('participant_ids', [])

    if not topic or not participant_id:
        return jsonify({'error': 'topic and participant_id are required'}), 400

    thread = Thread(
        topic=topic,
        participant_id=participant_id,
        created_by_id=user_id,
        thread_type=thread_type
    )
    db.session.add(thread)
    db.session.flush()

    # Add all participants (including creator) to group threads
    if thread_type == 'group' and participant_ids:
        from models import User
        users = User.query.filter(User.id.in_(participant_ids + [user_id])).all()
        thread.participants = users

    msg = Message(thread_id=thread.id, sender_id=user_id, content=data.get('content', ''))
    db.session.add(msg)
    db.session.commit()

    msgs = Message.query.filter_by(thread_id=thread.id).order_by(Message.sent_at).all()
    thread_dict = thread.to_dict()
    thread_dict['messages'] = [m.to_dict() for m in msgs]
    return jsonify({'thread': thread_dict}), 201


@messages_bp.route('/threads/<int:thread_id>', methods=['GET'])
@jwt_required()
def get_thread(thread_id):
    thread = db.session.get(Thread, thread_id) or abort(404)
    messages = Message.query.filter_by(thread_id=thread_id).order_by(Message.sent_at).all()
    return jsonify({
        'thread': thread.to_dict(),
        'messages': [m.to_dict() for m in messages]
    })


@messages_bp.route('/threads/<int:thread_id>', methods=['POST'])
@jwt_required()
def send_message(thread_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    content = data.get('content', '')
    attachments_data = data.get('attachments', [])

    if not content and not attachments_data:
        return jsonify({'error': 'content or attachments are required'}), 400

    # Process inline base64 attachments
    saved_attachments = []
    for att in attachments_data:
        filename = att.get('filename', 'unnamed')
        data_base64 = att.get('data_base64')
        mime_type = att.get('mime_type', 'application/octet-stream')

        if not data_base64:
            continue

        try:
            file_data = base64.b64decode(data_base64)
        except Exception:
            continue

        # Determine extension from mime_type
        ext_map = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'application/pdf': '.pdf',
        }
        ext = ext_map.get(mime_type, '')
        unique_name = f"{uuid.uuid4().hex}{ext}"

        # Save to workspace/public/attachments/<thread_id>/
        attach_dir = os.path.join(
            current_app.config.get('WORKSPACE_DIR', '/Users/WORK/projects/care-exchange/workspace/public'),
            'attachments',
            str(thread_id)
        )
        os.makedirs(attach_dir, exist_ok=True)
        file_path = os.path.join(attach_dir, unique_name)
        with open(file_path, 'wb') as f:
            f.write(file_data)

        saved_attachments.append({
            'id': uuid.uuid4().hex,
            'filename': filename,
            'url': f"/attachments/{thread_id}/{unique_name}",
            'file_type': mime_type,
            'size_bytes': len(file_data),
        })

    msg = Message(
        thread_id=thread_id,
        sender_id=user_id,
        content=content,
        attachments=saved_attachments if saved_attachments else None
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({'message': msg.to_dict()}), 201
