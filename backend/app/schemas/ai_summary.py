from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional, Dict, Any
from datetime import datetime

class AISummaryBase(BaseModel):
    website_url: Optional[HttpUrl] = None
    policy_text: Optional[str] = None

    @field_validator('policy_text')
    def validate_policy_text(cls, v, values):
        if not values.get('website_url') and not v:
            raise ValueError('Either website_url or policy_text must be provided')
        return v

    class Config:
        protected_namespaces = ()

class AISummaryCreate(AISummaryBase):
    pass

class AISummaryResponse(AISummaryBase):
    id: str
    user_id: str
    summary: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        protected_namespaces = ()

class AISummaryCompare(BaseModel):
    old_policy_text: str
    new_policy_text: str
    website_url: Optional[HttpUrl] = None

    class Config:
        protected_namespaces = ()

class ReadabilityScore(BaseModel):
    score: int
    complexity_level: str
    average_sentence_length: float
    technical_terms_count: int
    suggestions: list[str]

    class Config:
        protected_namespaces = ()

class PolicyAnalysis(BaseModel):
    key_points: list[str]
    data_collection: str
    data_usage: str
    data_sharing: str
    user_rights: str
    privacy_risks: Optional[list[str]]
    privacy_score: int
    compliance_status: Dict[str, str]
    readability: Optional[ReadabilityScore]
    analysis_version: str
    model_used: str

    class Config:
        protected_namespaces = ()

class PolicyCopyRequest(BaseModel):
    policy_text: str
    website_url: Optional[HttpUrl] = None
    prompt_user_id: Optional[str] = None  # ID of the user who created the prompt
    custom_prompt: Optional[str] = None   # Custom prompt if not using default
