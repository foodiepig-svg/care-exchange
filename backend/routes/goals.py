from datetime import datetime
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Goal, Participant, User, GoalHistory

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
    history = GoalHistory(
        goal_id=goal.id,
        participant_id=participant.id,
        actor_id=user_id,
        action='created',
        new_value=f"Goal: {goal.title}",
    )
    db.session.add(history)
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

    # Capture old values before any changes
    old_title = goal.title
    old_description = goal.description
    old_category = goal.category
    old_target_date = str(goal.target_date) if goal.target_date else None
    old_status = goal.status
    old_progress = goal.progress

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

    # Log history for any changes
    changes = []
    if 'title' in data and data['title'] != old_title:
        changes.append(('title', old_title, data['title']))
    if 'description' in data and data['description'] != old_description:
        changes.append(('description', old_description, data['description']))
    if 'category' in data and data.get('category') in VALID_CATEGORIES and data['category'] != old_category:
        changes.append(('category', old_category, data['category']))
    if 'target_date' in data and data['target_date'] != old_target_date:
        changes.append(('target_date', old_target_date, data['target_date']))
    if 'status' in data and data['status'] in VALID_STATUSES and data['status'] != old_status:
        changes.append(('status', old_status, data['status']))
    if 'progress' in data:
        new_progress = max(0, min(100, int(data['progress'])))
        if new_progress != old_progress:
            changes.append(('progress', str(old_progress), str(new_progress)))

    for field, old_val, new_val in changes:
        h = GoalHistory(
            goal_id=goal.id,
            participant_id=goal.participant_id,
            actor_id=user_id,
            action='progress_updated' if field == 'progress' else ('status_changed' if field == 'status' else 'details_updated'),
            field_changed=field,
            old_value=str(old_val) if old_val is not None else None,
            new_value=str(new_val) if new_val is not None else None,
        )
        db.session.add(h)
    if changes:
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

    h = GoalHistory(
        goal_id=goal.id,
        participant_id=goal.participant_id,
        actor_id=user_id,
        action='deleted',
        old_value=f"Goal: {goal.title} (progress: {goal.progress}%)",
    )
    db.session.add(h)
    db.session.commit()
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

    original_progress = goal.progress
    goal.progress = max(0, min(100, int(progress)))
    if goal.progress == 100:
        goal.status = 'completed'

    h = GoalHistory(
        goal_id=goal.id,
        participant_id=goal.participant_id,
        actor_id=user_id,
        action='progress_updated',
        field_changed='progress',
        old_value=str(original_progress),
        new_value=str(goal.progress),
    )
    db.session.add(h)
    db.session.commit()
    return jsonify({'goal': goal.to_dict()})


@goals_bp.route('/<int:goal_id>/history', methods=['GET'])
@jwt_required()
def get_goal_history(goal_id):
    """Get history of all changes to a specific goal."""
    user_id = int(get_jwt_identity())
    goal = db.session.get(Goal, goal_id)
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or goal.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    history = GoalHistory.query.filter_by(goal_id=goal_id)\
        .order_by(GoalHistory.created_at.desc()).all()
    return jsonify({'history': [h.to_dict() for h in history]})
