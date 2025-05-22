from pydantic import BaseModel, HttpUrl
from typing import Dict, List, Optional
from datetime import datetime

class AutoRevokeRule(BaseModel):
    enabled: bool
    duration: str  # Format: "30d", "24h", "60m"
    reason: Optional[str]

class ConsentDetails(BaseModel):
    essential_cookies: bool = True
    analytics: bool = False
    marketing: bool = False
    third_party: bool = False
    preferences: bool = False

class RiskFactor(BaseModel):
    risk: str
    severity: str  # "high", "medium", "low"
    description: str

class ConsentBase(BaseModel):
    website_url: HttpUrl
    consent_type: str  # "cookie", "privacy_policy", "terms"
    status: bool = False
    consent_details: ConsentDetails
    auto_revoke_rule: Optional[AutoRevokeRule]

class ConsentCreate(ConsentBase):
    pass

class ConsentUpdate(BaseModel):
    status: Optional[bool]
    consent_details: Optional[ConsentDetails]
    auto_revoke_rule: Optional[AutoRevokeRule]

class ConsentResponse(ConsentBase):
    id: str
    user_id: str
    risk_factors: List[RiskFactor]
    expiry_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ConsentHistory(BaseModel):
    id: str
    consent_id: str
    changes: Dict[str, any]
    changed_at: datetime
    changed_by: str

class ConsentStats(BaseModel):
    total_consents: int
    active_consents: int
    revoked_consents: int
    auto_revoke_enabled: int
    high_risk_consents: int
    medium_risk_consents: int
    low_risk_consents: int
    most_common_website: Optional[str]
    most_common_consent_type: Optional[str]
