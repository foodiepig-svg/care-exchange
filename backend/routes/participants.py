from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import User, Participant, Consent

participants_bp = Blueprint('participants', __name__)


@participants_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.role == 'participant':
        participant = Participant.query.filter_by(user_id=user_id).first()
        return jsonify({
            'user': user.to_dict(),
            'participant': participant.to_dict(include_sensitive=True) if participant else None
        })

    return jsonify({'user': user.to_dict()})


@participants_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    user = db.session.get(User, user_id)

    if 'full_name' in data:
        user.full_name = data['full_name']

    participant = Participant.query.filter_by(user_id=user_id).first()
    if participant:
        if 'ndis_number' in data:
            participant.ndis_number = data['ndis_number']
        if 'plan_number' in data:
            participant.plan_number = data['plan_number']
        if 'goals' in data:
            import json
            participant.goals = json.dumps(data['goals'])
        if 'care_plans' in data:
            import json
            participant.care_plans = json.dumps(data['care_plans'])

    db.session.commit()
    return jsonify({'user': user.to_dict()})


@participants_bp.route('/me/care-team', methods=['GET'])
@jwt_required()
def care_team():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if user.role == 'participant':
        participant = Participant.query.filter_by(user_id=user_id).first()
        if not participant:
            return jsonify({'care_team': []})

        # Get all providers and coordinators with active consent
        consents = Consent.query.filter_by(participant_id=participant.id).filter(
            Consent.granted_at.isnot(None),
            Consent.revoked_at.is_(None)
        ).all()

        team = []
        for c in consents:
            granted_to = c.granted_to
            entry = {
                'user_id': granted_to.id,
                'full_name': granted_to.full_name,
                'role': granted_to.role,
                'data_categories': c.data_categories,
            }
            if granted_to.provider:
                entry['organisation_name'] = granted_to.provider.organisation_name
            if granted_to.coordinator:
                entry['organisation'] = granted_to.coordinator.organisation
            team.append(entry)

        return jsonify({'care_team': team})

    return jsonify({'care_team': []})


@participants_bp.route('/me/consent', methods=['POST'])
@jwt_required()
def grant_consent():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if user.role != 'participant':
        return jsonify({'error': 'Only participants can grant consent'}), 403

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant:
        return jsonify({'error': 'Participant profile not found'}), 404

    data = request.get_json()
    granted_to_id = data.get('granted_to_id')
    data_categories = data.get('data_categories', [])

    if not granted_to_id or not data_categories:
        return jsonify({'error': 'granted_to_id and data_categories are required'}), 400

    import json
    consent = Consent(
        participant_id=participant.id,
        granted_to_id=granted_to_id,
        data_categories=json.dumps(data_categories)
    )
    db.session.add(consent)
    db.session.commit()

    return jsonify({'consent': consent.to_dict()}), 201
