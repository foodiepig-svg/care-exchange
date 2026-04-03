from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Notification
from services.notification_service import NotificationService

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('', methods=['GET'])
@jwt_required()
def list_notifications():
    user_id = int(get_jwt_identity())
    notifications = Notification.query.filter_by(user_id=user_id)\
        .order_by(Notification.created_at.desc()).limit(50).all()
    unread_count = Notification.query.filter_by(user_id=user_id, read=False).count()
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count,
    })


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def unread_count():
    user_id = int(get_jwt_identity())
    count = Notification.query.filter_by(user_id=user_id, read=False).count()
    return jsonify({'unread_count': count})


@notifications_bp.route('/<int:notification_id>/read', methods=['PATCH'])
@jwt_required()
def mark_read(notification_id):
    user_id = int(get_jwt_identity())
    n = db.session.get(Notification, notification_id)
    if not n or n.user_id != user_id:
        return jsonify({'error': 'Not found'}), 404
    n.read = True
    db.session.commit()
    return jsonify({'notification': n.to_dict()})


@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, read=False)\
        .update({'read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'})


@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    user_id = int(get_jwt_identity())
    n = db.session.get(Notification, notification_id)
    if not n or n.user_id != user_id:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(n)
    db.session.commit()
    return jsonify({'message': 'Notification deleted'})


@notifications_bp.route('/send_test', methods=['POST'])
def send_test_email():
    """Test endpoint for sending an email notification.

    Expects JSON: {"to_email": "...", "subject": "...", "body": "..."}
    """
    data = request.get_json() or {}
    to_email = data.get('to_email')
    subject = data.get('subject', 'Test Email from Care Exchange')
    body = data.get('body', 'This is a test email from Care Exchange.')

    if not to_email:
        return jsonify({'error': 'to_email is required'}), 400

    success = NotificationService.send_email_notification(to_email, subject, body)
    return jsonify({
        'success': success,
        'message': f'Test email sent to {to_email}' if success else 'Failed to send email'
    })
