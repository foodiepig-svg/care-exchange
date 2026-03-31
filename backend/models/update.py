from datetime import datetime
from app import db


class Update(db.Model):
    __tablename__ = 'updates'

    id = db.Column(db.Integer, primary_key=True)
    referral_id = db.Column(db.Integer, db.ForeignKey('referrals.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(30), nullable=False)  # progress_note, incident, medication_change, goal_update, general
    summary = db.Column(db.String(500), nullable=False)
    observations = db.Column(db.Text, nullable=True)
    recommendations = db.Column(db.Text, nullable=True)
    time_spent_minutes = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'referral_id': self.referral_id,
            'author_id': self.author_id,
            'author_name': self.author.full_name if self.author else None,
            'category': self.category,
            'summary': self.summary,
            'observations': self.observations,
            'recommendations': self.recommendations,
            'time_spent_minutes': self.time_spent_minutes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
