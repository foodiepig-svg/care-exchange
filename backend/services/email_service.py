from datetime import datetime
from app import db
from models import Notification


class EmailService:
    """Business logic for sending emails.

    This is a stub using print(), ready for Resend/SendGrid integration.
    """

    @classmethod
    def send_email(cls, to_email, subject, body):
        """Sends an email.

        This is a stub using print(), ready for Resend/SendGrid integration.

        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body (plain text)

        Returns:
            True if email was "sent" (stub always returns True)
        """
        # Stub: log what would be sent
        print(f"[EMAIL] To: {to_email} | Subject: {subject}")
        print(f"[EMAIL] Body: {body[:200]}..." if len(body) > 200 else f"[EMAIL] Body: {body}")

        # TODO: Integrate with Resend:
        # from app import resend  # if configured
        # result = resend.emails.send({
        #     "from": "Care Exchange <noreply@careexchange.com>",
        #     "to": to_email,
        #     "subject": subject,
        #     "text": body,
        # })
        # return result.get('id') is not None

        # TODO: Integrate with SendGrid:
        # from sendgrid import SendGridAPIClient
        # from sendgrid.helpers.mail import Mail
        # message = Mail(
        #     from_email="noreply@careexchange.com",
        #     to_emails=to_email,
        #     subject=subject,
        #     plain_text_content=body
        # )
        # sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        # response = sg.send(message)
        # return response.status_code in (200, 201, 202)

        return True

    @classmethod
    def send_verification_email(cls, user):
        """Sends an email verification link to a user.

        Args:
            user: User model instance with email and verification_token set

        Returns:
            True if email was "sent"
        """
        verify_url = f"https://careexchange.com/auth/verify/{user.verification_token}"
        subject = "Verify your Care Exchange account"
        body = f"""Welcome to Care Exchange!

Please verify your email address by clicking the link below:

{verify_url}

This link will expire in 24 hours.

If you didn't create an account with Care Exchange, you can safely ignore this email.

Best regards,
The Care Exchange Team
"""
        return cls.send_email(user.email, subject, body)

    @classmethod
    def send_password_reset_email(cls, user, reset_token):
        """Sends a password reset email to a user.

        Args:
            user: User model instance
            reset_token: The password reset token

        Returns:
            True if email was "sent"
        """
        reset_url = f"https://careexchange.com/auth/reset-password?token={reset_token}"
        subject = "Reset your Care Exchange password"
        body = f"""Hello!

We received a request to reset your password. Click the link below to set a new password:

{reset_url}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The Care Exchange Team
"""
        return cls.send_email(user.email, subject, body)
