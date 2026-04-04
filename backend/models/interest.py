from datetime import datetime
from app import db


class InterestRegistration(db.Model):
    __tablename__ = 'interest_registrations'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, index=True)
    full_name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # coordinator, provider, participant, other
    organisation = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, approved, declined
    survey_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'organisation': self.organisation,
            'notes': self.notes,
            'status': self.status,
            'survey_completed': self.survey_completed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
