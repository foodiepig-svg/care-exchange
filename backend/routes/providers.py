from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from app import db
from models import Provider, User
import json as _json

providers_bp = Blueprint('providers', __name__)


def _search_providers(query, search):
    """Apply search filters to a provider query."""
    term = f'%{search}%'
    return query.filter(
        or_(
            Provider.organisation_name.ilike(term),
            Provider.location.ilike(term),
            Provider.abn.ilike(term),
        )
    )


@providers_bp.route('', methods=['GET'])
@jwt_required()
def list_providers():
    """List all providers, optionally filtered by search query."""
    search = request.args.get('search', '').strip()
    query = Provider.query.join(User).filter(User.role == 'provider')

    if search:
        # Search name, location, ABN directly
        query = _search_providers(query, search)

        # Also search inside service_types JSON array
        # We do this in Python after fetching so we handle JSON parsing properly
        all_providers = query.all()
        providers = [
            p for p in all_providers
            if any(
                search.lower() in svc.lower()
                for svc in (p.service_types or [])
            )
        ]
    else:
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
