import pytest
from fastapi.testclient import TestClient
from conftest import verify_api_response_structure


class TestCourseCreation:
    """Test cases for course creation endpoint."""

    def test_create_course_success_admin(self, client: TestClient, auth_headers_admin, sample_course_data, created_admin):
        """Test successful course creation by admin user."""
        # Verify the admin user actually has admin role
        assert created_admin.role == "admin", f"Expected admin role, got {created_admin.role}"
        
        response = client.post("/courses/", json=sample_course_data, headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=True, expected_data_type=dict)
        
        assert data["message"] == "Course created successfully"
        
        # Verify course data structure
        course_data = data["data"]
        assert "id" in course_data
        assert "title" in course_data
        assert "description" in course_data
        assert "instructor_name" in course_data
        assert course_data["title"] == sample_course_data["title"]
        assert course_data["description"] == sample_course_data["description"]
        assert course_data["instructor_name"] == sample_course_data["instructor_name"]
        assert isinstance(course_data["id"], int)
        assert course_data["id"] > 0

    def test_create_course_forbidden_regular_user(self, client: TestClient, auth_headers_user, sample_course_data, created_user):
        """Test course creation by regular user returns 403."""
        # Verify the user actually has user role (not admin)
        assert created_user.role == "user", f"Expected user role, got {created_user.role}"
        
        response = client.post("/courses/", json=sample_course_data, headers=auth_headers_user)
        
        # Verify HTTP 403 status for non-admin course creation
        assert response.status_code == 403
        data = response.json()
        
        # Verify API response structure with explicit failure
        verify_api_response_structure(data, expected_success=False)
        assert "permission" in data["message"].lower() or "admin" in data["message"].lower()

    def test_create_course_unauthorized_no_token(self, client: TestClient, sample_course_data):
        """Test course creation without authentication returns 401."""
        response = client.post("/courses/", json=sample_course_data)
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)
        assert "not authenticated" in data["message"].lower()

    def test_create_course_invalid_token(self, client: TestClient, sample_course_data):
        """Test course creation with invalid token returns 401."""
        invalid_headers = {"Authorization": "Bearer invalid_token_here"}
        response = client.post("/courses/", json=sample_course_data, headers=invalid_headers)
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)

    def test_create_course_missing_required_fields(self, client: TestClient, auth_headers_admin):
        """Test course creation with missing required fields returns 400."""
        incomplete_data = {"title": "Test Course"}  # Missing description and instructor
        response = client.post("/courses/", json=incomplete_data, headers=auth_headers_admin)
        
        assert response.status_code == 400
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)

    def test_create_course_empty_description(self, client: TestClient, auth_headers_admin):
        """Test course creation with empty description returns 400."""
        invalid_data = {
            "title": "Valid title",
            "description": "",
            "instructor": "Valid instructor"
        }
        response = client.post("/courses/", json=invalid_data, headers=auth_headers_admin)
        
        assert response.status_code == 400
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)


class TestCourseRetrieval:
    """Test cases for course retrieval endpoints."""

    def test_list_courses_success_authenticated_user(self, client: TestClient, auth_headers_user):
        """Test listing courses with authenticated user."""
        response = client.get("/courses/", headers=auth_headers_user)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=True, expected_data_type=list)
        assert data["message"] == "Courses retrieved successfully"

    def test_list_courses_success_admin(self, client: TestClient, auth_headers_admin):
        """Test getting all courses with admin token."""
        response = client.get("/courses/", headers=auth_headers_admin)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=True, expected_data_type=list)

    def test_get_all_courses_no_token(self, client: TestClient):
        """Test getting all courses without token returns 401."""
        response = client.get("/courses/")
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)
        assert "not authenticated" in data["message"].lower()

    def test_list_courses_invalid_token(self, client: TestClient):
        """Test listing courses with invalid token returns 401."""
        invalid_headers = {"Authorization": "Bearer invalid_token_here"}
        response = client.get("/courses/", headers=invalid_headers)
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)

    def test_search_courses_success(self, client: TestClient, auth_headers_user, auth_headers_admin, sample_course_data):
        """Test course search with authenticated user."""
        # First create a course to search for
        client.post("/courses/", json=sample_course_data, headers=auth_headers_admin)
        
        # Use the first word from the course title to ensure a match
        search_keyword = sample_course_data["title"].split()[0].lower()
        response = client.get(f"/courses/search?keyword={search_keyword}", headers=auth_headers_user)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=True, expected_data_type=list)

    def test_search_courses_unauthorized(self, client: TestClient):
        """Test course search without authentication returns 401."""
        response = client.get("/courses/search?keyword=python")
        
        assert response.status_code == 401
        data = response.json()
        
        # Verify API response structure
        verify_api_response_structure(data, expected_success=False)
        assert "not authenticated" in data["message"].lower()


class TestCoursePermissions:
    """Test cases for course-related permission checks."""

    def test_admin_can_create_multiple_courses(self, client: TestClient, auth_headers_admin):
        """Test that admin can create multiple courses."""
        course_data_1 = {
            "title": "Course 1",
            "description": "First course description",
            "instructor_name": "Instructor 1"
        }
        course_data_2 = {
            "title": "Course 2",
            "description": "Second course description",
            "instructor_name": "Instructor 2"
        }
        
        # Create first course
        response1 = client.post("/courses/", json=course_data_1, headers=auth_headers_admin)
        assert response1.status_code == 200
        
        # Create second course
        response2 = client.post("/courses/", json=course_data_2, headers=auth_headers_admin)
        assert response2.status_code == 200
        
        # Verify both courses have different IDs
        data1 = response1.json()
        data2 = response2.json()
        assert data1["data"]["id"] != data2["data"]["id"]

    def test_regular_user_cannot_create_any_course(self, client: TestClient, auth_headers_user):
        """Test that regular user cannot create any course regardless of data."""
        course_variations = [
            {
                "title": "Simple Course",
                "description": "Simple description",
                "instructor_name": "Simple Instructor"
            },
            {
                "title": "Advanced Course",
                "description": "Advanced description with more details",
                "instructor_name": "Advanced Instructor"
            }
        ]
        
        for course_data in course_variations:
            response = client.post("/courses/", json=course_data, headers=auth_headers_user)
            assert response.status_code == 403
            data = response.json()
            assert "success" in data
            assert "message" in data
            assert data["success"] is False
            assert "permission" in data["message"].lower() or "admin" in data["message"].lower()

    def test_malformed_auth_header_course_creation(self, client: TestClient, sample_course_data):
        """Test course creation with malformed authorization header."""
        malformed_headers = {"Authorization": "InvalidFormat token_here"}
        response = client.post("/courses/", json=sample_course_data, headers=malformed_headers)
        
        assert response.status_code == 401
        data = response.json()
        
        assert "success" in data
        assert "message" in data
        assert data["success"] is False