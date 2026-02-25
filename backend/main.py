"""
EmbPay API - Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import checkout, webhook, merchant
from .database import db

app = FastAPI(
    title="EmbPay API",
    description="Payment Platform API for EmbPay",
    version="1.0.0"
)

# CORS - Allow checkout page to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://checkout.embpay.com", "https://embpay.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    """Connect to database on startup"""
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    """Disconnect from database on shutdown"""
    await db.disconnect()


# Include routers
app.include_router(checkout.router)
# app.include_router(webhook.router)  # Will add in Part 3
# app.include_router(merchant.router)  # Already exists


@app.get("/")
async def root():
    return {
        "name": "EmbPay API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
