from datetime import datetime
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Goal, Participant, User

goals_bp = Blueprint('goals', __name__)

VALID_CATEGORIES = {'daily_living', 'social', 'health', 'employment', 'education', 'transport', 'other'}
VALID_STATUSES = {'active', 'completed', 'paused', 'discontinued'}

def _parse_date(val):
    if val is None:
        return None
    if isinstance(val, str) and len(val) == 10:
        return datetime.strptime(val, '%Y-%m-%d').date()
    return val


@goals_bp.route('', methods=['GET'])
@jwt_required()
def list_goals():
    user_id = int(get_jwt_identity())
    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    goals = Goal.query.filter_by(participant_id=participant.id).order_by(Goal.created_at.desc()).all()
    return jsonify({'goals': [g.to_dict() for g in goals]})


@goals_bp.route('', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = int(get_jwt_identity())
    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    data = request.get_json()
    if not data.get('title'):
        return jsonify({'error': 'title is required'}), 400

    goal = Goal(
        participant_id=participant.id,
        title=data['title'],
        description=data.get('description'),
        category=data.get('category') if data.get('category') in VALID_CATEGORIES else None,
        target_date=_parse_date(data.get('target_date')),
        status='active',
        progress=0,
        created_by_id=user_id,
    )
    db.session.add(goal)
    db.session.commit()

    return jsonify({'goal': goal.to_dict()}), 201


@goals_bp.route('/<int:goal_id>', methods=['GET'])
@jwt_required()
def get_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = db.session.get(Goal, goal_id)
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or goal.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify({'goal': goal.to_dict()})


@goals_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = db.session.get(Goal, goal_id)
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or goal.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    data = request.get_json()
    if 'title' in data:
        goal.title = data['title']
    if 'description' in data:
        goal.description = data['description']
    if 'category' in data:
        goal.category = data['category'] if data['category'] in VALID_CATEGORIES else goal.category
    if 'target_date' in data:
        goal.target_date = data['target_date']
    if 'status' in data:
        goal.status = data['status'] if data['status'] in VALID_STATUSES else goal.status
    if 'progress' in data:
        goal.progress = max(0, min(100, int(data['progress'])))

    db.session.commit()
    return jsonify({'goal': goal.to_dict()})


@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = db.session.get(Goal, goal_id)
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or goal.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    db.session.delete(goal)
    db.session.commit()
    return jsonify({'message': 'Goal deleted'}), 200


@goals_bp.route('/<int:goal_id>/progress', methods=['PATCH'])
@jwt_required()
def update_progress(goal_id):
    user_id = int(get_jwt_identity())
    goal = db.session.get(Goal, goal_id)
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or goal.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    data = request.get_json()
    progress = data.get('progress')
    if progress is None:
        return jsonify({'error': 'progress is required'}), 400

    goal.progress = max(0, min(100, int(progress)))
    if goal.progress == 100:
        goal.status = 'completed'
    db.session.commit()
    return jsonify({'goal': goal.to_dict()})
