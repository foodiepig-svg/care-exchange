from datetime import datetime
import os
from app import db


ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'xls', 'xlsx'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


class Document(db.Model):
    __tablename__ = 'documents'

    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.Integer, db.ForeignKey('participants.id'), nullable=False, index=True)
    uploaded_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(255), nullable=False)  # stored filename
    original_filename = db.Column(db.String(255), nullable=False)  # original name
    file_type = db.Column(db.String(50), nullable=False)  # mime type
    file_size = db.Column(db.Integer, nullable=True)  # bytes
    category = db.Column(db.String(50), default='general')  # assessment, report, plan, id_document, other
    description = db.Column(db.Text, nullable=True)
    storage_key = db.Column(db.String(512), nullable=True)  # S3/R2 object key; if set, filename holds the key
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    participant = db.relationship('Participant', backref='documents', lazy=True)
    uploaded_by = db.relationship('User', foreign_keys=[uploaded_by_id])

    def to_dict(self):
        return {
            'id': self.id,
            'participant_id': self.participant_id,
            'uploaded_by_id': self.uploaded_by_id,
            'uploaded_by_name': self.uploaded_by.full_name if self.uploaded_by else None,
            'title': self.title,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'category': self.category,
            'description': self.description,
            'storage_key': self.storage_key,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    @property
    def download_url(self):
        return f'/api/v1/documents/{self.id}/download'
