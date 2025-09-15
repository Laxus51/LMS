from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CreateSubscriptionRequest(BaseModel):
    """Request schema for creating a new subscription"""
    price_id: str
    success_url: str
    cancel_url: str

class CreateSubscriptionResponse(BaseModel):
    """Response schema for subscription creation"""
    session_id: str
    session_url: str

class SubscriptionStatus(BaseModel):
    """Schema for subscription status information"""
    subscription_id: Optional[str] = None
    status: Optional[str] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    is_active: bool = False

class CancelSubscriptionResponse(BaseModel):
    """Response schema for subscription cancellation"""
    success: bool
    message: str
    subscription_id: str

class WebhookEvent(BaseModel):
    """Schema for Stripe webhook events"""
    id: str
    type: str
    data: dict

class PortalSessionRequest(BaseModel):
    """Request schema for creating customer portal session"""
    return_url: str

class PortalSessionResponse(BaseModel):
    """Response schema for customer portal session"""
    url: str