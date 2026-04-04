"""
Ticket API routes — user-facing and admin.
User routes: list own, create, get, add comment.
Admin routes: list all, update status/priority, add admin comment.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.user import User
from models.ticket import Ticket, TicketComment
from datetime import datetime

ticket_bp = Blueprint('tickets', __name__)


# ─── User Routes ───────────────────────────────────────────────────────────────

@ticket_bp.route('/tickets', methods=['GET'])
@jwt_required()
def list_tickets():
    """List tickets for the current user."""
    user_id = int(get_jwt_identity())
    tickets = Ticket.query.filter_by(user_id=user_id).order_by(Ticket.created_at.desc()).all()
    return jsonify({'tickets': [t.to_dict() for t in tickets]})


@ticket_bp.route('/tickets', methods=['POST'])
@jwt_required()
def create_ticket():
    """Create a new ticket."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    type_ = data.get('type', 'issue')

    if not title or not description:
        return jsonify({'error': 'Title and description are required'}), 400
    if type_ not in ('issue', 'feature'):
        return jsonify({'error': 'Type must be issue or feature'}), 400

    ticket = Ticket(
        user_id=user_id,
        title=title,
        description=description,
        type=type_,
        status='open',
        priority='low',
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify({'ticket': ticket.to_dict()}), 201


@ticket_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket(ticket_id):
    """Get a ticket with comments. Users can only view their own."""
    user_id = int(get_jwt_identity())
    ticket = Ticket.query.get_or_404(ticket_id)
    if ticket.user_id != user_id:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'ticket': ticket.to_dict(include_comments=True)})


@ticket_bp.route('/tickets/<int:ticket_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(ticket_id):
    """Add a comment to a ticket. User must own the ticket."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    ticket = Ticket.query.get_or_404(ticket_id)

    if ticket.user_id != user_id:
        return jsonify({'error': 'Not found'}), 404

    data = request.get_json() or {}
    comment_text = data.get('comment', '').strip()
    if not comment_text:
        return jsonify({'error': 'Comment is required'}), 400

    comment = TicketComment(
        ticket_id=ticket_id,
        author_id=user_id,
        author_role=user.role,
        comment=comment_text,
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({'comment': comment.to_dict()}), 201


# ─── Admin Routes ─────────────────────────────────────────────────────────────

@ticket_bp.route('/admin/tickets', methods=['GET'])
@jwt_required()
def admin_list_tickets():
    """List all tickets with optional filters."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    type_ = request.args.get('type', '')
    status = request.args.get('status', '')
    priority = request.args.get('priority', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    q = Ticket.query
    if type_:
        q = q.filter(Ticket.type == type_)
    if status:
        q = q.filter(Ticket.status == status)
    if priority:
        q = q.filter(Ticket.priority == priority)

    q = q.order_by(Ticket.created_at.desc())
    paginated = q.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'tickets': [t.to_dict() for t in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page,
    })


@ticket_bp.route('/admin/tickets/<int:ticket_id>', methods=['GET'])
@jwt_required()
def admin_get_ticket(ticket_id):
    """Admin: get ticket detail with full comment history."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    ticket = Ticket.query.get_or_404(ticket_id)
    return jsonify({'ticket': ticket.to_dict(include_comments=True)})


@ticket_bp.route('/admin/tickets/<int:ticket_id>', methods=['PATCH'])
@jwt_required()
def admin_update_ticket(ticket_id):
    """Admin: update status and/or priority."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json() or {}

    valid_statuses = ('open', 'triaged', 'in_progress', 'resolved', 'closed')
    valid_priorities = ('low', 'medium', 'high')

    if 'status' in data:
        new_status = data['status']
        if new_status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
        ticket.status = new_status
        if new_status == 'resolved':
            ticket.resolved_at = datetime.utcnow()

    if 'priority' in data:
        new_priority = data['priority']
        if new_priority not in valid_priorities:
            return jsonify({'error': f'Invalid priority. Must be one of: {valid_priorities}'}), 400
        ticket.priority = new_priority

    db.session.commit()
    return jsonify({'ticket': ticket.to_dict()})


@ticket_bp.route('/admin/tickets/<int:ticket_id>/comments', methods=['POST'])
@jwt_required()
def admin_add_comment(ticket_id):
    """Admin: add a comment to a ticket."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json() or {}
    comment_text = data.get('comment', '').strip()
    if not comment_text:
        return jsonify({'error': 'Comment is required'}), 400

    comment = TicketComment(
        ticket_id=ticket_id,
        author_id=user_id,
        author_role='admin',
        comment=comment_text,
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({'comment': comment.to_dict()}), 201
