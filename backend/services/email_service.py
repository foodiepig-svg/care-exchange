import os
from datetime import datetime
from app import db
from models import Notification

# Resend client (initialized lazily)
_resend_client = None


def _get_resend_client():
    """Get or initialize the Resend client lazily."""
    global _resend_client
    if _resend_client is None:
        api_key = os.environ.get('RESEND_API_KEY', '')
        if api_key:
            try:
                import resend
                resend.api_key = api_key
                _resend_client = resend
            except Exception as e:
                print(f"[EMAIL] Failed to initialize Resend: {e}")
                _resend_client = None
    return _resend_client


class EmailService:
    """Business logic for sending emails.

    Uses Resend for real email delivery when RESEND_API_KEY is configured,
    otherwise falls back to printing emails to console (stub behavior).
    """

    FROM_ADDRESS = "Care Exchange <onboarding@resend.workers.dev>"

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

    @classmethod
    def send_email(cls, to_email, subject, html_content):
        """Sends an email.

        Uses Resend when RESEND_API_KEY is set, otherwise falls back to print() stub.

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: Email body as HTML

        Returns:
            True if email was sent successfully (or printed in stub mode)
        """
        import string
        template = string.Template(cls.HTML_TEMPLATE)
        full_html = template.substitute(content=html_content)

        # Try to send via Resend if configured
        resend = _get_resend_client()
        if resend:
            try:
                result = resend.Emails.send({
                    "from": cls.FROM_ADDRESS,
                    "to": to_email,
                    "subject": subject,
                    "html": full_html,
                })
                print(f"[EMAIL] Sent via Resend to {to_email} | Subject: {subject} | ID: {result.get('id', 'unknown')}")
                return True
            except Exception as e:
                print(f"[EMAIL] Resend failed, falling back to print: {e}")

        # Fallback: print email to console
        print(f"[EMAIL] To: {to_email} | Subject: {subject}")
        print(f"[EMAIL] HTML Body: {html_content[:200]}..." if len(html_content) > 200 else f"[EMAIL] HTML Body: {html_content}")
        return True

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
        html_content = cls.VERIFICATION_CONTENT.format(verify_url=verify_url)
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
        html_content = cls.PASSWORD_RESET_CONTENT.format(reset_url=reset_url)
        return cls.send_email(user.email, subject, html_content)
