import secrets
from datetime import datetime, timedelta
from app import db
from models import Referral, Provider, User


class ReferralService:
    """Business logic for referral management.

    Status flow: draft -> sent -> viewed -> accepted/declined -> active -> on_hold -> completed
    """

    REFERRAL_STATUSES = ['draft', 'sent', 'viewed', 'accepted', 'declined', 'active', 'on_hold', 'completed']

    VALID_STATUS_TRANSITIONS = {
        'draft': ['sent'],
        'sent': ['viewed'],
        'viewed': ['accepted', 'declined'],
        'accepted': ['active', 'on_hold'],
        'active': ['on_hold', 'completed'],
        'on_hold': ['active', 'completed'],
    }

    # Token expires after 7 days
    TOKEN_EXPIRY_DAYS = 7

    @classmethod
    def generate_referral_link(cls, referral_id):
        """Creates a cryptographically random token and associates it with a referral.

        Returns the token string.
        """
        token = secrets.token_urlsafe(32)
        referral = db.session.get(Referral, referral_id)
        if not referral:
            return None
        referral.referral_link_token = token
        db.session.commit()
        return token

    @classmethod
    def validate_referral_token(cls, token):
        """Checks token exists, is not expired (7 days), and has not been used.

        Returns (is_valid, referral_or_error).
        """
        if not token:
            return False, 'Token is required'

        referral = Referral.query.filter_by(referral_link_token=token).first()
        if not referral:
            return False, 'Referral not found'

        # Check if referral has been responded to (accepted/declined)
        if referral.status in ('accepted', 'declined', 'active', 'completed'):
            return False, 'Referral link has already been used'

        # Check 7-day expiry
        if referral.sent_at:
            expiry = referral.sent_at + timedelta(days=cls.TOKEN_EXPIRY_DAYS)
            if datetime.utcnow() > expiry:
                return False, 'Referral link has expired'

        return True, referral

    @classmethod
    def expire_old_referrals(cls):
        """Marks referrals past 7 days from sent_at as expired.

        Runs as a cleanup job.
        """
        cutoff = datetime.utcnow() - timedelta(days=cls.TOKEN_EXPIRY_DAYS)
        expired = Referral.query.filter(
            Referral.status == 'sent',
            Referral.sent_at < cutoff,
            Referral.referral_link_token.isnot(None)
        ).all()

        for referral in expired:
            referral.status = 'expired'

        db.session.commit()
        return len(expired)

    @classmethod
    def send_referral_notification(cls, referral):
        """Triggers email/SMS to the provider.

        This is a stub ready for integration with Resend, SendGrid, or Twilio.

        Args:
            referral: Referral model instance

        Returns:
            True if notification was "sent" (stub always returns True)
        """
        provider = db.session.get(Provider, referral.provider_id)
        if not provider or not provider.user:
            return False

        provider_user = provider.user
        email = provider_user.email
        full_name = provider_user.full_name or 'Provider'

        # Stub: log the notification that would be sent
        print(f"[REFERRAL NOTIFICATION] To: {email} | Subject: New Care Referral from Care Exchange")
        print(f"[REFERRAL NOTIFICATION] Body: Dear {full_name}, you have received a new referral. "
              f"Please log in to Care Exchange to view and respond.")

        # TODO: Integrate with email service (Resend/SendGrid)
        # Example for Resend:
        # from app import resend  # if configured
        # resend.emails.send({
        #     "from": "Care Exchange <noreply@careexchange.com>",
        #     "to": email,
        #     "subject": "New Care Referral from Care Exchange",
        #     "html": f"<p>Dear {full_name}, you have received a new referral.</p>"
        # })

        # TODO: Integrate with SMS (Twilio) if phone is available
        # if provider.phone:
        #     twilio.messages.create(
        #         body=f"Care Exchange: You have a new referral. Please log in to respond.",
        #         from_=TWILIO_FROM,
        #         to=provider.phone
        #     )

        return True

    @classmethod
    def is_valid_status_transition(cls, current_status, new_status):
        """Check if a status transition is valid."""
        if current_status == new_status:
            return True
        return new_status in cls.VALID_STATUS_TRANSITIONS.get(current_status, [])
