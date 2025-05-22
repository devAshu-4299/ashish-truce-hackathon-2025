from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
from app.schemas.consent import ConsentCreate, ConsentUpdate
from .supabase_service import SupabaseService

class ConsentService:
    def __init__(self):
        self.supabase = SupabaseService()

    async def create_consent(self, user_id: str, data: ConsentCreate) -> Dict[str, Any]:
        """Create a new consent record with risk analysis"""
        consent_data = {
            "user_id": user_id,
            "website_url": data.website_url,
            "consent_type": data.consent_type,
            "status": data.status,
            "consent_details": data.consent_details,
            "risk_factors": await self._analyze_risks(data.website_url, data.consent_details),
            "auto_revoke_rule": data.auto_revoke_rule if hasattr(data, 'auto_revoke_rule') else None
        }

        if consent_data.get("auto_revoke_rule", {}).get("enabled"):
            consent_data["expiry_date"] = await self._calculate_expiry_date(
                consent_data["auto_revoke_rule"]
            )

        result = await self.supabase.create_record("user_consents", consent_data)
        if result.get("auto_revoke_rule", {}).get("enabled"):
            await self._schedule_auto_revoke(result["id"], result["expiry_date"])
        
        return result

    async def get_user_consents(
        self, user_id: str, limit: int = 10, offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get all consents for a user with pagination"""
        return await self.supabase.query_records(
            "user_consents",
            {"user_id": user_id},
            limit=limit,
            offset=offset,
            order_by="created_at",
            ascending=False
        )

    async def update_consent(
        self, consent_id: str, user_id: str, updates: ConsentUpdate
    ) -> Dict[str, Any]:
        """Update a consent record"""
        # First verify the consent belongs to the user
        consent = await self.supabase.get_record("user_consents", consent_id)
        if not consent or consent["user_id"] != user_id:
            raise ValueError("Consent not found or unauthorized")

        update_data = updates.dict(exclude_unset=True)
        
        # If status is being updated, recalculate risk factors
        if "status" in update_data:
            update_data["risk_factors"] = await self._analyze_risks(
                consent["website_url"],
                consent["consent_details"]
            )

        # If auto_revoke_rule is being updated
        if "auto_revoke_rule" in update_data:
            if update_data["auto_revoke_rule"].get("enabled"):
                update_data["expiry_date"] = await self._calculate_expiry_date(
                    update_data["auto_revoke_rule"]
                )
                await self._schedule_auto_revoke(consent_id, update_data["expiry_date"])
            else:
                update_data["expiry_date"] = None
                await self._cancel_auto_revoke(consent_id)

        return await self.supabase.update_record(
            "user_consents", consent_id, update_data
        )

    async def delete_consent(self, consent_id: str, user_id: str) -> bool:
        """Delete a consent record"""
        # First verify the consent belongs to the user
        consent = await self.supabase.get_record("user_consents", consent_id)
        if not consent or consent["user_id"] != user_id:
            raise ValueError("Consent not found or unauthorized")

        if consent.get("auto_revoke_rule", {}).get("enabled"):
            await self._cancel_auto_revoke(consent_id)

        return await self.supabase.delete_record("user_consents", consent_id)

    async def _analyze_risks(
        self, website_url: str, consent_details: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Analyze risks based on consent details"""
        risks = []
        
        # Check for essential cookies consent
        if not consent_details.get("essential_cookies", True):
            risks.append({
                "risk": "Essential cookies disabled",
                "severity": "high",
                "description": "Site functionality may be impaired"
            })

        # Check for analytics consent
        if not consent_details.get("analytics", False):
            risks.append({
                "risk": "Analytics disabled",
                "severity": "low",
                "description": "Usage data collection limited"
            })

        # Check for marketing cookies
        if consent_details.get("marketing", False):
            risks.append({
                "risk": "Marketing cookies enabled",
                "severity": "medium",
                "description": "Personal data may be used for advertising"
            })

        return risks

    async def _calculate_expiry_date(self, auto_revoke_rule: Dict[str, Any]) -> datetime:
        """Calculate expiry date based on auto-revoke rule"""
        duration = auto_revoke_rule.get("duration", "30d")
        unit = duration[-1]
        value = int(duration[:-1])
        
        if unit == 'd':
            return datetime.utcnow() + timedelta(days=value)
        elif unit == 'h':
            return datetime.utcnow() + timedelta(hours=value)
        elif unit == 'm':
            return datetime.utcnow() + timedelta(minutes=value)
        else:
            raise ValueError(f"Invalid duration unit: {unit}")

    async def _schedule_auto_revoke(self, consent_id: str, expiry_date: datetime) -> None:
        """Schedule consent auto-revocation"""
        # TODO: Implement scheduling logic (e.g., using Celery or similar)
        pass

    async def _cancel_auto_revoke(self, consent_id: str) -> None:
        """Cancel scheduled auto-revocation"""
        # TODO: Implement cancellation logic
        pass

consent_service = ConsentService()
