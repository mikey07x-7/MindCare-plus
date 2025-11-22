import smtplib
from email.mime.text import MIMEText
from app.config import settings

def send_otp_email(to_email: str, otp: str):
    # Gmail app password SMTP example
    host = settings.SMTP_HOST
    port = settings.SMTP_PORT
    user = settings.SMTP_USER
    password = settings.SMTP_APP_PASSWORD
    if not all([host, user, password]):
        raise RuntimeError("SMTP not configured")

    body = f"Your MindCare+ OTP is: {otp}\nThis code is valid for 10 minutes."
    msg = MIMEText(body)
    msg["Subject"] = "MindCare+ OTP"
    msg["From"] = user
    msg["To"] = to_email

    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(user, password)
        server.sendmail(user, [to_email], msg.as_string())
