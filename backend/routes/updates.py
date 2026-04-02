from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Update, Referral, User

updates_bp = Blueprint('updates', __name__)

VALID_CATEGORIES = ['progress_note', 'incident', 'medication_change', 'goal_update', 'general']


@updates_bp.route('', methods=['POST'])
@jwt_required()
def create_update():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    data = request.get_json()

    referral_id = data.get('referral_id')
    category = data.get('category', 'general')
    summary = data.get('summary', '')
    observations = data.get('observations', '')
    recommendations = data.get('recommendations', '')
    time_spent = data.get('time_spent_minutes')

    if not referral_id or not summary:
        return jsonify({'error': 'referral_id and summary are required'}), 400

    if category not in VALID_CATEGORIES:
        return jsonify({'error': f'category must be one of: {", ".join(VALID_CATEGORIES)}'}), 400

    update = Update(
        referral_id=referral_id,
        author_id=user_id,
        category=category,
        summary=summary,
        observations=observations,
        recommendations=recommendations,
        time_spent_minutes=time_spent
    )
    db.session.add(update)
    db.session.commit()

    return jsonify({'update': update.to_dict()}), 201


@updates_bp.route('', methods=['GET'])
@jwt_required()
def list_updates():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    referral_id = request.args.get('referral_id', type=int)

    if referral_id:
        updates = Update.query.filter_by(referral_id=referral_id).order_by(Update.created_at.desc()).all()
    else:
        updates = Update.query.join(Referral).filter(
            (Referral.participant_id == user.participant.id) |
            (Referral.provider_id == user.provider.id if user.role == 'provider' else False)
        ).order_by(Update.created_at.desc()).all() if user.role in ('participant', 'provider') else []

    return jsonify({'updates': [u.to_dict() for u in updates]})


@updates_bp.route('/<int:update_id>', methods=['GET'])
@jwt_required()
def get_update(update_id):
    update = db.session.get(Update, update_id) or abort(404)
    return jsonify({'update': update.to_dict()})
