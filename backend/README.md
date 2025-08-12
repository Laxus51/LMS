# LMS Backend API Documentation

## Overview
This project is a Learning Management System (LMS) backend built with FastAPI. It provides comprehensive APIs for user management, course administration, module tracking, progress monitoring, and notifications.

## Base URL
```
http://localhost:8000
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Health Check

#### GET /health
**Description:** Check the health status of the application  
**Authentication:** None required  
**Response:**
```json
{
  "status": "ok"
}
```

---

## User Management

### Public Endpoints

#### POST /users/register
**Description:** Register a new user account  
**Authentication:** None required  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```
**Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### POST /users/login
**Description:** Authenticate user and receive JWT token  
**Authentication:** None required  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

### Protected Endpoints

#### GET /users/profile
**Description:** Get current user's profile information  
**Authentication:** JWT token required  
**Success Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### PUT /users/profile
**Description:** Update current user's profile  
**Authentication:** JWT token required  
**Request Body:**
```json
{
  "name": "John Smith",
  "password": "newpassword123"
}
```
**Success Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Smith",
    "role": "user"
  }
}
```

#### GET /users/me
**Description:** Get current user details  
**Authentication:** JWT token required  
**Success Response:**
```json
{
  "success": true,
  "message": "Current user retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Admin Endpoints

#### GET /users/admin/users
**Description:** List all users in the system  
**Authentication:** Admin JWT token required  
**Success Response:**
```json
{
  "success": true,
  "message": "All users retrieved successfully",
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    {
      "id": 2,
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    }
  ]
}
```

---

## Course Management

### Protected Endpoints

#### GET /courses/
**Description:** List all available courses  
**Authentication:** JWT token required  
**Success Response:**
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Introduction to Python",
      "description": "Learn Python programming from basics to advanced",
      "instructor_name": "Dr. Jane Smith"
    },
    {
      "id": 2,
      "title": "Web Development with FastAPI",
      "description": "Build modern web APIs with FastAPI",
      "instructor_name": "Prof. John Wilson"
    }
  ]
}
```

#### GET /courses/search
**Description:** Search courses by keyword  
**Authentication:** JWT token required  
**Query Parameters:**
- `keyword` (string, required): Search term
- `limit` (integer, optional): Maximum results (default: 10)

**Example:** `/courses/search?keyword=python&limit=5`

**Success Response:**
```json
{
  "success": true,
  "message": "Courses search results",
  "data": [
    {
      "id": 1,
      "title": "Introduction to Python",
      "description": "Learn Python programming from basics to advanced",
      "instructor_name": "Dr. Jane Smith"
    }
  ]
}
```

### Admin Endpoints

#### POST /courses/
**Description:** Create a new course  
**Authentication:** Admin JWT token required  
**Request Body:**
```json
{
  "title": "Advanced JavaScript",
  "description": "Master advanced JavaScript concepts and patterns",
  "instructor_name": "Sarah Johnson"
}
```
**Success Response:**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": 3,
    "title": "Advanced JavaScript",
    "description": "Master advanced JavaScript concepts and patterns",
    "instructor_name": "Sarah Johnson"
  }
}
```

---

## Module Management

### Protected Endpoints

#### GET /courses/{course_id}/modules
**Description:** List all modules for a specific course  
**Authentication:** JWT token required  
**Path Parameters:**
- `course_id` (integer): ID of the course

**Success Response:**
```json
{
  "success": true,
  "message": "Modules retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Python Basics",
      "content_link": "https://example.com/python-basics"
    },
    {
      "id": 2,
      "title": "Variables and Data Types",
      "content_link": "https://example.com/variables-datatypes"
    }
  ]
}
```

### Admin Endpoints

#### POST /courses/{course_id}/modules
**Description:** Add a new module to a course  
**Authentication:** Admin JWT token required  
**Path Parameters:**
- `course_id` (integer): ID of the course

**Request Body:**
```json
{
  "title": "Functions and Methods",
  "content_link": "https://example.com/functions-methods"
}
```
**Success Response:**
```json
{
  "success": true,
  "message": "Module created successfully",
  "data": {
    "id": 3,
    "title": "Functions and Methods",
    "content_link": "https://example.com/functions-methods"
  }
}
```

---

## Progress Tracking

### Student Endpoints

#### POST /modules/{module_id}/complete
**Description:** Mark a module as completed (Students only)  
**Authentication:** JWT token required (user role)  
**Path Parameters:**
- `module_id` (integer): ID of the module to complete

**Success Response:**
```json
{
  "success": true,
  "message": "Module marked as completed",
  "data": {
    "id": 1,
    "module_id": 5,
    "status": "completed"
  }
}
```

**Error Response (Admin/Instructor trying to complete):**
```json
{
  "success": false,
  "message": "Only students can complete modules",
  "status_code": 403
}
```

---

## Notifications

### Protected Endpoints

#### GET /notifications/
**Description:** List all notifications ordered by creation date  
**Authentication:** JWT token required  
**Success Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": 1,
      "message": "New course 'Advanced JavaScript' has been added!",
      "created_at": "2024-01-15T10:30:00Z",
      "created_by": 2
    },
    {
      "id": 2,
      "message": "System maintenance scheduled for this weekend",
      "created_at": "2024-01-14T09:15:00Z",
      "created_by": 1
    }
  ]
}
```

### Admin Endpoints

#### POST /notifications/
**Description:** Create a new notification  
**Authentication:** Admin JWT token required  
**Request Body:**
```json
{
  "message": "Welcome to the new semester! Check out our latest courses."
}
```
**Success Response:**
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": 3,
    "message": "Welcome to the new semester! Check out our latest courses.",
    "created_at": "2024-01-16T14:20:00Z",
    "created_by": 2
  }
}
```

---

## Error Responses

All endpoints return standardized error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "status_code": 400
}
```

### Common HTTP Status Codes
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server-side errors

### Example Error Responses

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "status_code": 422
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Could not validate credentials",
  "status_code": 401
}
```

**Permission Error (403):**
```json
{
  "success": false,
  "message": "Admin access required",
  "status_code": 403
}
```

---

## Data Models

### User Roles
- **user**: Regular student with access to courses and modules
- **admin**: Administrator with full system access

### Module Status
- **completed**: Module has been finished by the student
- **in_progress**: Module is currently being studied
- **not_started**: Module has not been accessed yet

---

## Rate Limiting
Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## Technologies Used
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM)
- **PostgreSQL**: Advanced open-source relational database
- **JWT**: JSON Web Tokens for secure authentication
- **bcrypt**: Password hashing library for security
- **Pydantic**: Data validation using Python type annotations

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/lms_db

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30

# Application Settings
DEBUG=True
APP_NAME=LMS Backend API
```

---

## Getting Started

### Prerequisites
- Python 3.8+
- PostgreSQL database
- pip package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables (see above)
4. Run database migrations
5. Start the development server:
   ```bash
   uvicorn main:app --reload
   ```

### API Documentation
Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Support
For questions or issues, please refer to the source code.

**Last Updated**: August 2025