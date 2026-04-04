from datetime import datetime
from app import db


class FeatureRequest(db.Model):
    __tablename__ = 'feature_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(30), nullable=False, default='other')  # participant, provider, coordinator, family, admin, other
    status = db.Column(db.String(20), nullable=False, default='open')  # open, planned, in_progress, completed, declined
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='feature_requests', lazy=True)
    votes = db.relationship('FeatureVote', backref='feature_request', lazy=True, cascade='all, delete-orphan')

    def vote_count(self):
        return len(self.votes)

    def to_dict(self, user_id=None):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'status': self.status,
            'vote_count': self.vote_count(),
            'has_voted': any(v.user_id == user_id for v in self.votes) if user_id else False,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_name': self.user.full_name if self.user else None,
        }


class FeatureVote(db.Model):
    __tablename__ = 'feature_votes'

    id = db.Column(db.Integer, primary_key=True)
    feature_request_id = db.Column(db.Integer, db.ForeignKey('feature_requests.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('feature_request_id', 'user_id', name='uq_feature_vote'),
    )
