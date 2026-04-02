from datetime import datetime
from app import db


class Provider(db.Model):
    __tablename__ = 'providers'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    organisation_name = db.Column(db.String(255), nullable=False)
    abn = db.Column(db.String(11), nullable=True, index=True)
    contact_name = db.Column(db.String(255), nullable=True)
    contact_phone = db.Column(db.String(20), nullable=True)
    contact_email = db.Column(db.String(255), nullable=True)
    service_types = db.Column(db.Text, nullable=True)  # JSON array
    location = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('provider_profile', uselist=False), foreign_keys=[user_id])
    referrals_received = db.relationship('Referral', backref='provider', lazy=True, foreign_keys='Referral.provider_id')

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'organisation_name': self.organisation_name,
            'abn': self.abn,
            'contact_name': self.contact_name,
            'contact_phone': self.contact_phone,
            'contact_email': self.contact_email or (self.user.email if self.user else None),
            'service_types': json.loads(self.service_types) if self.service_types else [],
            'location': self.location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
