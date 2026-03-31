from datetime import datetime
from app import db
import json


class Participant(db.Model):
    __tablename__ = 'participants'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    ndis_number = db.Column(db.String(20), nullable=True, index=True)
    plan_number = db.Column(db.String(20), nullable=True)
    goals = db.Column(db.Text, nullable=True)  # JSON array of goal objects
    care_plans = db.Column(db.Text, nullable=True)  # JSON array of care plan objects
    emergency_contact = db.Column(db.String(255), nullable=True)
    emergency_phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    referrals_as_participant = db.relationship('Referral', foreign_keys='Referral.participant_id', backref='participant', lazy=True)
    consents = db.relationship('Consent', backref='participant', lazy=True, foreign_keys='Consent.participant_id')

    def get_goals(self):
        return json.loads(self.goals) if self.goals else []

    def get_care_plans(self):
        return json.loads(self.care_plans) if self.care_plans else []

    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.user.full_name if self.user else None,
            'ndis_number': self.ndis_number,
            'plan_number': self.plan_number,
            'goals': self.get_goals(),
            'care_plans': self.get_care_plans(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_sensitive:
            data['date_of_birth'] = self.date_of_birth.isoformat() if self.date_of_birth else None
            data['emergency_contact'] = self.emergency_contact
            data['emergency_phone'] = self.emergency_phone
        return data
