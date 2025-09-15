from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.database import get_db
from utils.auth import get_current_user
from models.user import User
from schemas.payment import (
    CreateSubscriptionRequest,
    CreateSubscriptionResponse,
    SubscriptionStatus,
    CancelSubscriptionResponse,
    PortalSessionRequest,
    PortalSessionResponse
)
from services.stripe_service import StripeService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payment", tags=["payment"])
stripe_service = StripeService()

@router.post("/create-subscription", response_model=CreateSubscriptionResponse)
async def create_subscription(
    request: CreateSubscriptionRequest,
    current_user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new subscription checkout session"""
    try:
        # Get the actual user object from database
        user = db.query(User).filter(User.id == current_user_data["id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user already has an active subscription
        if user.subscription_status == 'active':
            raise HTTPException(
                status_code=400,
                detail="User already has an active subscription"
            )
        
        session_data = stripe_service.create_checkout_session(
            user_email=user.email,
            user_id=user.id,
            success_url=request.success_url,
            cancel_url=request.cancel_url
        )
        
        return CreateSubscriptionResponse(
            session_id=session_data['session_id'],
            session_url=session_data['session_url']
        )
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create subscription session"
        )

@router.get("/subscription-status", response_model=SubscriptionStatus)
async def get_subscription_status(
    current_user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's subscription status"""
    try:
        # Get the actual user object from database
        user = db.query(User).filter(User.id == current_user_data["id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if not user.subscription_id:
            return SubscriptionStatus(
                subscription_id=None,
                status=None,
                current_period_end=None,
                cancel_at_period_end=False,
                is_active=False
            )
        
        # Get latest status from Stripe
        stripe_status = stripe_service.get_subscription_status(user.subscription_id)
        
        if stripe_status:
            # Update local database with latest info
            stripe_service.update_user_subscription(
                db=db,
                user_id=user.id,
                subscription_id=stripe_status['id'],
                status=stripe_status['status'],
                current_period_end=stripe_status['current_period_end']
            )
            
            return SubscriptionStatus(
                subscription_id=stripe_status['id'],
                status=stripe_status['status'],
                current_period_end=stripe_status['current_period_end'],
                cancel_at_period_end=stripe_status['cancel_at_period_end'],
                is_active=stripe_status['status'] == 'active'
            )
        else:
            return SubscriptionStatus(
                subscription_id=user.subscription_id,
                status=user.subscription_status,
                current_period_end=user.subscription_end_date,
                cancel_at_period_end=False,
                is_active=user.subscription_status == 'active'
            )
    except Exception as e:
        logger.error(f"Error getting subscription status: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get subscription status"
        )

@router.post("/cancel-subscription", response_model=CancelSubscriptionResponse)
async def cancel_subscription(
    current_user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel user's subscription at period end"""
    try:
        # Get the actual user object from database
        user = db.query(User).filter(User.id == current_user_data["id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if not user.subscription_id:
            raise HTTPException(
                status_code=400,
                detail="No active subscription found"
            )
        
        success = stripe_service.cancel_subscription(user.subscription_id)
        
        if success:
            return CancelSubscriptionResponse(
                success=True,
                message="Subscription will be canceled at the end of the current period",
                subscription_id=user.subscription_id
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to cancel subscription"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error canceling subscription: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to cancel subscription"
        )

@router.post("/create-portal-session", response_model=PortalSessionResponse)
async def create_portal_session(
    request: PortalSessionRequest,
    current_user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a customer portal session for subscription management"""
    try:
        # Get the actual user object from database
        user = db.query(User).filter(User.id == current_user_data["id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if not user.subscription_id:
            raise HTTPException(
                status_code=400,
                detail="No subscription found"
            )
        
        # Get customer ID from subscription
        customer_id = stripe_service.get_customer_by_subscription(user.subscription_id)
        
        if not customer_id:
            raise HTTPException(
                status_code=400,
                detail="Customer not found"
            )
        
        portal_url = stripe_service.create_customer_portal_session(
            customer_id=customer_id,
            return_url=request.return_url
        )
        
        if portal_url:
            return PortalSessionResponse(url=portal_url)
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to create portal session"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating portal session: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create portal session"
        )

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="Missing signature")
        
        event = stripe_service.handle_webhook_event(payload, sig_header)
        
        if not event:
            raise HTTPException(status_code=400, detail="Invalid webhook")
        
        # Handle different event types
        if event['type'] == 'checkout.session.completed':
            await handle_checkout_completed(event['data']['object'], db)
        elif event['type'] == 'customer.subscription.updated':
            await handle_subscription_updated(event['data']['object'], db)
        elif event['type'] == 'customer.subscription.deleted':
            await handle_subscription_deleted(event['data']['object'], db)
        elif event['type'] == 'invoice.payment_failed':
            await handle_payment_failed(event['data']['object'], db)
        
        return JSONResponse(content={"status": "success"})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

async def handle_checkout_completed(session, db: Session):
    """Handle successful checkout completion"""
    try:
        user_id = int(session['metadata']['user_id'])
        subscription_id = session['subscription']
        
        # Get subscription details
        subscription_data = stripe_service.get_subscription_status(subscription_id)
        
        if subscription_data:
            stripe_service.update_user_subscription(
                db=db,
                user_id=user_id,
                subscription_id=subscription_id,
                status=subscription_data['status'],
                current_period_end=subscription_data['current_period_end']
            )
            logger.info(f"Subscription activated for user {user_id}")
    except Exception as e:
        logger.error(f"Error handling checkout completion: {e}")

async def handle_subscription_updated(subscription, db: Session):
    """Handle subscription updates"""
    try:
        user_id = int(subscription['metadata']['user_id'])
        
        stripe_service.update_user_subscription(
            db=db,
            user_id=user_id,
            subscription_id=subscription['id'],
            status=subscription['status'],
            current_period_end=subscription['current_period_end']
        )
        logger.info(f"Subscription updated for user {user_id}: {subscription['status']}")
    except Exception as e:
        logger.error(f"Error handling subscription update: {e}")

async def handle_subscription_deleted(subscription, db: Session):
    """Handle subscription cancellation"""
    try:
        user_id = int(subscription['metadata']['user_id'])
        
        stripe_service.update_user_subscription(
            db=db,
            user_id=user_id,
            subscription_id=subscription['id'],
            status='canceled',
            current_period_end=subscription['current_period_end']
        )
        logger.info(f"Subscription canceled for user {user_id}")
    except Exception as e:
        logger.error(f"Error handling subscription deletion: {e}")

async def handle_payment_failed(invoice, db: Session):
    """Handle failed payment"""
    try:
        subscription_id = invoice['subscription']
        subscription_data = stripe_service.get_subscription_status(subscription_id)
        
        if subscription_data:
            user_id = int(subscription_data['metadata']['user_id'])
            
            stripe_service.update_user_subscription(
                db=db,
                user_id=user_id,
                subscription_id=subscription_id,
                status='past_due',
                current_period_end=subscription_data['current_period_end']
            )
            logger.info(f"Payment failed for user {user_id}, subscription marked as past_due")
    except Exception as e:
        logger.error(f"Error handling payment failure: {e}")

@router.post("/verify-subscription")
async def verify_subscription_payment(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify subscription payment and update user role"""
    try:
        result = stripe_service.verify_subscription_payment(session_id)
        
        if result and result['user_id'] == current_user['id']:
            # Update user subscription
            success = stripe_service.update_user_subscription(
                db=db,
                user_id=result['user_id'],
                subscription_id=result['subscription_id'],
                status=result['status'],
                current_period_end=result['current_period_end']
            )
            
            if success:
                return {"success": True, "status": "subscription_activated"}
            else:
                return {"success": False, "error": "Failed to update subscription"}
        else:
            return {"success": False, "error": "Payment verification failed"}
            
    except Exception as e:
        logger.error(f"Error verifying subscription payment: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify subscription payment")