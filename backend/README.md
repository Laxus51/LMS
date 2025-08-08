# LMS Backend API Documentation

## Overview
This project is a Learning Management System (LMS) backend built with FastAPI. Below are the available API endpoints.

## API Endpoints

### Health Check
- **GET /health**
  - Description: Check the health status of the application.
  - Response: `{ "status": "ok" }`

### User Management
#### Public Endpoints
- **POST /users/register**
  - Description: Register a new user.
  - Request Body:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword"
    }
    ```
  - Response:
    ```json
    {
      "id": 1,
      "email": "user@example.com"
    }
    ```

- **POST /users/login**
  - Description: Authenticate a user and return a JWT token.
  - Request Body:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword"
    }
    ```
  - Response:
    ```json
    {
      "access_token": "jwt_token",
      "token_type": "bearer",
      "user": {
        "id": 1,
        "email": "user@example.com"
      }
    }
    ```

#### Protected Endpoints
- **GET /users/profile**
  - Description: Get the profile of the currently logged-in user.
  - Response:
    ```json
    {
      "message": "Welcome, user@example.com",
      "role": "user"
    }
    ```

- **GET /users/me**
  - Description: Get details of the currently logged-in user.
  - Response:
    ```json
    {
      "id": 1,
      "email": "user@example.com"
    }
    ```

#### Admin Endpoints
- **GET /users/admin/users**
  - Description: List all users (Admin only).
  - Response:
    ```json
    [
      {
        "id": 1,
        "email": "user@example.com"
      },
      {
        "id": 2,
        "email": "admin@example.com"
      }
    ]
    ```

### Course Management
#### Protected Endpoints
- **GET /courses/**
  - Description: List all available courses (Authenticated users).
  - Response:
    ```json
    [
      {
        "id": 1,
        "title": "Course Title",
        "description": "Course Description"
      }
    ]
    ```

- **GET /courses/search**
  - Description: Search courses by keyword.
  - Query Parameters: `keyword` (string), `limit` (integer, default: 10)
  - Response:
    ```json
    [
      {
        "id": 1,
        "title": "Matching Course",
        "description": "Course Description"
      }
    ]
    ```

#### Admin Endpoints
- **POST /courses/**
  - Description: Create a new course (Admin only).
  - Request Body:
    ```json
    {
      "title": "New Course",
      "description": "Course Description"
    }
    ```
  - Response:
    ```json
    {
      "id": 1,
      "title": "New Course",
      "description": "Course Description"
    }
    ```

### Module Management
#### Protected Endpoints
- **GET /courses/{course_id}/modules**
  - Description: List all modules for a specific course.
  - Response:
    ```json
    [
      {
        "id": 1,
        "title": "Module Title",
        "content": "Module Content",
        "course_id": 1
      }
    ]
    ```

#### Admin Endpoints
- **POST /courses/{course_id}/modules**
  - Description: Add a new module to a course (Admin only).
  - Request Body:
    ```json
    {
      "title": "Module Title",
      "content": "Module Content"
    }
    ```
  - Response:
    ```json
    {
      "id": 1,
      "title": "Module Title",
      "content": "Module Content",
      "course_id": 1
    }
    ```

### Progress Tracking
#### Student Endpoints
- **POST /modules/{module_id}/complete**
  - Description: Mark a module as completed (Students only).
  - Response:
    ```json
    {
      "id": 1,
      "user_id": 1,
      "module_id": 1,
      "status": "completed"
    }
    ```

### Notifications
#### Protected Endpoints
- **GET /notifications/**
  - Description: List all notifications (ordered by creation date).
  - Response:
    ```json
    [
      {
        "id": 1,
        "message": "Notification message",
        "created_by": 1,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
    ```

#### Admin Endpoints
- **POST /notifications/**
  - Description: Create a new notification (Admin only).
  - Request Body:
    ```json
    {
      "message": "Important announcement"
    }
    ```
  - Response:
    ```json
    {
      "id": 1,
      "message": "Important announcement",
      "created_by": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
    ```

## Authentication
- **JWT Token**
  - All protected endpoints require a valid JWT token in the `Authorization` header.
  - Example:
    ```
    Authorization: Bearer jwt_token
    ```

## Technologies Used
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

## Environment Variables
- `DATABASE_URL`: Database connection URL
- `JWT_SECRET_KEY`: Secret key for JWT
- `JWT_ALGORITHM`: Algorithm for JWT
- `JWT_EXPIRATION_MINUTES`: Token expiration time in minutes

---
For more details, refer to the source code.