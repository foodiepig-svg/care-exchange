import os
import urllib.request
import urllib.parse
from datetime import datetime
from app import db
from models import Notification


def _get_elasticemail_api_key():
    """Get the Elastic Email API key from environment."""
    return os.environ.get('ELASTICEMAIL_API_KEY', '')


class EmailService:
    """Business logic for sending emails.

    Uses Elastic Email when ELASTICEMAIL_API_KEY is configured,
    otherwise falls back to printing emails to console (stub behavior).
    """

    FROM_NAME = "Care Exchange"
    FROM_EMAIL = "noreply@careexchange.com.au"

    # HTML email template
    HTML_TEMPLATE = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Care Exchange</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .button:hover { opacity: 0.9; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .warning { background: #fef3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin: 20px 0; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Care Exchange</h1>
        </div>
        <div class="content">
            {content}
        </div>
        <div class="footer">
            <p>This is an automated message from Care Exchange. Please do not reply to this email.</p>
        </div>
    </body>
    </html>
    """

    VERIFICATION_CONTENT = """
    <h2>Welcome to Care Exchange!</h2>
    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
    <p style="text-align: center;">
        <a href="$verify_url" class="button">Verify Email Address</a>
    </p>
    <p style="text-align: center; color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
    <p style="text-align: center; font-size: 12px; word-break: break-all; color: #667eea;">$verify_url</p>
    <div class="warning">
        <strong>Important:</strong> This verification link will expire in <strong>24 hours</strong>.
    </div>
    <p>If you didn't create an account with Care Exchange, you can safely ignore this email.</p>
    """

    PASSWORD_RESET_CONTENT = """
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <p style="text-align: center;">
        <a href="$reset_url" class="button">Reset Password</a>
    </p>
    <p style="text-align: center; color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
    <p style="text-align: center; font-size: 12px; word-break: break-all; color: #667eea;">$reset_url</p>
    <div class="warning">
        <strong>Important:</strong> This reset link will expire in <strong>1 hour</strong>.
    </div>
    <p>If you didn't request a password reset, you can safely ignore this email — your password will not be changed.</p>
    """

    INTEREST_REGISTRATION_CONTENT = """
    <h2>Thanks for your interest in Care Exchange!</h2>
    <p>We've received your registration and we're excited to have you on the waitlist.</p>
    <p><strong>What happens next?</strong></p>
    <ul style="line-height: 1.8;">
        <li>You'll get login details and a quick onboarding guide via email.</li>
        <li>We'll also send you a short survey to help us understand your needs better.</li>
    </ul>
    <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 24px;">
        In the meantime, here's a quick summary of what Care Exchange does:
    </p>
    <p style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px;">
        Care Exchange is the participant-controlled coordination layer for the NDIS — connecting support coordinators, providers, and participants through secure referral links, structured updates, and shared goal tracking.
    </p>
    <p style="text-align: center; margin-top: 24px;">
        <a href="$survey_url" class="button" style="background: #10b981;">Complete our feedback survey</a>
    </p>
    <p style="text-align: center; color: #6b7280; font-size: 13px;">The survey takes less than 5 minutes and helps us build something that actually works for you.</p>
    """

    @classmethod
    def send_email(cls, to_email, subject, html_content):
        """Sends an email via Elastic Email HTTP API.

        Falls back to console print if ELASTICEMAIL_API_KEY is not set.

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: Email body as HTML

        Returns:
            True if email was sent successfully (or printed in stub mode)
        """
        api_key = _get_elasticemail_api_key()
        if not api_key:
            print(f"[EMAIL] No API key configured. Would send to: {to_email} | Subject: {subject}")
            return False

        # Wrap content in the site template
        full_html = cls.HTML_TEMPLATE.replace("{content}", html_content)

        # Build Elastic Email API request
        # Elastic Email uses a simple HTTP GET/POST API
        data = urllib.parse.urlencode({
            "apikey": api_key,
            "from": cls.FROM_EMAIL,
            "fromName": cls.FROM_NAME,
            "to": to_email,
            "subject": subject,
            "bodyhtml": full_html,
            "isTransactional": "true",
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.elasticemail.com/v2/email/send",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                result = response.read().decode("utf-8")
                print(f"[EMAIL] Elastic Email sent to {to_email} | Subject: {subject} | Result: {result}")
                return True
        except Exception as e:
            print(f"[EMAIL] Elastic Email failed for {to_email}: {e}")
            return False

    @classmethod
    def send_verification_email(cls, user):
        """Sends an email verification link to a user.

        Args:
            user: User model instance with email and verification_token set

        Returns:
            True if email was sent
        """
        verify_url = f"https://care-exchange.onrender.com/auth/verify/{user.verification_token}"
        subject = "Verify your Care Exchange account"
        html_content = cls.VERIFICATION_CONTENT.replace("$verify_url", verify_url)
        return cls.send_email(user.email, subject, html_content)

    @classmethod
    def send_password_reset_email(cls, user, reset_token):
        """Sends a password reset email to a user.

        Args:
            user: User model instance
            reset_token: The password reset token

        Returns:
            True if email was sent
        """
        reset_url = f"https://care-exchange.onrender.com/auth/reset-password?token={reset_token}"
        subject = "Reset your Care Exchange password"
        html_content = cls.PASSWORD_RESET_CONTENT.replace("$reset_url", reset_url)
        return cls.send_email(user.email, subject, html_content)

    @classmethod
    def send_interest_registration_email(cls, registration, survey_url=""):
        """Sends a confirmation email to someone who registered interest.

        Args:
            registration: InterestRegistration model instance
            survey_url: URL to the feedback survey

        Returns:
            True if email was sent
        """
        subject = "You're on the Care Exchange waitlist"
        html_content = cls.INTEREST_REGISTRATION_CONTENT.replace("$survey_url", survey_url)
        return cls.send_email(registration.email, subject, html_content)
