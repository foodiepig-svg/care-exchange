from datetime import datetime
from app import db


class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=True)  # 1-5 stars
    nps = db.Column(db.Integer, nullable=True)  # 0-10
    tried_features = db.Column(db.Text, nullable=True)  # JSON array of feature strings
    confusing = db.Column(db.Text, nullable=True)
    broken_missing = db.Column(db.Text, nullable=True)
    other_comments = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='feedback', lazy=True)

    def to_dict(self):
        import json
        tried = []
        if self.tried_features:
            try:
                tried = json.loads(self.tried_features)
            except Exception:
                tried = []
        return {
            'id': self.id,
            'user_id': self.user_id,
            'rating': self.rating,
            'nps': self.nps,
            'tried_features': tried,
            'confusing': self.confusing,
            'broken_missing': self.broken_missing,
            'other_comments': self.other_comments,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_name': self.user.full_name if self.user else None,
            'user_email': self.user.email if self.user else None,
            'user_role': self.user.role if self.user else None,
        }