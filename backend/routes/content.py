import os
from flask import Blueprint, send_from_directory, jsonify

content_bp = Blueprint('content', __name__)

# Path to public content directory
CONTENT_DIR = '/app/content'

ALLOWED_FILES = {
    'personas': 'personas.md',
    'use-cases': 'use-cases.md',
    'go-to-market': 'go-to-market.md',
    'team': 'team.md',
    'diagrams': 'diagrams.md',
}


@content_bp.route('/<content_key>')
def get_content(content_key):
    """Serve markdown content files by key."""
    if content_key not in ALLOWED_FILES:
        return jsonify({'error': 'Content not found'}), 404

    filename = ALLOWED_FILES[content_key]
    filepath = os.path.join(CONTENT_DIR, filename)

    if not os.path.exists(filepath):
        return jsonify({'error': 'Content file not found'}), 404

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    return jsonify({'content': content, 'key': content_key, 'filename': filename})


@content_bp.route('/list')
def list_content():
    """List all available content files."""
    files = []
    for key, filename in ALLOWED_FILES.items():
        filepath = os.path.join(CONTENT_DIR, filename)
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                preview = f.read(200)
            files.append({'key': key, 'filename': filename, 'preview': preview})
    return jsonify({'files': files})
