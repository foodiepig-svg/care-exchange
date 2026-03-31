from datetime import datetime
from app import db


class Consent(db.Model):
    __tablename__ = 'consents'

    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.Integer, db.ForeignKey('participants.id'), nullable=False)
    granted_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    data_categories = db.Column(db.Text, nullable=False)  # JSON: ['care_plans', 'goals', 'progress_notes', 'documents']
    granted_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)
    revoked_at = db.Column(db.DateTime, nullable=True)

    granted_to = db.relationship('User', foreign_keys=[granted_to_id])

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'participant_id': self.participant_id,
            'granted_to_id': self.granted_to_id,
            'data_categories': json.loads(self.data_categories) if self.data_categories else [],
            'granted_at': self.granted_at.isoformat() if self.granted_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'active': bool(self.granted_at) and not bool(self.revoked_at),
        }
