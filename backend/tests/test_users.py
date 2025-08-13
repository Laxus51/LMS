import pytest
from fastapi.testclient import TestClient
from conftest import verify_api_response_structure


class TestUserRegistration:
    """Test cases for user registration endpoint."""

    def test_register_user_success(self, client: TestClient, sample_user_data):
        """Test successful user registration with valid data."""
        response = client.post("/users/register", json=sample_user_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=True, expected_data_type=dict)
        
        # Verify user data structure
        user_data = data["data"]
        assert "id" in user_data
        assert "email" in user_data
        assert "name" in user_data
        assert "role" in user_data
        assert user_data["email"] == sample_user_data["email"]
        assert user_data["name"] == sample_user_data["name"]
        assert user_data["role"] == "user"
        assert "password" not in user_data  # Password should not be returned

    def test_register_user_duplicate_email(self, client: TestClient, sample_user_data, created_user):
        """Test registration with duplicate email returns 400."""
        response = client.post("/users/register", json=sample_user_data)
        
        assert response.status_code == 400
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)
        assert "already registered" in data["message"].lower()

    def test_register_user_invalid_email(self, client: TestClient):
        """Test registration with invalid email format."""
        invalid_data = {
            "email": "invalid-email",
            "password": "testpassword123",
            "name": "Test User"
        }
        response = client.post("/users/register", json=invalid_data)
        
        assert response.status_code == 400
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)

    def test_register_user_missing_required_fields(self, client: TestClient):
        """Test registration with missing required fields."""
        incomplete_data = {
            "email": "test@example.com"
            # Missing password
        }
        response = client.post("/users/register", json=incomplete_data)
        
        assert response.status_code == 400
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)


class TestUserLogin:
    """Test cases for user login endpoint."""

    def test_login_success(self, client: TestClient, sample_user_data, created_user):
        """Test successful login with correct credentials."""
        login_data = {
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        response = client.post("/users/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=True, expected_data_type=dict)
        
        # Verify token data
        token_data = data["data"]
        assert "access_token" in token_data
        assert "token_type" in token_data
        assert "user" in token_data
        assert token_data["token_type"] == "bearer"
        assert len(token_data["access_token"]) > 0
        
        # Verify user data in response
        user_data = token_data["user"]
        assert user_data["email"] == sample_user_data["email"]
        assert user_data["role"] == "user"

    def test_login_wrong_password(self, client: TestClient, sample_user_data, created_user):
        """Test login with wrong password returns 401."""
        login_data = {
            "email": sample_user_data["email"],
            "password": "wrongpassword"
        }
        response = client.post("/users/login", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)
        assert "invalid" in data["message"].lower()

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent user returns 401."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "somepassword"
        }
        response = client.post("/users/login", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)
        assert "invalid" in data["message"].lower()

    def test_login_invalid_email_format(self, client: TestClient):
        """Test login with invalid email format."""
        login_data = {
            "email": "invalid-email",
            "password": "somepassword"
        }
        response = client.post("/users/login", json=login_data)
        
        assert response.status_code == 400
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)


class TestProtectedRoutes:
    """Test cases for protected routes requiring authentication."""

    def test_get_current_user_success(self, client: TestClient, auth_headers_user, created_user):
        """Test accessing /users/me with valid JWT token."""
        response = client.get("/users/me", headers=auth_headers_user)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=True, expected_data_type=dict)
        
        # Verify user data
        user_data = data["data"]
        assert "id" in user_data
        assert "email" in user_data
        assert "name" in user_data
        assert "role" in user_data
        assert user_data["email"] == created_user.email
        assert user_data["role"] == created_user.role

    def test_get_current_user_no_token(self, client: TestClient):
        """Test getting current user without token returns 401."""
        response = client.get("/users/me")
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)
        assert "not authenticated" in data["message"].lower()

    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token returns 401."""
        invalid_headers = {"Authorization": "Bearer invalid_token_here"}
        response = client.get("/users/me", headers=invalid_headers)
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)

    def test_get_current_user_malformed_token(self, client: TestClient):
        """Test accessing /users/me with malformed authorization header."""
        malformed_headers = {"Authorization": "InvalidFormat token_here"}
        response = client.get("/users/me", headers=malformed_headers)
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)

    def test_get_profile_success(self, client: TestClient, auth_headers_user, created_user):
        """Test accessing /users/profile with valid JWT token."""
        response = client.get("/users/profile", headers=auth_headers_user)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=True, expected_data_type=dict)
        
        # Verify user data
        user_data = data["data"]
        assert user_data["email"] == created_user.email
        assert user_data["role"] == created_user.role

    def test_admin_route_access_with_admin(self, client: TestClient, auth_headers_admin, created_admin):
        """Test admin route access with admin token and verified admin role."""
        # Verify the admin user actually has admin role
        assert created_admin.role == "admin", f"Expected admin role, got {created_admin.role}"
        
        response = client.get("/users/admin/users", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=True, expected_data_type=list)

    def test_admin_route_access_with_regular_user(self, client: TestClient, auth_headers_user, created_user):
        """Test admin route access with regular user token returns 403."""
        # Verify the user actually has user role (not admin)
        assert created_user.role == "user", f"Expected user role, got {created_user.role}"
        
        response = client.get("/users/admin/users", headers=auth_headers_user)
        
        # Verify HTTP 403 status for non-admin access
        assert response.status_code == 403
        data = response.json()
        
        # Verify API response structure with explicit failure
        verify_api_response_structure(data, expected_success=False)
        assert "permission" in data["message"].lower() or "admin" in data["message"].lower()

    def test_admin_route_access_no_token(self, client: TestClient):
        """Test admin route access without token returns 401."""
        response = client.get("/users/admin/users")
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)
        assert "not authenticated" in data["message"].lower()