from flask import Blueprint, request, jsonify
from app import db
from models import InterestRegistration
from services.email_service import EmailService
import os
import re

interest_bp = Blueprint('interest', __name__)

VALID_ROLES = ['coordinator', 'provider', 'participant', 'other']


def validate_email(email):
    return bool(re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email))


@interest_bp.route('/register-interest', methods=['POST'])
def register_interest():
    """Public endpoint — no auth required. Captures interest and sends confirmation email."""
    data = request.get_json() or {}

    email = data.get('email', '').strip().lower()
    full_name = data.get('full_name', '').strip()
    role = data.get('role', '').strip().lower()
    organisation = data.get('organisation', '').strip()
    notes = data.get('notes', '').strip()

    if not all([email, full_name, role]):
        return jsonify({'error': 'Email, full name, and role are required'}), 400

    if not validate_email(email):
        return jsonify({'error': 'Invalid email address'}), 400

    if role not in VALID_ROLES:
        return jsonify({'error': f'Role must be one of: {", ".join(VALID_ROLES)}'}), 400

    # Check for duplicate
    existing = InterestRegistration.query.filter_by(email=email).first()
    if existing:
        return jsonify({
            'message': 'You\'re already on our waitlist! We\'ll be in touch soon.',
            'already_registered': True
        }), 200

    # Create registration
    registration = InterestRegistration(
        email=email,
        full_name=full_name,
        role=role,
        organisation=organisation or None,
        notes=notes or None,
    )
    db.session.add(registration)
    db.session.commit()

    # Send confirmation email
    survey_url = os.environ.get('SURVEY_URL', 'https://forms.gle/placeholder')
    EmailService.send_interest_registration_email(registration, survey_url)

    return jsonify({
        'message': 'Thanks! You\'re on the waitlist. Check your email for next steps.',
        'already_registered': False
    }), 201
