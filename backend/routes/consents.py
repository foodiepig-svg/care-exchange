from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Consent, Participant, User
import json

consents_bp = Blueprint('consents', __name__)


@consents_bp.route('', methods=['GET'])
@jwt_required()
def list_consents():
    """List all consents granted BY the current participant."""
    user_id = int(get_jwt_identity())
    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    consents = Consent.query.filter_by(participant_id=participant.id).all()
    return jsonify({'consents': [c.to_dict() for c in consents]})


@consents_bp.route('', methods=['POST'])
@jwt_required()
def grant_consent():
    """Grant a provider/coordinator access to specific data categories."""
    user_id = int(get_jwt_identity())
    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    data = request.get_json()
    granted_to_id = data.get('granted_to_id')
    data_categories = data.get('data_categories', [])

    if not granted_to_id:
        return jsonify({'error': 'granted_to_id is required'}), 400
    if not isinstance(data_categories, list) or not data_categories:
        return jsonify({'error': 'data_categories must be a non-empty list'}), 400

    valid = {'care_plans', 'goals', 'progress_notes', 'documents', 'messages'}
    invalid = [c for c in data_categories if c not in valid]
    if invalid:
        return jsonify({'error': f'Invalid categories: {invalid}. Valid: {list(valid)}'}), 400

    # Check if consent already exists for this granted_to_id
    existing = Consent.query.filter_by(
        participant_id=participant.id,
        granted_to_id=granted_to_id
    ).first()
    if existing:
        # Update existing consent
        existing.data_categories = json.dumps(data_categories)
        existing.granted_at = datetime.utcnow()
        existing.revoked_at = None
        db.session.commit()
        return jsonify({'consent': existing.to_dict()}), 200

    consent = Consent(
        participant_id=participant.id,
        granted_to_id=granted_to_id,
        data_categories=json.dumps(data_categories),
        granted_at=datetime.utcnow(),
        expires_at=data.get('expires_at'),
    )
    db.session.add(consent)
    db.session.commit()
    return jsonify({'consent': consent.to_dict()}), 201


@consents_bp.route('/<int:consent_id>', methods=['GET'])
@jwt_required()
def get_consent(consent_id):
    user_id = int(get_jwt_identity())
    consent = db.session.get(Consent, consent_id)
    if not consent:
        return jsonify({'error': 'Consent not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or consent.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify({'consent': consent.to_dict()})


@consents_bp.route('/<int:consent_id>', methods=['DELETE'])
@jwt_required()
def revoke_consent(consent_id):
    """Revoke a previously granted consent."""
    user_id = int(get_jwt_identity())
    consent = db.session.get(Consent, consent_id)
    if not consent:
        return jsonify({'error': 'Consent not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or consent.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    consent.revoked_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'consent': consent.to_dict()})
