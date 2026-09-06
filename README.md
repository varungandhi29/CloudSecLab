# CloudSecLab — TryHackMe-Style Cloud Security Platform

**CloudSecLab** is an interactive, 100-level hands-on cloud security learning platform covering AWS, Azure, and GCP. It features live AWS lab emulation via LocalStack, cloud forensics log analysis, 4 module final exams, and automated ReportLab PDF certificate generation with QR verification.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Vite
- **Backend**: FastAPI, Python 3.11, SQLAlchemy, Alembic, Pydantic v2
- **Database**: PostgreSQL (user profiles, progress, scores, certificates)
- **Cache**: Redis (sessions, leaderboards, exam timers)
- **Lab Engine**: LocalStack (AWS emulation: IAM, S3, STS, CloudTrail, KMS, SecretsManager)
- **Certificates**: ReportLab PDF generator + QR code generator
- **DevOps**: Docker Compose

---

## Quick Start

```bash
# 1. Start all platform services
docker-compose up --build

# 2. Access Web Platform
# Frontend Application: http://localhost:3000
# Backend API Documentation: http://localhost:8000/api/docs
```

---

## Core Features

- **100 Educational Level JSONs**: Spanning Beginner (1-25), Intermediate (26-50), Advanced (51-75), and Expert CTF (76-100).
- **Module Final Exams**: 4 timed exams with Redis timer tracking and attempt rules.
- **LocalStack AWS Emulation**: Real CLI validation for IAM roles, bucket ACLs, and privilege escalation scenarios.
- **Verifiable PDF Certificates**: Generated via ReportLab with unique verification IDs (`CSL-YYYY-TYPE-XXXXXXXX`) and public verification URL `/verify/{id}`.
