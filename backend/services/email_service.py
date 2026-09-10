import os
import httpx
from datetime import datetime

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "CloudSecLab <onboarding@resend.dev>")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://cloudseclab.vercel.app")


async def send_email(to: str, subject: str, html: str) -> bool:
    """Send email via Resend API"""
    api_key = os.getenv("RESEND_API_KEY") or RESEND_API_KEY
    if not api_key:
        print(f"[EMAIL] RESEND_API_KEY not set — skipping email to {to}")
        return False
    try:
        from_email = os.getenv("FROM_EMAIL", FROM_EMAIL)
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={"from": from_email, "to": [to], "subject": subject, "html": html},
                timeout=10.0
            )
            if res.status_code in (200, 201):
                print(f"[EMAIL] Sent: {subject} → {to}")
                return True
            print(f"[EMAIL] Failed: {res.status_code} {res.text}")
            return False
    except Exception as e:
        print(f"[EMAIL] Error: {e}")
        return False


async def send_login_notification(
    email: str,
    full_name: str,
    provider: str,
    ip: str = None,
    city: str = None,
    country: str = None
) -> bool:
    """Send login notification email"""
    time_str = datetime.utcnow().strftime("%B %d, %Y at %I:%M %p UTC")
    location = f"{city}, {country}" if city and country else "Unknown location"
    provider_label = {
        'google': 'Google',
        'github': 'GitHub',
        'apple': 'Apple ID',
        'email': 'Password',
        'guest': 'Guest'
    }.get(provider, provider.capitalize() if provider else 'Authentication')

    frontend_url = os.getenv("FRONTEND_URL", FRONTEND_URL).rstrip("/")

    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0A0E1A;color:#F1F5F9;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1E3A5F,#0A0E1A);padding:32px;text-align:center">
        <h1 style="color:#06B6D4;font-size:24px;margin:0">🛡️ CloudSecLab</h1>
        <p style="color:#94A3B8;margin:8px 0 0;font-size:14px">Security Notification</p>
      </div>
      <div style="padding:32px">
        <h2 style="color:#F1F5F9;font-size:20px;margin:0 0 16px">New Login Detected</h2>
        <p style="color:#94A3B8;font-size:14px;line-height:1.6;margin:0 0 24px">
          Hi {full_name}, a new login to your CloudSecLab account was detected.
        </p>
        <div style="background:#111827;border:1px solid #1E2D45;border-radius:8px;padding:20px;margin-bottom:24px">
          <table style="width:100%;border-collapse:collapse">
            {''.join(f'<tr><td style="color:#94A3B8;font-size:13px;padding:6px 0">{k}</td><td style="color:#F1F5F9;font-size:13px;padding:6px 0;font-weight:600">{v}</td></tr>' for k,v in [
              ('Sign-in method', provider_label),
              ('Time', time_str),
              ('Location', location),
              ('IP Address', ip or 'Unknown'),
            ])}
          </table>
        </div>
        <p style="color:#94A3B8;font-size:13px;line-height:1.6">
          If this was you, no action is needed.<br>
          If you did not log in, <a href="{frontend_url}/security" style="color:#06B6D4">secure your account immediately</a>.
        </p>
      </div>
      <div style="padding:20px 32px;border-top:1px solid #1E2D45;text-align:center">
        <p style="color:#475569;font-size:11px;margin:0">© 2026 CloudSecLab — Cloud Security Learning Platform</p>
      </div>
    </div>
    """
    return await send_email(email, "New login to your CloudSecLab account", html)


async def send_welcome_email(email: str, full_name: str, provider: str) -> bool:
    """Send welcome email for new account"""
    frontend_url = os.getenv("FRONTEND_URL", FRONTEND_URL).rstrip("/")
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0A0E1A;color:#F1F5F9;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1E3A5F,#0A0E1A);padding:32px;text-align:center">
        <h1 style="color:#06B6D4;font-size:24px;margin:0">🛡️ CloudSecLab</h1>
        <p style="color:#94A3B8;margin:8px 0 0;font-size:14px">Welcome to the platform</p>
      </div>
      <div style="padding:32px">
        <h2 style="color:#F1F5F9;font-size:22px;margin:0 0 16px">Welcome, {full_name}! 🎉</h2>
        <p style="color:#94A3B8;font-size:14px;line-height:1.7;margin:0 0 24px">
          Your CloudSecLab account has been created successfully.
          You now have access to 100 hands-on cloud security labs covering AWS, Azure, and GCP.
        </p>
        <div style="text-align:center;margin:24px 0">
          <a href="{frontend_url}/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3B82F6,#06B6D4);color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
            Start Learning →
          </a>
        </div>
        <div style="background:#111827;border:1px solid #1E2D45;border-radius:8px;padding:20px">
          <h3 style="color:#F1F5F9;font-size:15px;margin:0 0 12px">What you get:</h3>
          <ul style="color:#94A3B8;font-size:13px;line-height:2;margin:0;padding-left:20px">
            <li>100 hands-on AWS, Azure, and GCP security labs</li>
            <li>Real CloudTrail forensics investigations</li>
            <li>4 verifiable certificates with unique IDs</li>
            <li>Live LocalStack AWS emulation sandbox</li>
            <li>Timed track exams with PDF certificates</li>
          </ul>
        </div>
      </div>
      <div style="padding:20px 32px;border-top:1px solid #1E2D45;text-align:center">
        <p style="color:#475569;font-size:11px;margin:0">© 2026 CloudSecLab — Cloud Security Learning Platform</p>
      </div>
    </div>
    """
    return await send_email(email, "Welcome to CloudSecLab — Your account is ready", html)


async def send_otp_email(email: str, full_name: str, otp: str) -> bool:
    """Send OTP verification email"""
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0A0E1A;color:#F1F5F9;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1E3A5F,#0A0E1A);padding:32px;text-align:center">
        <h1 style="color:#06B6D4;font-size:24px;margin:0">🛡️ CloudSecLab</h1>
      </div>
      <div style="padding:32px;text-align:center">
        <h2 style="color:#F1F5F9;font-size:20px;margin:0 0 8px">Verify your email</h2>
        <p style="color:#94A3B8;font-size:14px;margin:0 0 32px">Hi {full_name}, enter this code to verify your email address.</p>
        <div style="background:#111827;border:2px solid #06B6D4;border-radius:12px;padding:24px;display:inline-block;margin:0 auto">
          <div style="color:#06B6D4;font-size:42px;font-weight:800;letter-spacing:12px;font-family:monospace">{otp}</div>
        </div>
        <p style="color:#94A3B8;font-size:13px;margin:24px 0 0">This code expires in <strong style="color:#F1F5F9">10 minutes</strong>.</p>
        <p style="color:#475569;font-size:12px;margin:8px 0 0">If you did not create an account, ignore this email.</p>
      </div>
      <div style="padding:20px 32px;border-top:1px solid #1E2D45;text-align:center">
        <p style="color:#475569;font-size:11px;margin:0">© 2026 CloudSecLab</p>
      </div>
    </div>
    """
    return await send_email(email, f"Your CloudSecLab verification code: {otp}", html)
