from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Thread, Message, User

messages_bp = Blueprint('messages', __name__)


@messages_bp.route('/threads', methods=['GET'])
@jwt_required()
def list_threads():
    user_id = int(get_jwt_identity())
    threads = Thread.query.filter(
        Thread.messages.any(Message.sender_id == user_id) |
        (Thread.created_by_id == user_id)
    ).all()
    return jsonify({'threads': [t.to_dict() for t in threads]})


@messages_bp.route('/threads', methods=['POST'])
@jwt_required()
def create_thread():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    topic = data.get('topic', '')
    participant_id = data.get('participant_id')

    if not topic or not participant_id:
        return jsonify({'error': 'topic and participant_id are required'}), 400

    thread = Thread(
        topic=topic,
        participant_id=participant_id,
        created_by_id=user_id
    )
    db.session.add(thread)
    db.session.flush()

    msg = Message(thread_id=thread.id, sender_id=user_id, content=data.get('content', ''))
    db.session.add(msg)
    db.session.commit()

    return jsonify({'thread': thread.to_dict()}), 201


@messages_bp.route('/threads/<int:thread_id>', methods=['GET'])
@jwt_required()
def get_thread(thread_id):
    thread = Thread.query.get_or_404(thread_id)
    messages = Message.query.filter_by(thread_id=thread_id).order_by(Message.created_at).all()
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

    if not content:
        return jsonify({'error': 'content is required'}), 400

    msg = Message(thread_id=thread_id, sender_id=user_id, content=content)
    db.session.add(msg)
    db.session.commit()

    return jsonify({'message': msg.to_dict()}), 201
