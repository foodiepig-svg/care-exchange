from datetime import datetime
from app import db
from models import Notification


class NotificationService:
    """Business logic for in-app and out-of-app notifications.

    Notification types:
        - referral_received
        - referral_accepted
        - referral_declined
        - update_received
        - document_shared
        - consent_pending
        - goal_approaching
        - message_received
    """

    NOTIFICATION_TYPES = [
        'referral_received',
        'referral_accepted',
        'referral_declined',
        'update_received',
        'document_shared',
        'consent_pending',
        'goal_approaching',
        'message_received',
    ]

    @classmethod
    def send_email_notification(cls, to_email, subject, body):
        """Sends an email notification.

        This is a stub using print(), ready for Resend/SendGrid integration.

        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body (plain text)

        Returns:
            True if email was "sent" (stub always returns True)
        """
        # Stub: log what would be sent
        print(f"[EMAIL NOTIFICATION] To: {to_email} | Subject: {subject}")
        print(f"[EMAIL NOTIFICATION] Body: {body[:200]}..." if len(body) > 200 else f"[EMAIL NOTIFICATION] Body: {body}")

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
    def create_notification(cls, user_id, notification_type, title, message, link=None):
        """Creates an in-app notification for a user.

        Args:
            user_id: ID of the user to notify
            notification_type: One of NOTIFICATION_TYPES
            title: Notification title
            message: Notification body/message
            link: Optional internal route or external URL

        Returns:
            Notification model instance
        """
        if notification_type not in cls.NOTIFICATION_TYPES:
            raise ValueError(f"Invalid notification type: {notification_type}")

        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            body=message,
            link=link,
            read=False,
            created_at=datetime.utcnow()
        )
        db.session.add(notification)
        db.session.commit()
        return notification

    @classmethod
    def notify_referral_received(cls, provider_user_id, referral_id, participant_name):
        """Notification type: referral_received."""
        return cls.create_notification(
            user_id=provider_user_id,
            notification_type='referral_received',
            title='New Referral Received',
            message=f'You have received a new referral for {participant_name}.',
            link=f'/referrals/{referral_id}'
        )

    @classmethod
    def notify_referral_accepted(cls, coordinator_user_id, referral_id, provider_name):
        """Notification type: referral_accepted."""
        return cls.create_notification(
            user_id=coordinator_user_id,
            notification_type='referral_accepted',
            title='Referral Accepted',
            message=f'{provider_name} has accepted the referral.',
            link=f'/referrals/{referral_id}'
        )

    @classmethod
    def notify_referral_declined(cls, coordinator_user_id, referral_id, provider_name, reason=''):
        """Notification type: referral_declined."""
        msg = f'{provider_name} has declined the referral.'
        if reason:
            msg += f' Reason: {reason}'
        return cls.create_notification(
            user_id=coordinator_user_id,
            notification_type='referral_declined',
            title='Referral Declined',
            message=msg,
            link=f'/referrals/{referral_id}'
        )

    @classmethod
    def notify_update_received(cls, user_id, referral_id, update_summary):
        """Notification type: update_received."""
        return cls.create_notification(
            user_id=user_id,
            notification_type='update_received',
            title='New Update',
            message=update_summary,
            link=f'/referrals/{referral_id}/updates'
        )

    @classmethod
    def notify_document_shared(cls, user_id, document_id, document_name, shared_by):
        """Notification type: document_shared."""
        return cls.create_notification(
            user_id=user_id,
            notification_type='document_shared',
            title='Document Shared',
            message=f'{shared_by} shared "{document_name}" with you.',
            link=f'/documents/{document_id}'
        )

    @classmethod
    def notify_consent_pending(cls, user_id, consent_id, consent_type):
        """Notification type: consent_pending."""
        return cls.create_notification(
            user_id=user_id,
            notification_type='consent_pending',
            title='Consent Required',
            message=f'Your consent is needed for: {consent_type}.',
            link=f'/consents/{consent_id}'
        )

    @classmethod
    def notify_goal_approaching(cls, user_id, goal_id, goal_name, days_remaining):
        """Notification type: goal_approaching."""
        return cls.create_notification(
            user_id=user_id,
            notification_type='goal_approaching',
            title='Goal Deadline Approaching',
            message=f'Goal "{goal_name}" is due in {days_remaining} days.',
            link=f'/goals/{goal_id}'
        )

    @classmethod
    def notify_message_received(cls, user_id, thread_id, sender_name, preview):
        """Notification type: message_received."""
        return cls.create_notification(
            user_id=user_id,
            notification_type='message_received',
            title=f'Message from {sender_name}',
            message=preview,
            link=f'/messages/{thread_id}'
        )
