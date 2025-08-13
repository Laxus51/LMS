from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import secrets
import string

from core.database import get_db
from core.response import success_response, error_response
from core import config
from services.user_service import get_user_by_email, create_user_oauth, create_access_token
from schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/auth/google", tags=["Google OAuth"])

# Configure OAuth
oauth_config = Config(environ={
    'GOOGLE_CLIENT_ID': config.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET': config.GOOGLE_CLIENT_SECRET,
})

oauth = OAuth(oauth_config)
oauth.register(
    name='google',
    client_id=config.GOOGLE_CLIENT_ID,
    client_secret=config.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

def generate_random_password(length: int = 16) -> str:
    """Generate a random password for OAuth users."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

@router.get("/login")
async def google_login(request: Request):
    """
    Redirect users to Google's OAuth2 login page.
    """
    try:
        # Generate the redirect URI for the callback
        redirect_uri = request.url_for('google_callback')
        
        # Redirect to Google's authorization URL
        return await oauth.google.authorize_redirect(request, redirect_uri)
    except Exception as e:
        return error_response(
            message=f"Failed to initiate Google login: {str(e)}",
            status_code=500
        )

@router.get("/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handle the OAuth2 callback from Google.
    Get user profile info and either login existing user or create new user.
    """
    try:
        # Get the authorization token from Google
        token = await oauth.google.authorize_access_token(request)
        
        # Get user info from Google
        user_info = token.get('userinfo')
        if not user_info:
            return error_response(
                message="Failed to get user information from Google",
                status_code=400
            )
        
        email = user_info.get('email')
        name = user_info.get('name', '')
        
        if not email:
            return error_response(
                message="Email not provided by Google",
                status_code=400
            )
        
        # Check if user exists in database
        existing_user = get_user_by_email(db, email)
        
        if existing_user:
            # User exists, create JWT token
            access_token = create_access_token(data={"sub": str(existing_user.id)})
            user_out = UserOut.model_validate(existing_user)
            
            return success_response(
                data={
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": user_out.model_dump(mode="json")
                },
                message="Login successful"
            )
        else:
            # User doesn't exist, create new user
            random_password = generate_random_password()
            user_create = UserCreate(
                email=email,
                password=random_password,
                name=name if name else None
            )
            
            # Create the new user
            new_user = create_user_oauth(db, user_create)
            
            # Create JWT token for new user
            access_token = create_access_token(data={"sub": str(new_user.id)})
            user_out = UserOut.model_validate(new_user)
            
            return success_response(
                data={
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": user_out.model_dump(mode="json")
                },
                message="Account created and login successful"
            )
            
    except HTTPException as he:
        return error_response(
            message=he.detail,
            status_code=he.status_code
        )
    except Exception as e:
        return error_response(
            message=f"OAuth callback failed: {str(e)}",
            status_code=500
        )

@router.get("/status")
async def google_auth_status():
    """
    Check if Google OAuth is properly configured.
    """
    try:
        if not config.GOOGLE_CLIENT_ID or not config.GOOGLE_CLIENT_SECRET:
            return error_response(
                message="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
                status_code=500
            )
        
        return success_response(
            data={"configured": True},
            message="Google OAuth is properly configured"
        )
    except Exception as e:
        return error_response(
            message=f"Failed to check OAuth status: {str(e)}",
            status_code=500
        )