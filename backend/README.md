# Learning Management System (LMS) Backend

A FastAPI-based backend for a Learning Management System with comprehensive course management, user authentication, progress tracking, notifications, and Google OAuth integration.

## Features

- **User Management**: Registration, authentication, profile management, and admin user listing
- **Course Management**: Create, read, and search courses with module support
- **Progress Tracking**: Track student completion of modules with completion/uncompletion functionality
- **Notifications**: Admin-created notifications with read status tracking
- **Google OAuth**: Google Sign-In integration alongside traditional email authentication
- **Admin Dashboard**: Dashboard statistics and administrative functions
- **JWT Authentication**: Secure token-based authentication with role-based access
- **Database Integration**: PostgreSQL with SQLAlchemy ORM
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

## Tech Stack

- **Framework**: FastAPI 0.116.1
- **Database**: PostgreSQL with SQLAlchemy 2.0.42
- **Authentication**: JWT + Google OAuth (Authlib)
- **Password Hashing**: bcrypt

- **Environment Management**: python-dotenv

## Project Structure

```
backend/
├── core/                   # Core configuration and utilities
│   ├── config.py          # Environment and OAuth configuration
│   ├── database.py        # Database connection and session
│   └── response.py        # Standardized API responses
├── models/                 # SQLAlchemy database models
│   ├── user.py           # User model with OAuth support
│   ├── course.py         # Course model
│   ├── module.py         # Module model
│   ├── progress.py       # Progress tracking model
│   └── notification.py   # Notification model
├── schemas/               # Pydantic schemas for request/response
├── services/              # Business logic layer
│   └── openai_service.py # OpenAI service (available for future use)
├── routers/               # API route handlers
│   ├── user.py           # User and admin endpoints
│   ├── courses.py        # Course management
│   ├── module.py         # Module management
│   ├── progress.py       # Progress tracking
│   ├── notifications.py  # Notification system
│   ├── google_auth.py    # Google OAuth integration
│   ├── dashboard.py      # Dashboard statistics

│   └── health.py         # Health check endpoint
├── utils/                 # Utility functions
│   └── auth.py           # Authentication and authorization
├── tests/                 # Test files
├── main.py               # FastAPI application entry point
└── requirements.txt      # Python dependencies
```

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

### Authentication

#### Traditional Authentication
- `POST /users/register` - Register new user with email/password
- `POST /users/login` - Login with email/password
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `GET /users/me` - Get current user details

#### Google OAuth
- `GET /auth/google/login` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Handle Google OAuth callback
- `GET /auth/google/status` - Check Google OAuth configuration

### User Management (Admin)
- `GET /users/admin/users` - List all users (Admin only)

### Course Management
- `GET /courses/` - List all courses
- `POST /courses/` - Create new course (Admin only)
- `GET /courses/search` - Search courses by keyword
- `GET /courses/{course_id}` - Get course details

### Module Management
- `POST /courses/{course_id}/modules` - Add module to course (Admin only)
- `GET /courses/{course_id}/modules` - List course modules

### Progress Tracking
- `POST /progress/modules/{module_id}/complete` - Mark module as completed
- `POST /progress/modules/{module_id}/uncomplete` - Unmark module completion
- `GET /progress/user` - Get current user's progress

### Notifications
- `POST /notifications/` - Create notification (Admin only)
- `GET /notifications/` - List all notifications
- `PATCH /notifications/{notification_id}/read` - Mark notification as read

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics



### Health Check
- `GET /health` - API health status

---

## Authentication

All endpoints except `/health` and Google OAuth endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Role-Based Access
- **Admin**: Full access to all endpoints including user management, course/module creation, and notifications
- **User**: Access to courses, modules, progress tracking, and profile management

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "data": {...},
  "message": "Description of the result"
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

## Database Models

- **User**: Email/password authentication, Google OAuth support, role-based access
- **Course**: Title, description, instructor information
- **Module**: Course content with external links
- **Progress**: User completion tracking per module
- **Notification**: Admin announcements with read status

## Security Features

- JWT token authentication with configurable expiration
- bcrypt password hashing
- Role-based access control (admin/user)
- Google OAuth integration
- Input validation with Pydantic schemas
- CORS middleware for frontend integration

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

# Google OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Application Settings
DEBUG=True
APP_NAME=LMS Backend API
```

---

## Getting Started

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- Google OAuth2 credentials (optional)

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Database Setup (PostgreSQL)**
   
   **Install PostgreSQL:**
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`
   
   **Create Database:**
   ```bash
   # Start PostgreSQL service
   # Windows: Start via Services or pgAdmin
   # macOS: brew services start postgresql
   # Linux: sudo systemctl start postgresql
   
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database and user
   CREATE DATABASE lms_db;
   CREATE USER lms_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
   \q
   ```

3. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://lms_user:your_password@localhost/lms_db
   JWT_SECRET_KEY=your-secret-key-here
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION_MINUTES=30
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   OPENAI_API_KEY=your-openai-api-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_MAX_TOKENS=1000
   OPENAI_TEMPERATURE=0.7
   SESSION_SECRET_KEY=your-session-secret
   LOG_RESPONSE_TIME=true
   ```

6. **Initialize Database Tables**
   ```bash
   python -c "from core.database import engine; from models import *; Base.metadata.create_all(bind=engine)"
   ```

7. **Run the application**
   ```bash
   uvicorn main:app --reload
   ```
   
   - API: `http://localhost:8000`
   - Documentation: `http://localhost:8000/docs`

### Database Troubleshooting

**Connection Issues:**
- Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux)
- Test connection: `psql -U lms_user -d lms_db -h localhost`
- Verify DATABASE_URL format in .env

**Docker Alternative:**
```bash
docker run --name lms-postgres \
  -e POSTGRES_DB=lms_db \
  -e POSTGRES_USER=lms_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:13
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html
```

## API Documentation

Interactive documentation is available when the server is running:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Support
For questions or issues, please refer to the source code.

**Last Updated**: August 2025