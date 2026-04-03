from datetime import datetime
from app import db


thread_participants = db.Table('thread_participants',
    db.Column('thread_id', db.Integer, db.ForeignKey('threads.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)


class Thread(db.Model):
    __tablename__ = 'threads'

    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(255), nullable=False)
    participant_id = db.Column(db.Integer, db.ForeignKey('participants.id'), nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    thread_type = db.Column(db.String(20), default='direct')

    messages = db.relationship('Message', backref='thread', lazy=True, order_by='Message.sent_at')
    participants = db.relationship('User', secondary=thread_participants, lazy='subquery',
                                   backref=db.backref('thread_participants', lazy=True))

    def to_dict(self):
        participant_ids = [p.id for p in self.participants]
        return {
            'id': self.id,
            'topic': self.topic,
            'participant_id': self.participant_id,
            'created_by_id': self.created_by_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'thread_type': self.thread_type,
            'participant_ids': participant_ids,
            'message_count': len(self.messages),
            'last_message': self.messages[-1].to_dict() if self.messages else None,
        }


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    thread_id = db.Column(db.Integer, db.ForeignKey('threads.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime, nullable=True)
    attachments = db.Column(db.JSON, nullable=True, default=list)

    sender = db.relationship('User', foreign_keys=[sender_id])

    def to_dict(self):
        return {
            'id': self.id,
            'thread_id': self.thread_id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.full_name if self.sender else None,
            'content': self.content,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'attachments': self.attachments or [],
        }
