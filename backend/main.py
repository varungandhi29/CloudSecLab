from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api import auth, users, levels, labs, progress, leaderboard, exams, certificates
from config import settings
from database import engine, Base
import os

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CloudSecLab API", version="1.0.0", docs_url="/api/docs", redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://cloudseclab.vercel.app",
        "https://cloudseclab.onrender.com",
        "https://cloudseclab-frontend.onrender.com",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.CERTIFICATES_DIR, exist_ok=True)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(levels.router, prefix="/api/levels", tags=["levels"])
app.include_router(labs.router, prefix="/api/labs", tags=["labs"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["leaderboard"])
app.include_router(exams.router, prefix="/api/exams", tags=["exams"])
app.include_router(certificates.router, prefix="/api", tags=["certificates"])

app.mount("/certificates", StaticFiles(directory=settings.CERTIFICATES_DIR), name="certificates")

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
