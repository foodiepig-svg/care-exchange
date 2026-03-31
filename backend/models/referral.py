from datetime import datetime
from app import db


class Referral(db.Model):
    __tablename__ = 'referrals'

    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.Integer, db.ForeignKey('participants.id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers.id'), nullable=False)
    coordinator_id = db.Column(db.Integer, db.ForeignKey('coordinators.id'), nullable=True)
    status = db.Column(db.String(20), default='draft', index=True)  # draft, sent, viewed, accepted, declined, active, on_hold, completed
    referral_link_token = db.Column(db.String(64), unique=True, nullable=True, index=True)
    referral_reason = db.Column(db.Text, nullable=True)
    urgency = db.Column(db.String(10), default='normal')  # low, normal, high, urgent
    notes = db.Column(db.Text, nullable=True)
    sent_at = db.Column(db.DateTime, nullable=True)
    responded_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    updates = db.relationship('Update', backref='referral', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'participant_id': self.participant_id,
            'provider_id': self.provider_id,
            'coordinator_id': self.coordinator_id,
            'status': self.status,
            'referral_reason': self.referral_reason,
            'urgency': self.urgency,
            'notes': self.notes,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'responded_at': self.responded_at.isoformat() if self.responded_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'participant': self.participant.to_dict() if self.participant else None,
            'provider': self.provider.to_dict() if self.provider else None,
        }
