"""
Feedback API routes — early access validation survey for test accounts.
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User
from models.feedback import Feedback

feedback_bp = Blueprint('feedback', __name__)

VALID_USE_CASES = ('referrals', 'care_team', 'goals_tracking', 'compliance', 'not_sure', 'other')


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

    use_case = data.get('use_case')
    use_case_other = data.get('use_case_other', '').strip() or None
    recommend_condition = data.get('recommend_condition', '').strip() or None
    most_useful = data.get('most_useful', '').strip() or None
    waste_of_time = data.get('waste_of_time', '').strip() or None
    trust_first = data.get('trust_first', '').strip() or None
    comparison = data.get('comparison', '').strip() or None
    other_comments = data.get('other_comments', '').strip() or None

    if use_case not in VALID_USE_CASES:
        return jsonify({'error': f'use_case must be one of: {VALID_USE_CASES}'}), 400

    # Detect test account from email domain or explicit flag
    test_account = bool(data.get('test_account')) or (
        user.email.endswith('@example.com') or
        user.email.endswith('@test.com') or
        user.email.endswith('@dummy.com') or
        'test' in user.email.lower()
    )

    fb = Feedback(
        user_id=user_id,
        test_account=test_account,
        use_case=use_case,
        use_case_other=use_case_other,
        recommend_condition=recommend_condition,
        most_useful=most_useful,
        waste_of_time=waste_of_time,
        trust_first=trust_first,
        comparison=comparison,
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
    """Paginated list of all registrations with optional filters."""
    if not _admin_check():
        return jsonify({'error': 'Admin access required'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    has_feedback = request.args.get('has_feedback', '')
    test_accounts = request.args.get('test_accounts', '')  # 'true' | 'false' | ''
    search = request.args.get('search', '')

    q = User.query

    if has_feedback == 'true':
        q = q.filter(User.feedback_submitted_at.isnot(None))
    elif has_feedback == 'false':
        q = q.filter(User.feedback_submitted_at.is_(None))

    if test_accounts == 'true':
        q = q.filter(
            db.or_(
                User.email.ilike('%@example.com'),
                User.email.ilike('%@test.com'),
                User.email.ilike('%@dummy.com'),
                User.email.ilike('%test%'),
            )
        )
    elif test_accounts == 'false':
        q = q.filter(
            db.not_(
                db.or_(
                    User.email.ilike('%@example.com'),
                    User.email.ilike('%@test.com'),
                    User.email.ilike('%@dummy.com'),
                    User.email.ilike('%test%'),
                )
            )
        )

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
