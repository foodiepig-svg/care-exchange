from datetime import datetime
from app import db


class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    test_account = db.Column(db.Boolean, default=False)
    # Q1: What would you use it for?
    use_case = db.Column(db.String(50), nullable=True)  # referrals | care_team | goals_tracking | compliance | not_sure | other
    use_case_other = db.Column(db.String(255), nullable=True)
    # Q2: Would you recommend? What would need to be true?
    recommend_condition = db.Column(db.Text, nullable=True)
    # Q3: Most useful / waste of time
    most_useful = db.Column(db.Text, nullable=True)
    waste_of_time = db.Column(db.Text, nullable=True)
    # Q4: What would you trust with real data first?
    trust_first = db.Column(db.Text, nullable=True)
    # Q5: How does it compare to current way?
    comparison = db.Column(db.Text, nullable=True)
    # Q6: Anything else
    other_comments = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='feedback', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'test_account': self.test_account,
            'use_case': self.use_case,
            'use_case_other': self.use_case_other,
            'recommend_condition': self.recommend_condition,
            'most_useful': self.most_useful,
            'waste_of_time': self.waste_of_time,
            'trust_first': self.trust_first,
            'comparison': self.comparison,
            'other_comments': self.other_comments,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_name': self.user.full_name if self.user else None,
            'user_email': self.user.email if self.user else None,
            'user_role': self.user.role if self.user else None,
        }
