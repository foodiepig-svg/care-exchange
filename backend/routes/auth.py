from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from models import User, Participant, Provider, Coordinator
import re

auth_bp = Blueprint('auth', __name__)

VALID_ROLES = ['participant', 'family', 'provider', 'coordinator']

@auth_bp.errorhandler(Exception)
def handle_auth_error(e):
    import traceback
    return {'error': 'Internal error', 'details': str(e), 'trace': traceback.format_exc()[-800:]}, 500



def validate_email(email):
    return bool(re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email))


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    role = data.get('role', '')

    if not all([email, password, full_name, role]):
        return jsonify({'error': 'All fields are required'}), 400

    if not validate_email(email):
        return jsonify({'error': 'Invalid email address'}), 400

    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if role not in VALID_ROLES:
        return jsonify({'error': f'Role must be one of: {", ".join(VALID_ROLES)}'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists'}), 409

    try:
        user = User(email=email, full_name=full_name, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        # Create role-specific profile
        if role == 'participant':
            p = Participant(user_id=user.id)
            db.session.add(p)
        elif role == 'provider':
            org_name = data.get('organisation_name', '')
            abn = data.get('abn', '')
            p = Provider(user_id=user.id, organisation_name=org_name or full_name, abn=abn)
            db.session.add(p)
        elif role == 'coordinator':
            org = data.get('organisation', '')
            c = Coordinator(user_id=user.id, full_name=full_name, organisation=org)
            db.session.add(c)

        db.session.commit()
    except Exception as e:
        import traceback
        db.session.rollback()
        return {'error': f'DB error: {str(e)}', 'tb': traceback.format_exc()[-1000:]}, 500

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not all([email, password]):
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    })


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'access_token': access_token})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request a password reset email."""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        # Generate a secure reset token (in production, send email)
        import secrets, hashlib
        token = secrets.token_urlsafe(32)
        user.reset_token = hashlib.sha256(token.encode()).hexdigest()
        user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        # In production: send email with reset link
        # For now, we return the token in the response for testing
        print(f"[DEV] Password reset token for {email}: {token}", flush=True)

    # Always return 200 to prevent email enumeration
    return jsonify({'message': 'If that email exists, a reset link has been sent'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using a token."""
    data = request.get_json()
    token = data.get('token', '').strip()
    new_password = data.get('new_password', '')

    if not token or not new_password:
        return jsonify({'error': 'token and new_password are required'}), 400

    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    import hashlib
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    user = User.query.filter_by(reset_token=token_hash).first()
    if not user:
        return jsonify({'error': 'Invalid or expired token'}), 400

    if user.reset_token_expires_at and user.reset_token_expires_at < datetime.utcnow():
        return jsonify({'error': 'Token has expired'}), 400

    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.session.commit()

    return jsonify({'message': 'Password has been reset successfully'}), 200
