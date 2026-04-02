from datetime import datetime
from app import db


class CarePlan(db.Model):
    __tablename__ = 'care_plans'

    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.Integer, db.ForeignKey('participants.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), default='active', nullable=False)  # draft, active, completed, on_hold
    supports = db.Column(db.Text, nullable=True)  # JSON array of {category, description, frequency, provider_id}
    review_notes = db.Column(db.Text, nullable=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    participant = db.relationship('Participant', backref='care_plan_objects', lazy=True)
    created_by = db.relationship('User', foreign_keys=[created_by_id])

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'participant_id': self.participant_id,
            'title': self.title,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'supports': json.loads(self.supports) if self.supports else [],
            'review_notes': self.review_notes,
            'created_by_id': self.created_by_id,
            'created_by_name': self.created_by.full_name if self.created_by else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
