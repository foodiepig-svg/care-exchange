from datetime import datetime
from app import db

class ConsentHistory(db.Model):
    __tablename__ = 'consent_history'

    id = db.Column(db.Integer, primary_key=True)
    consent_id = db.Column(db.Integer, db.ForeignKey('consents.id'), nullable=True)
    # consent_id is nullable so we can log events even if consent record didn't exist yet
    participant_id = db.Column(db.Integer, db.ForeignKey('participants.id'), nullable=False)
    granted_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    data_categories = db.Column(db.Text, nullable=True)  # JSON
    action = db.Column(db.String(20), nullable=False)  # 'granted', 'revoked', 'updated'
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # who made the change
    note = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'consent_id': self.consent_id,
            'participant_id': self.participant_id,
            'granted_to_id': self.granted_to_id,
            'data_categories': json.loads(self.data_categories) if self.data_categories else [],
            'action': self.action,
            'actor_id': self.actor_id,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }