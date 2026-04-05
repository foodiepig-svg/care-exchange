"""Routes package - registers all blueprints with the Flask app."""
from routes.auth import auth_bp
from routes.participants import participants_bp
from routes.referrals import referrals_bp
from routes.updates import updates_bp
from routes.messages import messages_bp
from routes.goals import goals_bp
from routes.care_plans import care_plans_bp
from routes.notifications import notifications_bp
from routes.documents import documents_bp
from routes.consents import consents_bp
from routes.content import content_bp
from routes.providers import providers_bp
from routes.admin import admin_bp
from routes.tickets import ticket_bp
from routes.feature_requests import feature_bp
from routes.interest import interest_bp
from routes.feedback import feedback_bp


def register_bp(app):
    """Register all blueprints with the Flask app."""
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(participants_bp, url_prefix='/api/v1/participants')
    app.register_blueprint(referrals_bp, url_prefix='/api/v1/referrals')
    app.register_blueprint(updates_bp, url_prefix='/api/v1/updates')
    app.register_blueprint(messages_bp, url_prefix='/api/v1/messages')
    app.register_blueprint(goals_bp, url_prefix='/api/v1/goals')
    app.register_blueprint(care_plans_bp, url_prefix='/api/v1/care-plans')
    app.register_blueprint(notifications_bp, url_prefix='/api/v1/notifications')
    app.register_blueprint(documents_bp, url_prefix='/api/v1/documents')
    app.register_blueprint(consents_bp, url_prefix='/api/v1/consents')
    app.register_blueprint(content_bp, url_prefix='/api/v1/content')
    app.register_blueprint(providers_bp, url_prefix='/api/v1/providers')
    app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')
    app.register_blueprint(ticket_bp, url_prefix='/api/v1')
    app.register_blueprint(feature_bp, url_prefix='/api/v1/feature-requests')
    app.register_blueprint(interest_bp, url_prefix='/api/v1')
    app.register_blueprint(feedback_bp, url_prefix='/api/v1')
