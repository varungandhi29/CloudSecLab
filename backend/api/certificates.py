from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from database import get_db
from models.user import User
from models.certificate import Certificate
from api.auth import get_current_user
from config import settings

router = APIRouter()

@router.get("/certificates")
def list_certificates(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    certs = db.query(Certificate).filter(Certificate.user_id == user.id).all()
    return certs

@router.get("/certificates/{verification_id}")
def get_certificate_detail(
    verification_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(Certificate.verification_id == verification_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert

@router.get("/certificates/{verification_id}/download")
def download_certificate(
    verification_id: str,
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(Certificate.verification_id == verification_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    pdf_path = cert.pdf_path
    if not pdf_path or not os.path.exists(pdf_path):
        pdf_path = os.path.join(settings.CERTIFICATES_DIR, f"{verification_id}.pdf")

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Certificate PDF file not generated or missing")

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"CloudSecLab_Certificate_{verification_id}.pdf"
    )

# Public verification endpoint (No Auth Required)
@router.get("/verify/{verification_id}")
def verify_certificate_public(verification_id: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.verification_id == verification_id).first()
    if not cert or not cert.is_valid:
        return {
            "valid": False,
            "message": "Certificate with this verification ID was not found or is invalid."
        }

    return {
        "valid": True,
        "verification_id": cert.verification_id,
        "holder_name": cert.user_full_name,
        "certificate_type": cert.certificate_type,
        "exam_score": cert.exam_score,
        "issued_at": cert.issued_at
    }
