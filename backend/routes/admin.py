"""
Admin API routes — platform administration.
Requires JWT + role='admin'.
"""
from functools import wraps
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User
from models.referral import Referral
from models.update import Update
from models.participant import Participant
from models.provider import Provider
from models.coordinator import Coordinator
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)


def admin_required(f):
    """Decorator — only allows role=admin."""
    @wraps(f)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return wrapper


# ─── Stats ───────────────────────────────────────────────────────────────────

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def platform_stats():
    """Platform-wide statistics for admin dashboard."""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    total_users = User.query.count()
    users_by_role = dict(
        db.session.query(User.role, db.func.count(User.id))
        .group_by(User.role).all()
    )

    new_users_week = User.query.filter(User.created_at >= week_ago).count()

    active_referrals = Referral.query.filter(
        Referral.status.in_(['sent', 'viewed', 'accepted', 'active'])
    ).count()

    referrals_by_status = dict(
        db.session.query(Referral.status, db.func.count(Referral.id))
        .group_by(Referral.status).all()
    )

    total_updates = Update.query.count()

    # Recent signups
    recent_signups = User.query.order_by(User.created_at.desc()).limit(5).all()

    return jsonify({
        'total_users': total_users,
        'users_by_role': users_by_role,
        'new_users_week': new_users_week,
        'active_referrals': active_referrals,
        'referrals_by_status': referrals_by_status,
        'total_updates': total_updates,
        'recent_signups': [u.to_dict() for u in recent_signups],
    })


# ─── Users ────────────────────────────────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    """List all users with pagination and filtering."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    role = request.args.get('role', '')
    search = request.args.get('search', '')
    is_active = request.args.get('is_active', '')

    q = User.query

    if role:
        q = q.filter(User.role == role)
    if search:
        q = q.filter(
            db.or_(
                User.email.ilike(f'%{search}%'),
                User.full_name.ilike(f'%{search}%')
            )
        )
    if is_active == 'true':
        q = q.filter(User.is_active == True)
    elif is_active == 'false':
        q = q.filter(User.is_active == False)

    q = q.order_by(User.created_at.desc())
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': [u.to_dict() for u in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    """Get user detail with role-specific profile."""
    user = User.query.get_or_404(user_id)
    data = user.to_dict()

    # Attach role-specific profile
    if user.role == 'participant':
        p = Participant.query.filter_by(user_id=user_id).first()
        if p:
            data['profile'] = {
                'ndis_number': p.ndis_number,
                'plan_number': p.plan_number,
                'date_of_birth': p.date_of_birth.isoformat() if p.date_of_birth else None,
            }
    elif user.role == 'provider':
        p = Provider.query.filter_by(user_id=user_id).first()
        if p:
            data['profile'] = {
                'organisation_name': p.organisation_name,
                'abn': p.abn,
                'service_types': p.service_types,
                'location': p.location,
            }
    elif user.role == 'coordinator':
        p = Coordinator.query.filter_by(user_id=user_id).first()
        if p:
            data['profile'] = {
                'organisation': p.organisation,
                'full_name': p.full_name,
            }

    # Counts
    data['referral_count'] = Referral.query.filter(
        db.or_(
            Referral.participant_id == user_id,
            Referral.provider_id == user_id,
            Referral.coordinator_id == user_id
        )
    ).count()

    return jsonify(data)


@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@admin_required
def update_user_status(user_id):
    """Activate or suspend a user."""
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    if 'is_active' in data:
        user.is_active = bool(data['is_active'])

    db.session.commit()
    return jsonify({'success': True, 'user': user.to_dict()})


@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(user_id):
    """Change a user's role."""
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    new_role = data.get('role')
    valid_roles = ('participant', 'family', 'provider', 'coordinator', 'admin')
    if new_role not in valid_roles:
        return jsonify({'error': f'Invalid role. Must be one of: {valid_roles}'}), 400

    user.role = new_role
    db.session.commit()
    return jsonify({'success': True, 'user': user.to_dict()})


# ─── Referrals ────────────────────────────────────────────────────────────────

@admin_bp.route('/referrals', methods=['GET'])
@admin_required
def list_referrals():
    """List all referrals with filtering."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', '')

    q = Referral.query

    if status:
        q = q.filter(Referral.status == status)

    q = q.order_by(Referral.created_at.desc())
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'referrals': [_referral_dict(r) for r in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


def _referral_dict(r):
    return {
        'id': r.id,
        'status': r.status,
        'participant_id': r.participant_id,
        'provider_id': r.provider_id,
        'coordinator_id': r.coordinator_id,
        'created_at': r.created_at.isoformat() if r.created_at else None,
        'sent_at': r.sent_at.isoformat() if r.sent_at else None,
        'responded_at': r.responded_at.isoformat() if r.responded_at else None,
    }


# ─── One-shot migration runner ────────────────────────────────────────────────
# TODO: REMOVE AFTER USE — one-shot migration to add consent_history and goal_history tables

@admin_bp.route('/migrate-v9', methods=['POST'])
def run_migration_v9():
    """Run migration 009 to create consent_history and goal_history tables. Protected by MIGRATION_SECRET header."""
    import os
    secret = request.headers.get('X-Migration-Secret', '')
    if secret != os.getenv('MIGRATION_SECRET', 'care-exchange-migrate-2026'):
        return jsonify({'error': 'Forbidden'}), 403

    # First verify which tables exist
    from sqlalchemy import text
    try:
        result = db.session.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
        tables = [row[0] for row in result]
        has_consent_history = 'consent_history' in tables
        has_goal_history = 'goal_history' in tables
    except Exception as e:
        return jsonify({'success': False, 'error': f'Cannot query tables: {e}'}), 500

    # If tables already exist, just return success
    if has_consent_history and has_goal_history:
        return jsonify({'success': True, 'message': 'Tables already exist', 'consent_history': True, 'goal_history': True})

    # Run migration
    from flask_migrate import upgrade
    try:
        upgrade()
        # Verify
        result2 = db.session.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
        tables2 = [row[0] for row in result2]
        return jsonify({
            'success': True,
            'message': 'Migration 009 applied',
            'tables_before': tables,
            'tables_after': tables2,
            'consent_history': 'consent_history' in tables2,
            'goal_history': 'goal_history' in tables2,
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ─── Platform Settings ────────────────────────────────────────────────────────

@admin_bp.route('/settings', methods=['GET'])
@admin_required
def get_settings():
    """Return current platform settings."""
    # For now, just return static config. Expand with a PlatformSettings model later.
    return jsonify({
        'platform_name': 'Care Exchange',
        'support_email': 'support@careexchange.com.au',
        'registration_open': True,
        'require_email_verification': True,
        'referral_link_expiry_days': 7,
    })


@admin_bp.route('/settings', methods=['PUT'])
@admin_required
def update_settings():
    """Update platform settings."""
    data = request.get_json() or {}
    # Validate-only for now — persist to a PlatformSettings model when needed
    allowed = {'platform_name', 'support_email', 'registration_open',
                'require_email_verification', 'referral_link_expiry_days'}
    updates = {k: v for k, v in data.items() if k in allowed}
    return jsonify({'success': True, 'updated': updates})
