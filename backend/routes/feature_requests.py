from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import FeatureRequest, FeatureVote, User

feature_bp = Blueprint('feature_requests', __name__)


@feature_bp.route('', methods=['GET'])
@jwt_required()
def list_requests():
    """List all feature requests, sorted by vote count."""
    requests = FeatureRequest.query.order_by(FeatureRequest.created_at.desc()).all()
    user_id = get_jwt_identity()
    return jsonify({
        'requests': [r.to_dict(user_id=user_id) for r in requests]
    })


@feature_bp.route('', methods=['POST'])
@jwt_required()
def create_request():
    """Submit a new feature request."""
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()
    category = data.get('category', 'other')

    if not title or not description:
        return jsonify({'error': 'Title and description are required'}), 400

    fr = FeatureRequest(
        user_id=get_jwt_identity(),
        title=title[:200],
        description=description,
        category=category if category in ('participant', 'provider', 'coordinator', 'family', 'admin', 'other') else 'other',
    )
    db.session.add(fr)
    db.session.commit()
    return jsonify({'request': fr.to_dict(user_id=fr.user_id)}), 201


@feature_bp.route('/<int:request_id>/vote', methods=['POST'])
@jwt_required()
def vote(request_id):
    """Toggle a vote on a feature request."""
    user_id = get_jwt_identity()
    fr = db.session.get(FeatureRequest, request_id)
    if not fr:
        return jsonify({'error': 'Not found'}), 404

    existing = FeatureVote.query.filter_by(
        feature_request_id=request_id, user_id=user_id
    ).first()

    if existing:
        db.session.delete(existing)
        action = 'removed'
    else:
        db.session.add(FeatureVote(feature_request_id=request_id, user_id=user_id))
        action = 'added'

    db.session.commit()
    return jsonify({
        'vote_count': fr.vote_count(),
        'has_voted': action == 'added',
        'action': action,
    })


# ── Admin-only ──────────────────────────────────────────────

@feature_bp.route('/<int:request_id>/status', methods=['PUT'])
@jwt_required()
def update_status(request_id):
    """Update status of a feature request (admin only)."""
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403

    fr = db.session.get(FeatureRequest, request_id)
    if not fr:
        return jsonify({'error': 'Not found'}), 404

    data = request.get_json() or {}
    status = data.get('status')
    if status in ('open', 'planned', 'in_progress', 'completed', 'declined'):
        fr.status = status

    db.session.commit()
    return jsonify({'request': fr.to_dict(user_id=user_id)})


@feature_bp.route('/<int:request_id>', methods=['DELETE'])
@jwt_required()
def delete_request(request_id):
    """Delete a feature request (admin or author)."""
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    fr = db.session.get(FeatureRequest, request_id)
    if not fr:
        return jsonify({'error': 'Not found'}), 404

    if user.role != 'admin' and fr.user_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403

    db.session.delete(fr)
    db.session.commit()
    return '', 204
