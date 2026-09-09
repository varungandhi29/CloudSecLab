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

---

## OAuth 2.0 / SSO Setup Guide

To enable real single sign-on with Google, GitHub, and Apple, create your OAuth credentials and register the callback URLs.

### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project or select an existing one.
3. Go to **APIs & Services** → **Credentials**.
4. Click **Create Credentials** → **OAuth 2.0 Client ID**.
5. Application type: **Web application**.
6. Authorized redirect URIs: `https://cloudseclab.vercel.app/auth/callback/google` (and `http://localhost:3000/auth/callback/google` for local development).
7. Copy the **Client ID** and **Client Secret**.

### 2. GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Homepage URL: `https://cloudseclab.vercel.app`.
4. Authorization callback URL: `https://cloudseclab.vercel.app/auth/callback/github` (and `http://localhost:3000/auth/callback/github` for local development).
5. Copy the **Client ID** and **Client Secret**.

### 3. Apple OAuth Setup
1. Go to [Apple Developer Portal](https://developer.apple.com).
2. Go to **Certificates, Identifiers & Profiles** → **Identifiers**.
3. Register an **App ID** with the **Sign In with Apple** capability.
4. Create a **Services ID**.
5. Return URL: `https://cloudseclab.vercel.app/auth/callback/apple`.
6. Copy the **Services ID** (Client ID) and generate a **Private Key** (Client Secret).

### 4. Environment Variables Configuration
Add all credentials to your Vercel project environment variables (**Settings** → **Environment Variables**) or local `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
APPLE_CLIENT_ID=your_apple_services_id
APPLE_CLIENT_SECRET=your_apple_key
JWT_SECRET=cloudseclab-jwt-secret-2024
FRONTEND_URL=https://cloudseclab.vercel.app
VITE_API_URL=https://cloudseclab.vercel.app
```

