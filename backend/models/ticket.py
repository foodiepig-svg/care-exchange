from datetime import datetime
from app import db


class Ticket(db.Model):
    __tablename__ = 'tickets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'issue' or 'feature'
    status = db.Column(db.String(20), nullable=False, default='open')  # open, triaged, in_progress, resolved, closed
    priority = db.Column(db.String(20), nullable=False, default='low')  # low, medium, high
    resolved_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='tickets', lazy=True)
    comments = db.relationship('TicketComment', backref='ticket', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_comments=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'status': self.status,
            'priority': self.priority,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_name': self.user.full_name if self.user else None,
            'user_role': self.user.role if self.user else None,
            'comment_count': len(self.comments),
        }
        if include_comments:
            data['comments'] = [c.to_dict() for c in self.comments]
        return data


class TicketComment(db.Model):
    __tablename__ = 'ticket_comments'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    author_role = db.Column(db.String(50), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    author = db.relationship('User', backref='ticket_comments', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'author_id': self.author_id,
            'author_role': self.author_role,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'author_name': self.author.full_name if self.author else None,
        }
