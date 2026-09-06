import os
import random
import string
from datetime import datetime
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import qrcode
from config import settings
from models.certificate import Certificate

TYPE_MAP = {
    "beginner": "BGN",
    "intermediate": "INT",
    "advanced": "ADV",
    "master": "MST"
}

CERT_NAMES = {
    "beginner": "CloudSecLab Beginner Certificate",
    "intermediate": "CloudSecLab Intermediate Practitioner Certificate",
    "advanced": "CloudSecLab Advanced Specialist Certificate",
    "master": "CloudSecLab Certified Master Security Architect"
}

class CertificateService:
    @staticmethod
    def generate_verification_id(cert_type: str) -> str:
        year = datetime.utcnow().year
        type_code = TYPE_MAP.get(cert_type.lower(), "GEN")
        rand_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        return f"CSL-{year}-{type_code}-{rand_code}"

    @staticmethod
    def generate_pdf(verification_id: str, full_name: str, cert_type: str, score: float) -> str:
        os.makedirs(settings.CERTIFICATES_DIR, exist_ok=True)
        filename = f"{verification_id}.pdf"
        filepath = os.path.join(settings.CERTIFICATES_DIR, filename)

        width, height = landscape(letter)
        c = canvas.Canvas(filepath, pagesize=landscape(letter))

        # Dark background #0A0E1A
        c.setFillColor(colors.HexColor("#0A0E1A"))
        c.rect(0, 0, width, height, fill=1, stroke=0)

        # Border cyan accent #06B6D4
        c.setStrokeColor(colors.HexColor("#06B6D4"))
        c.setLineWidth(4)
        c.rect(20, 20, width - 40, height - 40, fill=0, stroke=1)
        c.setLineWidth(1)
        c.rect(25, 25, width - 50, height - 50, fill=0, stroke=1)

        # Header Logo Text
        c.setFont("Helvetica-Bold", 32)
        c.setFillColor(colors.HexColor("#06B6D4"))
        c.drawCentredString(width / 2, height - 90, "CLOUDSECLAB")

        c.setFont("Helvetica", 14)
        c.setFillColor(colors.HexColor("#9CA3AF"))
        c.drawCentredString(width / 2, height - 115, "CERTIFICATE OF ACHIEVEMENT")

        # Subtitle
        c.setFont("Helvetica", 16)
        c.setFillColor(colors.HexColor("#F9FAFB"))
        c.drawCentredString(width / 2, height - 180, "This is to certify that")

        # Recipient Name
        c.setFont("Helvetica-Bold", 36)
        c.setFillColor(colors.HexColor("#06B6D4"))
        c.drawCentredString(width / 2, height - 235, full_name)

        c.setFont("Helvetica", 16)
        c.setFillColor(colors.HexColor("#F9FAFB"))
        c.drawCentredString(width / 2, height - 280, "has successfully demonstrated mastery and completed")

        # Certificate Name
        cert_name = CERT_NAMES.get(cert_type.lower(), "Cloud Security Certification")
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(colors.HexColor("#F59E0B"))  # Gold
        c.drawCentredString(width / 2, height - 330, cert_name)

        # Details
        date_str = datetime.utcnow().strftime("%B %d, %Y")
        c.setFont("Helvetica", 14)
        c.setFillColor(colors.HexColor("#9CA3AF"))
        c.drawCentredString(width / 2, height - 375, f"Issued on {date_str}  |  Score Achieved: {score:.1f}%")

        # Generate QR code
        verify_url = f"{settings.FRONTEND_URL}/verify/{verification_id}"
        qr = qrcode.QRCode(box_size=3, border=1)
        qr.add_data(verify_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        qr_path = os.path.join(settings.CERTIFICATES_DIR, f"{verification_id}_qr.png")
        img.save(qr_path)

        # Draw QR Code on bottom right
        c.drawImage(qr_path, width - 130, 45, width=80, height=80)

        # Verification ID Monospace at bottom
        c.setFont("Courier-Bold", 12)
        c.setFillColor(colors.HexColor("#06B6D4"))
        c.drawString(45, 65, f"VERIFICATION ID: {verification_id}")

        c.setFont("Helvetica", 10)
        c.setFillColor(colors.HexColor("#9CA3AF"))
        c.drawString(45, 45, f"Verify authenticity at: {verify_url}")

        c.save()

        # Clean up temporary QR png
        if os.path.exists(qr_path):
            os.remove(qr_path)

        return filepath
