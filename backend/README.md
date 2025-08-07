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