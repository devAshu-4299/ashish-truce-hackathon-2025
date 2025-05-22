from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from app.schemas.consent import (
    ConsentCreate,
    ConsentUpdate,
    ConsentResponse,
    ConsentHistory,
    ConsentStats
)
from app.services.consent_service import consent_service
from app.core.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=ConsentResponse)
async def create_consent(
    request: ConsentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new consent record"""
    try:
        return await consent_service.create_consent(current_user["id"], request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=List[ConsentResponse])
async def list_consents(
    current_user: dict = Depends(get_current_user),
    limit: Optional[int] = 10,
    offset: Optional[int] = 0
):
    """List all consents for the current user with pagination"""
    try:
        return await consent_service.get_user_consents(
            current_user["id"],
            limit=limit,
            offset=offset
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{consent_id}", response_model=ConsentResponse)
async def get_consent(
    consent_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific consent by ID"""
    try:
        consent = await consent_service.get_consent(consent_id, current_user["id"])
        if not consent:
            raise HTTPException(status_code=404, detail="Consent not found")
        return consent
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{consent_id}", response_model=ConsentResponse)
async def update_consent(
    consent_id: str,
    request: ConsentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a consent record"""
    try:
        return await consent_service.update_consent(
            consent_id,
            current_user["id"],
            request
        )
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{consent_id}")
async def delete_consent(
    consent_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a consent record"""
    try:
        success = await consent_service.delete_consent(consent_id, current_user["id"])
        if not success:
            raise HTTPException(status_code=404, detail="Consent not found")
        return {"message": "Consent deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{consent_id}", response_model=List[ConsentHistory])
async def get_consent_history(
    consent_id: str,
    current_user: dict = Depends(get_current_user),
    limit: Optional[int] = 10
):
    """Get history of changes for a specific consent"""
    try:
        history = await consent_service.get_consent_history(
            consent_id,
            current_user["id"],
            limit=limit
        )
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/overview", response_model=ConsentStats)
async def get_consent_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get overview statistics of user's consents"""
    try:
        return await consent_service.get_consent_stats(current_user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
