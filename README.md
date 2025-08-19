# Learning Management System (LMS)

A modern, full-stack Learning Management System built with FastAPI backend and React frontend, featuring user authentication, course management, progress tracking, and admin functionality.

## 🚀 Features

### Student Features
- **Authentication**: Email/password login and Google OAuth integration
- **Dashboard**: Personal learning statistics and progress overview
- **Course Management**: Browse, search, and enroll in courses
- **Progress Tracking**: Module completion tracking with visual progress indicators
- **Profile Management**: Update personal information and preferences
- **Notifications**: Real-time system notifications

### Admin Features
- **User Management**: View and manage all system users
- **Course Creation**: Create and manage courses with detailed information
- **Module Management**: Add modules to courses with content links
- **Analytics**: System-wide statistics and user progress monitoring
- **Notification System**: Send notifications to users

### Technical Features
- **RESTful API**: Well-documented FastAPI backend with automatic OpenAPI documentation
- **JWT Authentication**: Secure token-based authentication with role-based access control
- **Database Integration**: PostgreSQL with SQLAlchemy ORM
- **Modern Frontend**: React with Vite, Tailwind CSS, and responsive design
- **Real-time Updates**: Live progress tracking and notifications
- **Error Handling**: Comprehensive error handling and user feedback

## 🏗️ Architecture

```
LMS/
├── backend/                 # FastAPI Backend
│   ├── core/               # Core configurations and utilities
│   ├── models/             # Database models (SQLAlchemy)
│   ├── routers/            # API route handlers
│   ├── schemas/            # Pydantic schemas for validation
│   ├── services/           # Business logic layer
│   ├── utils/              # Utility functions
│   └── tests/              # Backend tests
└── frontend/               # React Frontend
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Application pages
    │   ├── contexts/       # React contexts
    │   └── services/       # API integration
    └── public/             # Static assets
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.115.6
- **Database**: PostgreSQL with SQLAlchemy 2.0.36
- **Authentication**: JWT with python-jose, bcrypt for password hashing
- **Validation**: Pydantic 2.10.4
- **Testing**: pytest 8.3.4
- **Documentation**: Automatic OpenAPI/Swagger documentation

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.0
- **Styling**: Tailwind CSS 4.1.12
- **HTTP Client**: Axios 1.11.0
- **Icons**: Lucide React 0.539.0

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd LMS
```

### 2. Database Setup (PostgreSQL)

#### Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql` or download from postgresql.org
- **Linux**: `sudo apt-get install postgresql postgresql-contrib` (Ubuntu/Debian)

#### Create Database
```bash
# Start PostgreSQL service (if not auto-started)
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

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment configuration
cp .env.example .env
# Edit .env with your database credentials:
# DATABASE_URL=postgresql://lms_user:your_password@localhost/lms_db

# Initialize database tables
python -c "from core.database import engine; from models import *; Base.metadata.create_all(bind=engine)"

# Run the application
python main.py
```

Backend will be available at `http://localhost:8000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env
# Update VITE_API_URL if needed (default: http://localhost:8000)

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🗄️ Database Troubleshooting

### Common Issues

**Connection refused errors:**
- Ensure PostgreSQL service is running
- Check if the port 5432 is available
- Verify DATABASE_URL in .env file

**Permission denied:**
- Make sure the database user has proper privileges
- Try connecting with `psql -U lms_user -d lms_db -h localhost`

**Tables not created:**
- Run the table creation command manually:
  ```bash
  cd backend
  python -c "from core.database import engine; from models import *; Base.metadata.create_all(bind=engine)"
  ```

### Alternative: Using Docker (Optional)

For easier database setup, you can use Docker:

```bash
# Run PostgreSQL in Docker
docker run --name lms-postgres \
  -e POSTGRES_DB=lms_db \
  -e POSTGRES_USER=lms_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:13

# Your DATABASE_URL would be:
# DATABASE_URL=postgresql://lms_user:your_password@localhost:5432/lms_db
```

## 📚 API Documentation

Once the backend is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost/lms_db

# JWT Configuration
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session
SESSION_SECRET_KEY=your-session-secret

# Logging
LOG_RESPONSE_TIME=true
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=. --cov-report=html  # With coverage
```

### Frontend Tests
```bash
cd frontend
npm run lint
```

## 📦 Production Deployment

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the individual README files in `backend/` and `frontend/` directories
- Open an issue for bug reports or feature requests

## 🔗 Related Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)