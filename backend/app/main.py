from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, ai_summaries, consents
from app.core.config import settings

app = FastAPI(
    title="ConsentLens API",
    description="Backend API for ConsentLens application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ai_summaries.router, prefix="/api/ai-summaries", tags=["AI Summaries"])
app.include_router(consents.router, prefix="/api/consents", tags=["Consents"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to ConsentLens API",
        "docs": "/docs",
        "version": "1.0.0"
    }
