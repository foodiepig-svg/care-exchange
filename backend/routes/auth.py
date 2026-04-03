from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from models import User, Participant, Provider, Coordinator
import re
import secrets

auth_bp = Blueprint('auth', __name__)

VALID_ROLES = ['participant', 'family', 'provider', 'coordinator']


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
        
        # Generate email verification token (24 hour expiry)
        user.verification_token = secrets.token_urlsafe(32)
        user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
        user.email_verified = False
        
        db.session.add(user)
        db.session.flush()
    except Exception as e:
        import traceback
        db.session.rollback()
        return {'error': f'DB error creating user: {str(e)}', 'tb': traceback.format_exc()[-500:]}, 500

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

    # Send verification email
    try:
        from services.email_service import EmailService
        EmailService.send_verification_email(user)
    except Exception as e:
        print(f"[WARN] Failed to send verification email: {e}", flush=True)
        # Don't fail registration if email fails

    # NOTE: We do NOT auto-login unverified users
    # Frontend should show "Check your email to verify your account" message
    return jsonify({
        'message': 'Registration successful. Please check your email to verify your account.',
        'email': user.email,
        'requires_verification': True
    }), 201


@auth_bp.route('/verify/<token>', methods=['GET'])
def verify_email(token):
    """Verify email address using token from verification email."""
    user = User.query.filter_by(verification_token=token).first()
    
    if not user:
        return jsonify({'error': 'Invalid verification token'}), 400
    
    if user.email_verified:
        return jsonify({'message': 'Email already verified. You can log in.'}), 200
    
    if user.verification_token_expires and user.verification_token_expires < datetime.utcnow():
        return jsonify({'error': 'Verification token has expired. Please request a new one.'}), 400
    
    # Mark email as verified
    user.email_verified = True
    user.verified_at = datetime.utcnow()
    user.verification_token = None
    user.verification_token_expires = None
    db.session.commit()
    
    return jsonify({
        'message': 'Email verified successfully! You can now log in.',
        'email_verified': True
    }), 200


@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification email for unverified users."""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # Always return success to prevent email enumeration
        return jsonify({'message': 'If that email exists and is unverified, a verification email has been sent'}), 200
    
    if user.email_verified:
        return jsonify({'message': 'This email is already verified. You can log in.'}), 200
    
    # Generate new verification token
    user.verification_token = secrets.token_urlsafe(32)
    user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
    db.session.commit()
    
    try:
        from services.email_service import EmailService
        EmailService.send_verification_email(user)
    except Exception as e:
        print(f"[WARN] Failed to resend verification email: {e}", flush=True)
        return jsonify({'error': 'Failed to send verification email. Please try again.'}), 500
    
    return jsonify({'message': 'Verification email sent. Please check your inbox.'}), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
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

        # Check if email is verified
        if not user.email_verified:
            # Skip verification check in test/development environments (e2e tests)
            if os.environ.get('FLASK_ENV') not in ('test', 'development'):
                return jsonify({
                    'error': 'Email not verified. Please check your inbox for the verification link, or request a new one.',
                    'email_not_verified': True
                }), 403

        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        return jsonify({
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        })
    except Exception as e:
        import traceback
        return jsonify({'login_error': str(e), 'trace': traceback.format_exc()}), 500


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
    # NOTE: For sensitive endpoints, you may want to require email verification:
    # if not user.email_verified:
    #     return jsonify({'error': 'Email not verified', 'email_verified': False}), 403
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
        import hashlib
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


# DEBUG
@auth_bp.route('/debug/provider_create', methods=['POST'])
@jwt_required()
def debug_provider_create():
    user_id = int(get_jwt_identity())
    from models import Provider
    from app import db
    try:
        p = Provider(user_id=user_id, organisation_name='Debug Org')
        db.session.add(p)
        db.session.commit()
        return {'ok': True, 'provider_id': p.id}
    except Exception as e:
        import traceback
        db.session.rollback()
        return {'error': str(e), 'tb': traceback.format_exc()}, 500


@auth_bp.route('/debug/test_provider', methods=['POST'])
def debug_test_provider():
    from models import User, Provider
    from app import db
    import traceback
    data = request.get_json()
    email = data.get('email', 'test@test.com')
    org = data.get('organisation_name', 'Test Org')
    try:
        # Create user directly
        u = User(email=email, full_name='Test', role='provider')
        u.set_password('Test@123')
        db.session.add(u)
        db.session.flush()
        # Create provider
        p = Provider(user_id=u.id, organisation_name=org)
        db.session.add(p)
        db.session.flush()
        db.session.commit()
        return {'ok': True, 'user_id': u.id, 'provider_id': p.id}
    except Exception as e:
        db.session.rollback()
        return {'error': str(e), 'type': type(e).__name__, 'tb': traceback.format_exc()}, 500


@auth_bp.route('/debug/verify_email', methods=['POST'])
def debug_verify_email():
    """Test-only: mark a user's email as verified without clicking the link."""
    import traceback
    from models import User
    from app import db
    try:
        data = request.get_json(silent=True) or {}
        email = data.get('email')
        if not email:
            return {'error': 'email required'}, 400
        user = User.query.filter_by(email=email).first()
        if not user:
            return {'error': 'User not found'}, 404
        user.email_verified = True
        user.verification_token = None
        user.verification_token_expires = None
        db.session.commit()
        return {'ok': True, 'email': email}
    except Exception as e:
        db.session.rollback()
        return {'error': str(e)}, 500
