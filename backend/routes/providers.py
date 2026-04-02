from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Provider, User

providers_bp = Blueprint('providers', __name__)


@providers_bp.route('', methods=['GET'])
@jwt_required()
def list_providers():
    """List all providers, optionally filtered by search query."""
    search = request.args.get('search', '').strip()
    query = Provider.query.join(User).filter(User.role == 'provider')
    if search:
        query = query.filter(
            Provider.organisation_name.ilike(f'%{search}%') |
            Provider.service_types.ilike(f'%{search}%')
        )
    providers = query.order_by(Provider.created_at.desc()).all()
    return jsonify({
        'providers': [p.to_dict() for p in providers]
    })


@providers_bp.route('/<int:provider_id>', methods=['GET'])
@jwt_required()
def get_provider(provider_id):
    """Get a single provider's details."""
    provider = db.session.get(Provider, provider_id) or db.session.execute(
        db.select(Provider).where(Provider.user_id == provider_id)
    ).scalar_or_none()
    if not provider:
        return jsonify({'error': 'Provider not found'}), 404
    return jsonify({'provider': provider.to_dict()})
