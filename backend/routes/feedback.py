"""
Feedback API routes — early access survey.
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User
from models.feedback import Feedback

feedback_bp = Blueprint('feedback', __name__)


@feedback_bp.route('/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    """Submit early access feedback. One submission per user."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Not found'}), 404

    # Prevent duplicate submissions
    if user.feedback_submitted_at:
        return jsonify({'error': 'Feedback already submitted'}), 409

    data = request.get_json() or {}

    rating = data.get('rating')  # 1-5
    nps = data.get('nps')  # 0-10
    tried_features = data.get('tried_features', [])  # list of strings
    confusing = data.get('confusing', '').strip()
    broken_missing = data.get('broken_missing', '').strip()
    other_comments = data.get('other_comments', '').strip()

    if rating is not None and not (1 <= int(rating) <= 5):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    if nps is not None and not (0 <= int(nps) <= 10):
        return jsonify({'error': 'NPS must be between 0 and 10'}), 400

    import json
    fb = Feedback(
        user_id=user_id,
        rating=int(rating) if rating is not None else None,
        nps=int(nps) if nps is not None else None,
        tried_features=json.dumps(tried_features) if tried_features else None,
        confusing=confusing or None,
        broken_missing=broken_missing or None,
        other_comments=other_comments or None,
    )
    db.session.add(fb)

    # Mark user as having submitted feedback
    user.feedback_submitted_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'feedback': fb.to_dict()}), 201


@feedback_bp.route('/feedback/me', methods=['GET'])
@jwt_required()
def my_feedback():
    """Check if current user has submitted feedback."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({
        'submitted': bool(user.feedback_submitted_at),
        'submitted_at': user.feedback_submitted_at.isoformat() if user.feedback_submitted_at else None,
    })


# ─── Admin Routes ─────────────────────────────────────────────────────────────

@feedback_bp.route('/admin/feedback', methods=['GET'])
@jwt_required()
def admin_list_feedback():
    """List all feedback submissions with registration status."""
    from functools import wraps
    def admin_check():
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        return user and user.role == 'admin'

    if not admin_check():
        return jsonify({'error': 'Admin access required'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    has_feedback = request.args.get('has_feedback', '')

    q = User.query

    if has_feedback == 'true':
        q = q.filter(User.feedback_submitted_at.isnot(None))
    elif has_feedback == 'false':
        q = q.filter(User.feedback_submitted_at.is_(None))

    q = q.order_by(User.created_at.desc())
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)

    result = []
    for user in paginated.items:
        fb = Feedback.query.filter_by(user_id=user.id).first()
        result.append({
            'user': user.to_dict(),
            'feedback': fb.to_dict() if fb else None,
        })

    return jsonify({
        'results': result,
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })