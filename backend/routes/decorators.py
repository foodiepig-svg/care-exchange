"""Route decorators for authentication and authorization."""
from functools import wraps
from flask import request, jsonify, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User


def token_required(f):
    """Decorator that requires a valid JWT token. Sets current_user as first arg."""
    @wraps(f)
    def decorated(*args, **kwargs):
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 403
        g.current_user = user
        return f(user, *args, **kwargs)
    return decorated


def role_required(*allowed_roles):
    """Decorator that requires the current user to have one of the allowed roles.
    Must be used after @token_required (or @jwt_required).
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, 'current_user') or g.current_user is None:
                return jsonify({'error': 'Authentication required'}), 401
            if g.current_user.role not in allowed_roles:
                return jsonify({'error': f'Access denied. Required role: {", ".join(allowed_roles)}'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
