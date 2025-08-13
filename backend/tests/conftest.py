import pytest
import sys
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from faker import Faker

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from core.database import get_db, Base
from models.user import User
from models.course import Course
from services.user_service import create_access_token, get_password_hash

fake = Faker()


def verify_api_response_structure(response_data, expected_success=None, expected_data_type=None):
    """Helper function to verify API response structure matches the expected format.
    
    Args:
        response_data: The JSON response data
        expected_success: Expected boolean value for 'success' field (optional)
        expected_data_type: Expected type for 'data' field (list, dict, type(None), etc.) (optional)
    """
    # Verify required fields exist
    assert "success" in response_data, "Response missing 'success' field"
    assert "data" in response_data, "Response missing 'data' field"
    assert "message" in response_data, "Response missing 'message' field"
    
    # Verify field types
    assert isinstance(response_data["success"], bool), "'success' field must be boolean"
    assert isinstance(response_data["message"], str), "'message' field must be string"
    assert len(response_data["message"]) > 0, "'message' field cannot be empty"
    
    # Verify expected success value if provided
    if expected_success is not None:
        assert response_data["success"] == expected_success, f"Expected success={expected_success}, got {response_data['success']}"
    
    # Verify expected data type if provided
    if expected_data_type is not None:
        assert isinstance(response_data["data"], expected_data_type), f"Expected data type {expected_data_type}, got {type(response_data['data'])}"


# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override the get_db dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """Create a test client with overridden database dependency."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def db_session():
    """Create a fresh database session for each test with complete isolation."""
    # Drop all tables first to ensure clean state
    Base.metadata.drop_all(bind=engine)
    # Create all tables fresh
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Clean up after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_user_data():
    """Sample user data for testing using Faker."""
    return {
        "email": fake.email(),
        "password": fake.password(length=12, special_chars=True, digits=True, upper_case=True, lower_case=True),
        "name": fake.name()
    }


@pytest.fixture
def sample_admin_data():
    """Sample admin user data for testing using Faker."""
    return {
        "email": fake.email(),
        "password": fake.password(length=12, special_chars=True, digits=True, upper_case=True, lower_case=True),
        "name": fake.name()
    }


@pytest.fixture
def sample_course_data():
    """Sample course data for testing using Faker."""
    return {
        "title": fake.catch_phrase(),
        "description": fake.text(max_nb_chars=200),
        "instructor_name": fake.name()
    }


@pytest.fixture
def created_user(db_session, sample_user_data):
    """Create a test user in the database with user role."""
    user = User(
        email=sample_user_data["email"],
        hashed_password=get_password_hash(sample_user_data["password"]),
        name=sample_user_data["name"],
        role="user"  # Explicitly set user role
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def created_admin(db_session, sample_admin_data):
    """Create a test admin user in the database with admin role."""
    admin = User(
        email=sample_admin_data["email"],
        hashed_password=get_password_hash(sample_admin_data["password"]),
        name=sample_admin_data["name"],
        role="admin"  # Explicitly set admin role
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def auth_headers_user(created_user):
    """Generate JWT token for regular user authentication with verified role."""
    # Ensure the user has the correct role
    assert created_user.role == "user", f"Expected user role, got {created_user.role}"
    
    token_data = {
        "sub": created_user.email,
        "role": created_user.role,
        "id": created_user.id
    }
    token = create_access_token(data=token_data)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_admin(created_admin):
    """Generate JWT token for admin user authentication with verified role."""
    # Ensure the admin has the correct role
    assert created_admin.role == "admin", f"Expected admin role, got {created_admin.role}"
    
    token_data = {
        "sub": created_admin.email,
        "role": created_admin.role,
        "id": created_admin.id
    }
    token = create_access_token(data=token_data)
    return {"Authorization": f"Bearer {token}"}