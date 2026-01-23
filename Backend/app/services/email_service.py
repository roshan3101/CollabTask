import os
from pathlib import Path
from typing import Optional, Tuple
from markdown_it import MarkdownIt
import boto3
from botocore.exceptions import ClientError, BotoCoreError
from app.core import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:

    def __init__(self):
        self.aws_access_key_id = settings.AWS_ACCESS_KEY_ID
        self.aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY
        self.aws_region = settings.AWS_REGION
        self.from_email = settings.FROM_EMAIL
        self.from_name = settings.FROM_NAME
        self.ses_client = None

        if self.aws_access_key_id and self.aws_secret_access_key:
            try:
                self.ses_client = boto3.client(
                    'ses',
                    aws_access_key_id=self.aws_access_key_id,
                    aws_secret_access_key=self.aws_secret_access_key,
                    region_name=self.aws_region
                )
                logger.info(f"AWS SES client initialized for region: {self.aws_region}")
            except Exception as e:
                logger.error(f"Failed to initialize AWS SES client: {e}")
        else:
            logger.warning("AWS credentials not configured. Email sending will be disabled.")

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
        """Send OTP email using AWS SES"""
        
        if not self.ses_client:
            logger.error("AWS SES client not initialized. Check AWS credentials in environment variables.")
            return False

        try:
            template_content = self._load_template("otp_email")
            html_content, plain_text_content = self._render_template(
                template_content,
                otp=otp,
                expiry_minutes=expiry_minutes
            )

            # Prepare email message
            destination = {
                'ToAddresses': [to_email]
            }
            
            message = {
                'Subject': {
                    'Data': 'Your CollabTask Verification Code',
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Html': {
                        'Data': html_content,
                        'Charset': 'UTF-8'
                    },
                    'Text': {
                        'Data': plain_text_content,
                        'Charset': 'UTF-8'
                    }
                }
            }
            
            # Send email
            response = self.ses_client.send_email(
                Source=f"{self.from_name} <{self.from_email}>",
                Destination=destination,
                Message=message
            )
            
            if response.get('MessageId'):
                logger.info(f"OTP email sent successfully to {to_email}. MessageId: {response['MessageId']}")
                return True
            else:
                logger.error(f"Failed to send OTP email. Response: {response}")
                return False

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"AWS SES error sending OTP email to {to_email}: {error_code} - {error_message}")
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

        
        if not self.ses_client:
            logger.error("AWS SES client not initialized. Check AWS credentials in environment variables.")
            return False

        try:
            # Load and render template
            template_content = self._load_template(template_name)
            html_content, plain_text_content = self._render_template(
                template_content,
                **template_vars
            )

            # Prepare email message
            destination = {
                'ToAddresses': [to_email]
            }
            
            message = {
                'Subject': {
                    'Data': subject,
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Html': {
                        'Data': html_content,
                        'Charset': 'UTF-8'
                    },
                    'Text': {
                        'Data': plain_text_content,
                        'Charset': 'UTF-8'
                    }
                }
            }
            
            # Send email
            response = self.ses_client.send_email(
                Source=f"{self.from_name} <{self.from_email}>",
                Destination=destination,
                Message=message
            )
            
            if response.get('MessageId'):
                logger.info(f"Email sent successfully to {to_email}. MessageId: {response['MessageId']}")
                return True
            else:
                logger.error(f"Failed to send email. Response: {response}")
                return False

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"AWS SES error sending email to {to_email}: {error_code} - {error_message}")
            return False
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {e}", exc_info=True)
            return False


email_service = EmailService()
