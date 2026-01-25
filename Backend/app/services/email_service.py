import os
from pathlib import Path
from typing import Optional, Tuple
from markdown_it import MarkdownIt
from app.core import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:

    def __init__(self):
        self.sendgrid_api_key = settings.SENDGRID_API_KEY
        self.from_email = settings.FROM_EMAIL
        self.from_name = settings.FROM_NAME
        self.sg_client = None
        self._is_dev = (getattr(settings, "environment", "development") or "development") == "development"

        if self._is_dev:
            logger.info("Email service: development mode — OTP will be printed to console, SendGrid disabled.")
            return
        if not self.sendgrid_api_key:
            logger.warning("SendGrid API key not configured. Email sending will be disabled.")
            return
        try:
            from sendgrid import SendGridAPIClient
            self.sg_client = SendGridAPIClient(self.sendgrid_api_key)
            logger.info("SendGrid client initialized")
        except ImportError:
            logger.warning("SendGrid not installed. Email sending disabled. Install with: pip install sendgrid")
        except Exception as e:
            logger.error(f"Failed to initialize SendGrid client: {e}")

    def _load_template(self, template_name: str) -> str:
        template_path = Path(__file__).parent.parent / "templates" / "email" / f"{template_name}.md"
        
        if not template_path.exists():
            raise FileNotFoundError(f"Email template not found: {template_path}")
        
        with open(template_path, "r", encoding="utf-8") as f:
            return f.read()

    def _render_template(self, template_content: str, **kwargs) -> Tuple[str, str]:

        rendered = template_content
        for key, value in kwargs.items():
            rendered = rendered.replace(f"{{{{ {key} }}}}", str(value))

        md = MarkdownIt("commonmark").enable(["strikethrough", "table"])
        html_content = md.render(rendered)

        plain_text = rendered.replace("#", "").replace("**", "").replace("*", "")

        return html_content, plain_text

    async def send_otp_email(
        self,
        to_email: str,
        otp: str,
        expiry_minutes: int = 10
    ) -> bool:
        """Send OTP email via SendGrid, or in dev just print to console."""
        if self._is_dev:
            # Skip SendGrid in dev — print OTP to console for local testing
            msg = f"[DEV] OTP for {to_email}: {otp}  (expires in {expiry_minutes} min)"
            print(msg)
            logger.info(msg)
            return True

        if not self.sg_client:
            logger.error("SendGrid client not initialized. Check SENDGRID_API_KEY in environment variables.")
            return False

        try:
            from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent

            template_content = self._load_template("otp_email")
            html_content, plain_text_content = self._render_template(
                template_content,
                otp=otp,
                expiry_minutes=expiry_minutes
            )

            message = Mail(
                from_email=Email(self.from_email, self.from_name),
                to_emails=To(to_email),
                subject='Your CollabTask Verification Code',
                plain_text_content=Content("text/plain", plain_text_content),
                html_content=HtmlContent(html_content)
            )
            
            response = self.sg_client.send(message)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"OTP email sent successfully to {to_email}. Status: {response.status_code}")
                return True
            else:
                logger.error(f"Failed to send OTP email. Status: {response.status_code}, Body: {response.body}")
                return False

        except Exception as e:
            logger.error(f"Error sending OTP email to {to_email}: {e}", exc_info=True)
            return False

    async def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        **template_vars
    ) -> bool:
        if not self.sg_client:
            logger.error("SendGrid client not initialized. Check SENDGRID_API_KEY in environment variables.")
            return False

        try:
            from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent

            template_content = self._load_template(template_name)
            html_content, plain_text_content = self._render_template(
                template_content,
                **template_vars
            )

            message = Mail(
                from_email=Email(self.from_email, self.from_name),
                to_emails=To(to_email),
                subject=subject,
                plain_text_content=Content("text/plain", plain_text_content),
                html_content=HtmlContent(html_content)
            )
            
            response = self.sg_client.send(message)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Email sent successfully to {to_email}. Status: {response.status_code}")
                return True
            else:
                logger.error(f"Failed to send email. Status: {response.status_code}, Body: {response.body}")
                return False

        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {e}", exc_info=True)
            return False


email_service = EmailService()
