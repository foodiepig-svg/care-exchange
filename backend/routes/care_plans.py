from datetime import datetime
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import CarePlan, Participant, User

care_plans_bp = Blueprint('care_plans', __name__)

VALID_STATUSES = {'draft', 'active', 'completed', 'on_hold'}

def _parse_date(val):
    if val is None:
        return None
    if isinstance(val, str) and len(val) == 10:
        return datetime.strptime(val, '%Y-%m-%d').date()
    return val


@care_plans_bp.route('', methods=['GET'])
@jwt_required()
def list_care_plans():
    user_id = int(get_jwt_identity())
    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    status_filter = request.args.get('status')
    query = CarePlan.query.filter_by(participant_id=participant.id)
    if status_filter and status_filter in VALID_STATUSES:
        query = query.filter_by(status=status_filter)
    plans = query.order_by(CarePlan.created_at.desc()).all()
    return jsonify({'care_plans': [p.to_dict() for p in plans]})


@care_plans_bp.route('', methods=['POST'])
@jwt_required()
def create_care_plan():
    user_id = int(get_jwt_identity())
    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    data = request.get_json()
    if not data.get('title'):
        return jsonify({'error': 'title is required'}), 400

    import json
    supports = None
    if data.get('supports'):
        supports = json.dumps(data['supports'])

    care_plan = CarePlan(
        participant_id=participant.id,
        title=data['title'],
        description=data.get('description'),
        start_date=_parse_date(data.get('start_date')),
        end_date=_parse_date(data.get('end_date')),
        status='draft' if data.get('status') == 'draft' else 'active',
        supports=supports,
        review_notes=data.get('review_notes'),
        created_by_id=user_id,
    )
    db.session.add(care_plan)
    db.session.commit()

    return jsonify({'care_plan': care_plan.to_dict()}), 201


@care_plans_bp.route('/<int:plan_id>', methods=['GET'])
@jwt_required()
def get_care_plan(plan_id):
    user_id = int(get_jwt_identity())
    plan = db.session.get(CarePlan, plan_id)
    if not plan:
        return jsonify({'error': 'Care plan not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or plan.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify({'care_plan': plan.to_dict()})


@care_plans_bp.route('/<int:plan_id>', methods=['PUT'])
@jwt_required()
def update_care_plan(plan_id):
    user_id = int(get_jwt_identity())
    plan = db.session.get(CarePlan, plan_id)
    if not plan:
        return jsonify({'error': 'Care plan not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or plan.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    data = request.get_json()
    import json
    if 'title' in data:
        plan.title = data['title']
    if 'description' in data:
        plan.description = data['description']
    if 'start_date' in data:
        plan.start_date = _parse_date(data['start_date'])
    if 'end_date' in data:
        plan.end_date = _parse_date(data['end_date'])
    if 'status' in data:
        plan.status = data['status'] if data['status'] in VALID_STATUSES else plan.status
    if 'supports' in data:
        plan.supports = json.dumps(data['supports'])
    if 'review_notes' in data:
        plan.review_notes = data['review_notes']

    db.session.commit()
    return jsonify({'care_plan': plan.to_dict()})


@care_plans_bp.route('/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_care_plan(plan_id):
    user_id = int(get_jwt_identity())
    plan = db.session.get(CarePlan, plan_id)
    if not plan:
        return jsonify({'error': 'Care plan not found'}), 404

    participant = Participant.query.filter_by(user_id=user_id).first()
    if not participant or plan.participant_id != participant.id:
        return jsonify({'error': 'Forbidden'}), 403

    db.session.delete(plan)
    db.session.commit()
    return jsonify({'message': 'Care plan deleted'}), 200
