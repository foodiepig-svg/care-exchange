"""
Feedback API routes — early access product validation survey.
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User
from models.feedback import Feedback

feedback_bp = Blueprint('feedback', __name__)

VALID_WOULD_USE = ('yes_regaily', 'yes_sometimes', 'maybe_not', 'no')
VALID_WOULD_PAY = ('yes_monthly', 'yes_once', 'maybe', 'no')


@feedback_bp.route('/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    """Submit early access feedback. One submission per user."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Not found'}), 404

    if user.feedback_submitted_at:
        return jsonify({'error': 'Feedback already submitted'}), 409

    data = request.get_json() or {}

    would_use = data.get('would_use')
    would_pay = data.get('would_pay')
    pay_amount = data.get('pay_amount', '').strip() or None
    top_frustration = data.get('top_frustration', '').strip() or None
    top_feature = data.get('top_feature', '').strip() or None
    other_comments = data.get('other_comments', '').strip() or None

    if would_use not in VALID_WOULD_USE:
        return jsonify({'error': f'would_use must be one of: {VALID_WOULD_USE}'}), 400
    if would_pay not in VALID_WOULD_PAY:
        return jsonify({'error': f'would_pay must be one of: {VALID_WOULD_PAY}'}), 400

    fb = Feedback(
        user_id=user_id,
        would_use=would_use,
        would_pay=would_pay,
        pay_amount=pay_amount,
        top_frustration=top_frustration,
        top_feature=top_feature,
        other_comments=other_comments,
    )
    db.session.add(fb)

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

def _admin_check():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    return user and user.role == 'admin'


@feedback_bp.route('/admin/feedback', methods=['GET'])
@jwt_required()
def admin_list_feedback():
    """Paginated list of all registrations with optional has_feedback filter."""
    if not _admin_check():
        return jsonify({'error': 'Admin access required'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    has_feedback = request.args.get('has_feedback', '')
    search = request.args.get('search', '')

    q = User.query

    if has_feedback == 'true':
        q = q.filter(User.feedback_submitted_at.isnot(None))
    elif has_feedback == 'false':
        q = q.filter(User.feedback_submitted_at.is_(None))

    if search:
        q = q.filter(
            db.or_(
                User.full_name.ilike(f'%{search}%'),
                User.email.ilike(f'%{search}%')
            )
        )

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
