from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # participant, family, provider, coordinator
    full_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    verified_at = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    # Password reset fields
    reset_token=db.Column(db.String(64), nullable=True, index=True)
    reset_token_expires_at=db.Column(db.DateTime, nullable=True)

    # Email verification fields
    email_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(64), nullable=True, index=True)
    verification_token_expires = db.Column(db.DateTime, nullable=True)

    # Relationships
    participant = db.relationship('Participant', backref='user', uselist=False, lazy=True)
    provider = db.relationship('Provider', backref='user', uselist=False, lazy=True)
    coordinator = db.relationship('Coordinator', backref='user', uselist=False, lazy=True)

    # Early access feedback tracking
    feedback_submitted_at = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'verified': bool(self.verified_at),
            'feedback_submitted_at': self.feedback_submitted_at.isoformat() if self.feedback_submitted_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
