from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import User, Referral, Participant, Provider, Update, Message, Thread
import secrets
from datetime import datetime

referrals_bp = Blueprint('referrals', __name__)


def generate_referral_token():
    return secrets.token_urlsafe(32)


@referrals_bp.route('', methods=['POST'])
@jwt_required()
def create_referral():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    data = request.get_json()

    participant_id = data.get('participant_id')
    provider_id = data.get('provider_id')
    provider_email = data.get('provider_email')
    referral_reason = data.get('referral_reason', '')
    urgency = data.get('urgency', 'normal')

    if not participant_id:
        return jsonify({'error': 'participant_id is required'}), 400

    if not provider_id and provider_email:
        provider_user = User.query.filter_by(email=provider_email, role='provider').first()
        if not provider_user:
            return jsonify({'error': 'Provider not found'}), 404
        provider = Provider.query.filter_by(user_id=provider_user.id).first()
        if not provider:
            return jsonify({'error': 'Provider profile not found'}), 404
        provider_id = provider.id
    elif not provider_id:
        return jsonify({'error': 'provider_id or provider_email is required'}), 400

    referral = Referral(
        participant_id=participant_id,
        provider_id=provider_id,
        coordinator_id=user.coordinator.id if user.role == 'coordinator' and user.coordinator else None,
        referral_reason=referral_reason,
        urgency=urgency,
        referral_link_token=generate_referral_token(),
        status='sent',
        sent_at=datetime.utcnow()
    )
    db.session.add(referral)
    db.session.commit()

    return jsonify({'referral': referral.to_dict()}), 201


@referrals_bp.route('', methods=['GET'])
@jwt_required()
def list_referrals():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if user.role == 'participant':
        participant = Participant.query.filter_by(user_id=user_id).first()
        referrals = Referral.query.filter_by(participant_id=participant.id).all()
    elif user.role == 'provider':
        provider = Provider.query.filter_by(user_id=user_id).first()
        referrals = Referral.query.filter_by(provider_id=provider.id).all()
    elif user.role == 'coordinator':
        referrals = Referral.query.filter_by(coordinator_id=user.coordinator.id).all()
    else:
        return jsonify({'referrals': []})

    return jsonify({'referrals': [r.to_dict() for r in referrals]})


@referrals_bp.route('/<int:referral_id>', methods=['GET'])
@jwt_required()
def get_referral(referral_id):
    referral = db.session.get(Referral, referral_id) or abort(404)
    return jsonify({'referral': referral.to_dict()})


@referrals_bp.route('/<int:referral_id>/status', methods=['PUT'])
@jwt_required()
def update_status(referral_id):
    referral = db.session.get(Referral, referral_id) or abort(404)
    data = request.get_json()
    new_status = data.get('status')

    valid_transitions = {
        'draft': ['sent'],
        'sent': ['viewed'],
        'viewed': ['accepted', 'declined'],
        'accepted': ['active', 'on_hold'],
        'active': ['on_hold', 'completed'],
        'on_hold': ['active', 'completed'],
    }

    if new_status in valid_transitions.get(referral.status, []):
        referral.status = new_status
        if new_status in ('accepted', 'declined'):
            referral.responded_at = datetime.utcnow()
        db.session.commit()

    return jsonify({'referral': referral.to_dict()})


@referrals_bp.route('/link/<token>', methods=['GET'])
def get_referral_by_token(token):
    referral = Referral.query.filter_by(referral_link_token=token).first()
    if not referral:
        return jsonify({'error': 'Referral not found or link has expired'}), 404
    return jsonify({'referral': referral.to_dict()})


@referrals_bp.route('/<int:referral_id>/timeline', methods=['GET'])
@jwt_required()
def get_referral_timeline(referral_id):
    referral = db.session.get(Referral, referral_id) or abort(404)
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    # Build timeline from status changes and updates
    timeline = []
    if referral.sent_at:
        timeline.append({'type': 'status', 'status': 'sent', 'at': referral.sent_at.isoformat(), 'label': 'Referral sent'})
    if referral.responded_at:
        timeline.append({'type': 'status', 'status': referral.status, 'at': referral.responded_at.isoformat(), 'label': f'Responded ({referral.status})'})
    if referral.completed_at:
        timeline.append({'type': 'status', 'status': 'completed', 'at': referral.completed_at.isoformat(), 'label': 'Referral completed'})

    # Add updates
    updates = Update.query.filter_by(referral_id=referral_id).order_by(Update.created_at.asc()).all()
    for u in updates:
        timeline.append({'type': 'update', 'at': u.created_at.isoformat(), 'summary': u.summary, 'category': u.category})

    # Add messages count
    threads = Thread.query.filter_by(participant_id=referral.participant_id).all()
    timeline.append({'type': 'messages', 'count': sum(len(t.messages) for t in threads)})

    timeline.sort(key=lambda x: x.get('at', ''))
    return jsonify({'timeline': timeline})


@referrals_bp.route('/<int:referral_id>/messages', methods=['GET'])
@jwt_required()
def get_referral_messages(referral_id):
    referral = db.session.get(Referral, referral_id) or abort(404)
    threads = Thread.query.filter_by(participant_id=referral.participant_id).all()
    result = []
    for t in threads:
        msgs = Message.query.filter_by(thread_id=t.id).order_by(Message.sent_at.asc()).all()
        t_dict = t.to_dict()
        t_dict['messages'] = [m.to_dict() for m in msgs]
        result.append(t_dict)
    return jsonify({'threads': result})


@referrals_bp.route('/<int:referral_id>/updates', methods=['GET'])
@jwt_required()
def get_referral_updates(referral_id):
    referral = db.session.get(Referral, referral_id) or abort(404)
    updates = Update.query.filter_by(referral_id=referral_id).order_by(Update.created_at.desc()).all()
    return jsonify({'updates': [u.to_dict() for u in updates]})
