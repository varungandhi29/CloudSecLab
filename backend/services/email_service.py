import os
import httpx
import logging
from config import settings

logger = logging.getLogger(__name__)

async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    api_key = os.getenv('RESEND_API_KEY') or getattr(settings, 'RESEND_API_KEY', '')
    if not api_key:
        logger.warning('RESEND_API_KEY not configured. Skipping email delivery.')
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                'https://api.resend.com/emails',
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'from': 'CloudSecLab <onboarding@resend.dev>',
                    'to': [to_email],
                    'subject': subject,
                    'html': html_content
                },
                timeout=10.0
            )
            if res.status_code in (200, 201):
                logger.info('Email sent successfully to %s via Resend', to_email)
                return True
            else:
                logger.warning('Resend email API returned status %s: %s', res.status_code, res.text)
                return False
    except Exception as e:
        logger.warning('Failed to send email via Resend: %s', e)
        return False
