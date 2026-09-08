import os
import random
import string
from datetime import datetime
import math
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
    "beginner": "Beginner Cloud Security Practitioner Certificate",
    "intermediate": "Intermediate Cloud Security Specialist Certificate",
    "advanced": "Advanced Cloud Security Architect Certificate",
    "master": "Certified Master Cloud Security Engineer"
}

class CertificateService:
    @staticmethod
    def generate_verification_id(cert_type: str) -> str:
        year = datetime.utcnow().year
        type_code = TYPE_MAP.get(cert_type.lower(), "GEN")
        rand_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        return f"CSL-{year}-{type_code}-{rand_code}"

    @staticmethod
    def _draw_seal(c: canvas.Canvas, cx: float, cy: float):
        """Draws a professional vector certification seal with ribbon tails, shield, and checkmark."""
        # Ribbon tails beneath the circular seal
        # Left Ribbon
        path_left = c.beginPath()
        path_left.moveTo(cx - 10, cy - 10)
        path_left.lineTo(cx - 30, cy - 68)
        path_left.lineTo(cx - 18, cy - 58)
        path_left.lineTo(cx - 6, cy - 68)
        path_left.lineTo(cx - 2, cy - 10)
        path_left.close()
        c.setFillColor(colors.HexColor("#0D5E57"))  # Darker teal shadow
        c.drawPath(path_left, fill=1, stroke=0)

        # Right Ribbon
        path_right = c.beginPath()
        path_right.moveTo(cx + 2, cy - 10)
        path_right.lineTo(cx + 6, cy - 68)
        path_right.lineTo(cx + 18, cy - 58)
        path_right.lineTo(cx + 30, cy - 68)
        path_right.lineTo(cx + 10, cy - 10)
        path_right.close()
        c.setFillColor(colors.HexColor("#0F766E"))  # Teal
        c.drawPath(path_right, fill=1, stroke=0)

        # Rosette Starburst / Scallop outer rim (28 points)
        num_points = 28
        r_outer = 39.0
        r_inner = 35.5
        star_path = c.beginPath()
        for i in range(num_points * 2):
            angle = i * math.pi / num_points
            r = r_outer if i % 2 == 0 else r_inner
            px = cx + r * math.cos(angle)
            py = cy + r * math.sin(angle)
            if i == 0:
                star_path.moveTo(px, py)
            else:
                star_path.lineTo(px, py)
        star_path.close()
        c.setFillColor(colors.HexColor("#0D5E57"))
        c.drawPath(star_path, fill=1, stroke=0)

        # Outer Circular Badge
        c.setFillColor(colors.HexColor("#0F766E"))
        c.circle(cx, cy, 36, fill=1, stroke=0)

        # Concentric White / Light Rings
        c.setStrokeColor(colors.HexColor("#FAF8F3"))
        c.setLineWidth(1.2)
        c.circle(cx, cy, 33, fill=0, stroke=1)

        c.setLineWidth(0.6)
        c.circle(cx, cy, 30, fill=0, stroke=1)

        # Shield Icon in center
        shield = c.beginPath()
        shield.moveTo(cx - 10, cy + 16)
        shield.lineTo(cx + 10, cy + 16)
        shield.lineTo(cx + 10, cy + 4)
        shield.curveTo(cx + 10, cy - 5, cx + 5, cy - 10, cx, cy - 13)
        shield.curveTo(cx - 5, cy - 10, cx - 10, cy - 5, cx - 10, cy + 4)
        shield.close()
        c.setFillColor(colors.HexColor("#FAF8F3"))
        c.drawPath(shield, fill=1, stroke=0)

        # Checkmark inside Shield
        check = c.beginPath()
        check.moveTo(cx - 5.5, cy + 4)
        check.lineTo(cx - 1.5, cy - 1)
        check.lineTo(cx + 5.5, cy + 9.5)
        c.setStrokeColor(colors.HexColor("#0F766E"))
        c.setLineWidth(2.2)
        c.setLineCap(1)  # Round cap
        c.drawPath(check, fill=0, stroke=1)
        c.setLineCap(0)  # Reset cap

        # Tiny Seal Lettering
        c.setFont("Helvetica-Bold", 5.5)
        c.setFillColor(colors.HexColor("#FAF8F3"))
        c.drawCentredString(cx, cy - 22, "VERIFIED")

    @staticmethod
    def generate_pdf(verification_id: str, full_name: str, cert_type: str, score: float) -> str:
        os.makedirs(settings.CERTIFICATES_DIR, exist_ok=True)
        filename = f"{verification_id}.pdf"
        filepath = os.path.join(settings.CERTIFICATES_DIR, filename)

        width, height = landscape(letter)  # 792 x 612
        c = canvas.Canvas(filepath, pagesize=landscape(letter))
        cx = width / 2.0  # 396.0

        # 1. Warm off-white / parchment background #FAF8F3
        c.setFillColor(colors.HexColor("#FAF8F3"))
        c.rect(0, 0, width, height, fill=1, stroke=0)

        # 2. Double-rule border frame in deep slate navy #1E293B
        c.setStrokeColor(colors.HexColor("#1E293B"))
        # Outer border
        c.setLineWidth(2.2)
        c.rect(24, 24, width - 48, height - 48, fill=0, stroke=1)
        # Inner border
        c.setLineWidth(0.75)
        c.rect(30, 30, width - 60, height - 60, fill=0, stroke=1)

        # Corner accents (3x3 dot in corners)
        c.setFillColor(colors.HexColor("#1E293B"))
        c.rect(26, 26, 3, 3, fill=1, stroke=0)
        c.rect(width - 29, 26, 3, 3, fill=1, stroke=0)
        c.rect(26, height - 29, 3, 3, fill=1, stroke=0)
        c.rect(width - 29, height - 29, 3, 3, fill=1, stroke=0)

        # 3. Header Logo & Platform Name
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(colors.HexColor("#0F766E"))
        c.drawCentredString(cx, height - 64, "CLOUDSECLAB")

        c.setFont("Helvetica", 8.5)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawCentredString(cx, height - 78, "CLOUD SECURITY OPERATIONS & ASSURANCE LAB")

        # Decorative header rule
        c.setStrokeColor(colors.HexColor("#CBD5E1"))
        c.setLineWidth(0.75)
        c.line(cx - 100, height - 88, cx + 100, height - 88)

        # 4. Formal Title
        c.setFont("Times-Bold", 24)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawCentredString(cx, height - 125, "CERTIFICATE OF PROFICIENCY")

        # 5. Ceremonial lead-in
        c.setFont("Times-Italic", 13)
        c.setFillColor(colors.HexColor("#475569"))
        c.drawCentredString(cx, height - 165, "This is to certify that")

        # 6. Recipient Name (Prominent serif)
        c.setFont("Times-Bold", 32)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawCentredString(cx, height - 212, full_name)

        # Subtle elegant rule under recipient name
        c.setStrokeColor(colors.HexColor("#CBD5E1"))
        c.setLineWidth(0.75)
        c.line(cx - 150, height - 222, cx + 150, height - 222)

        # 7. Achievement statement
        c.setFont("Times-Italic", 12.5)
        c.setFillColor(colors.HexColor("#475569"))
        c.drawCentredString(cx, height - 256, "has successfully demonstrated practical competency and technical mastery in")

        # 8. Certificate Title (Accent Serif)
        cert_name = CERT_NAMES.get(cert_type.lower(), "Cloud Security Certification")
        c.setFont("Times-Bold", 20)
        c.setFillColor(colors.HexColor("#0F766E"))
        c.drawCentredString(cx, height - 292, cert_name)

        # 9. Evaluation metadata
        date_str = datetime.utcnow().strftime("%B %d, %Y")
        c.setFont("Times-Roman", 11)
        c.setFillColor(colors.HexColor("#334155"))
        c.drawCentredString(cx, height - 330, f"Completed all curriculum modules and achieved an exam score of {score:.1f}%.")

        c.setFont("Times-Roman", 9.5)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawCentredString(cx, height - 348, f"Issued on {date_str}   •   Authorized by CloudSecLab Certification Authority")

        # 10. Generate QR code
        verify_url = f"{settings.FRONTEND_URL}/verify/{verification_id}"
        qr = qrcode.QRCode(box_size=3, border=0)
        qr.add_data(verify_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0F172A", back_color="#FAF8F3")
        qr_path = os.path.join(settings.CERTIFICATES_DIR, f"{verification_id}_qr.png")
        img.save(qr_path)

        # 11. Bottom Section Layout

        # (a) Bottom Left: QR Code + Verification ID Monospace
        c.drawImage(qr_path, 52, 48, width=54, height=54)

        c.setFont("Courier-Bold", 8.5)
        c.setFillColor(colors.HexColor("#0F766E"))
        c.drawString(116, 92, "VERIFICATION ID:")

        c.setFont("Courier", 8.5)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawString(116, 80, verification_id)

        c.setFont("Helvetica", 7.5)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawString(116, 66, "Verify authenticity online:")

        c.setFont("Helvetica", 7)
        c.setFillColor(colors.HexColor("#0F766E"))
        c.drawString(116, 54, verify_url)

        # (b) Bottom Center: Certification Seal with Rosette Ribbon
        CertificateService._draw_seal(c, cx=cx, cy=105)

        # (c) Bottom Right: Plain Underscored Signature Line
        c.setStrokeColor(colors.HexColor("#334155"))
        c.setLineWidth(1.0)
        c.line(width - 210, 85, width - 52, 85)

        c.setFont("Times-Bold", 11)
        c.setFillColor(colors.HexColor("#0F172A"))
        c.drawCentredString(width - 131, 70, "CloudSecLab")

        c.setFont("Times-Italic", 8.5)
        c.setFillColor(colors.HexColor("#64748B"))
        c.drawCentredString(width - 131, 57, "Authorized Certification Authority")

        c.save()

        # Clean up temporary QR png
        if os.path.exists(qr_path):
            os.remove(qr_path)

        return filepath
