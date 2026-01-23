from app.core.celery_app import celery_app
from app.services.email_service import email_service
from app.constants import AuthConstants
import logging

logger = logging.getLogger(__name__)


@celery_app.task(name="send_otp_email", bind=True, max_retries=3)
def send_otp_email_task(self, to_email: str, otp: str, expiry_minutes: int = None):
    if expiry_minutes is None:
        expiry_minutes = AuthConstants.OTP_EXPIRY_TIME

    try:
        import asyncio
        
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        success = loop.run_until_complete(
            email_service.send_otp_email(to_email, otp, expiry_minutes)
        )
        
        if not success:
            raise Exception("Failed to send OTP email")
        
        logger.info(f"OTP email task completed successfully for {to_email}")
        return {"status": "success", "email": to_email}
        
    except Exception as exc:
        logger.error(f"Error in send_otp_email_task for {to_email}: {exc}", exc_info=True)
        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="send_email", bind=True, max_retries=3)
def send_email_task(self, to_email: str, subject: str, template_name: str, **template_vars):

    try:
        import asyncio
        
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        success = loop.run_until_complete(
            email_service.send_email(to_email, subject, template_name, **template_vars)
        )
        
        if not success:
            raise Exception("Failed to send email")
        
        logger.info(f"Email task completed successfully for {to_email}")
        return {"status": "success", "email": to_email}
        
    except Exception as exc:
        logger.error(f"Error in send_email_task for {to_email}: {exc}", exc_info=True)
        # Retry the task
        raise self.retry(exc=exc, countdown=60)  # Retry after 60 seconds
