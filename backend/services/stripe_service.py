import stripe
from typing import Optional, Dict, Any
from core.config import STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET
from models.user import User, UserRole
from sqlalchemy.orm import Session
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class StripeService:
    def __init__(self):
        stripe.api_key = STRIPE_SECRET_KEY
    
    def create_checkout_session(
        self, 
        user_email: str, 
        user_id: int,
        success_url: str, 
        cancel_url: str
    ) -> Dict[str, str]:
        """Create a Stripe checkout session for subscription"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': STRIPE_PRICE_ID,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=user_email,
                metadata={
                    'user_id': str(user_id)
                },
                subscription_data={
                    'metadata': {
                        'user_id': str(user_id)
                    }
                }
            )
            
            return {
                'session_id': session.id,
                'session_url': session.url
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating checkout session: {e}")
            raise Exception(f"Failed to create checkout session: {str(e)}")
    
    def get_subscription_status(self, subscription_id: str) -> Optional[Dict[str, Any]]:
        """Get subscription status from Stripe"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return {
                'id': subscription.id,
                'status': subscription.status,
                'current_period_end': datetime.fromtimestamp(subscription.current_period_end),
                'cancel_at_period_end': subscription.cancel_at_period_end,
                'customer_id': subscription.customer
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error retrieving subscription: {e}")
            return None
    
    def cancel_subscription(self, subscription_id: str) -> bool:
        """Cancel a subscription at period end"""
        try:
            stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            return True
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error canceling subscription: {e}")
            return False
    
    def create_customer_portal_session(self, customer_id: str, return_url: str) -> Optional[str]:
        """Create a customer portal session for subscription management"""
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            return session.url
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating portal session: {e}")
            return None
    
    def handle_webhook_event(self, payload: bytes, sig_header: str) -> Optional[Dict[str, Any]]:
        """Handle and verify Stripe webhook events"""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
            return event
        except ValueError as e:
            logger.error(f"Invalid payload: {e}")
            return None
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {e}")
            return None
    
    def update_user_subscription(
        self, 
        db: Session, 
        user_id: int, 
        subscription_id: str, 
        status: str, 
        current_period_end: datetime
    ) -> bool:
        """Update user subscription information in database"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.error(f"User {user_id} not found")
                return False
            
            user.subscription_id = subscription_id
            user.subscription_status = status
            user.subscription_end_date = current_period_end
            
            # Update role based on subscription status
            if status == 'active':
                user.role = UserRole.PREMIUM
            elif status in ['canceled', 'past_due', 'unpaid']:
                user.role = UserRole.FREE
            
            db.commit()
            logger.info(f"Updated subscription for user {user_id}: {status}")
            return True
        except Exception as e:
            logger.error(f"Error updating user subscription: {e}")
            db.rollback()
            return False
    
    def get_customer_by_subscription(self, subscription_id: str) -> Optional[str]:
        """Get customer ID from subscription"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription.customer
        except stripe.error.StripeError as e:
            logger.error(f"Error retrieving customer from subscription: {e}")
            return None
    
    def create_session_payment(
        self, 
        amount: int,  # Amount in cents
        currency: str,
        description: str,
        student_email: str,
        session_id: int,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, str]:
        """Create a Stripe checkout session for one-time mentor session payment"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': currency,
                        'product_data': {
                            'name': 'Mentor Session',
                            'description': description,
                        },
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                }],
                mode='payment',  # One-time payment
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=student_email,
                metadata={
                    'session_id': str(session_id),
                    'type': 'mentor_session'
                }
            )
            
            return {
                'session_id': session.id,
                'session_url': session.url
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating session payment: {e}")
            raise Exception(f"Failed to create payment session: {str(e)}")
    
    def get_payment_intent_status(self, payment_intent_id: str) -> Optional[Dict[str, Any]]:
        """Get payment intent status from Stripe"""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                'id': payment_intent.id,
                'status': payment_intent.status,
                'amount': payment_intent.amount,
                'currency': payment_intent.currency,
                'metadata': payment_intent.metadata
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error retrieving payment intent: {e}")
            return None
    
    def get_checkout_session(self, session_id: str) -> Optional[Any]:
        """Get checkout session from Stripe"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return session
        except stripe.error.StripeError as e:
            logger.error(f"Error retrieving checkout session: {e}")
            return None
    
    def verify_subscription_payment(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Verify subscription payment and return user info"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            
            if session.payment_status == 'paid' and session.subscription:
                subscription = stripe.Subscription.retrieve(session.subscription)
                
                return {
                    'user_id': int(session.metadata.get('user_id')),
                    'subscription_id': subscription.id,
                    'status': subscription.status,
                    'current_period_end': subscription.current_period_end
                }
            
            return None
            
        except stripe.error.StripeError as e:
            logger.error(f"Error verifying subscription payment: {e}")
            return None