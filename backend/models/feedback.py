from datetime import datetime
from app import db


class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    # Q1: Would you use it?
    would_use = db.Column(db.String(30), nullable=True)  # yes_regaily | yes_sometimes | maybe_not | no
    # Q2: Would you pay?
    would_pay = db.Column(db.String(30), nullable=True)  # yes_monthly | yes_once | maybe | no
    pay_amount = db.Column(db.String(80), nullable=True)
    # Q3: What would make it worth it?
    top_feature = db.Column(db.Text, nullable=True)
    # Q3 follow-up: what would tip "maybe" into "yes"
    top_frustration = db.Column(db.Text, nullable=True)
    # Q4: Anything else
    other_comments = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='feedback', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'would_use': self.would_use,
            'would_pay': self.would_pay,
            'pay_amount': self.pay_amount,
            'top_feature': self.top_feature,
            'top_frustration': self.top_frustration,
            'other_comments': self.other_comments,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_name': self.user.full_name if self.user else None,
            'user_email': self.user.email if self.user else None,
            'user_role': self.user.role if self.user else None,
        }
