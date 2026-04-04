from datetime import datetime
from app import db

class GoalHistory(db.Model):
    __tablename__ = 'goal_history'

    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    participant_id = db.Column(db.Integer, db.ForeignKey('participants.id'), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # who made the change
    action = db.Column(db.String(50), nullable=False)  # 'created', 'progress_updated', 'status_changed', 'details_updated', 'deleted'
    field_changed = db.Column(db.String(50), nullable=True)  # 'progress', 'status', 'title', 'description', 'target_date', etc.
    old_value = db.Column(db.Text, nullable=True)  # string representation of old value
    new_value = db.Column(db.Text, nullable=True)  # string representation of new value
    note = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'participant_id': self.participant_id,
            'actor_id': self.actor_id,
            'action': self.action,
            'field_changed': self.field_changed,
            'old_value': self.old_value,
            'new_value': self.new_value,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
