# LMS Frontend

A modern Learning Management System frontend built with React and Vite, featuring user authentication, course management, progress tracking, and admin functionality.

## Features

- **Authentication System**
  - Traditional email/password login and registration
  - Google OAuth integration
  - JWT token-based authentication
  - Role-based access control (Admin/Student)

- **Student Features**
  - Personal dashboard with learning statistics
  - Course browsing and search functionality
  - Module completion tracking
  - Progress visualization
  - User profile management
  - Notification system

- **Admin Features**
  - User management dashboard
  - Course creation and management
  - Module creation for courses
  - System-wide statistics

- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Loading states and error handling
  - Protected routes
  - Real-time notifications

## Tech Stack

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.0
- **Styling**: Tailwind CSS 4.1.12
- **HTTP Client**: Axios 1.11.0
- **Icons**: Lucide React 0.539.0
- **Linting**: ESLint 9.33.0

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthLayout.jsx   # Authentication page layout
│   ├── CourseCard.jsx   # Course display component
│   ├── Header.jsx       # Navigation header
│   ├── ModuleCard.jsx   # Module display component
│   ├── NotificationPanel.jsx # Notification system
│   └── ProtectedRoute.jsx    # Route protection
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication state management
├── pages/              # Application pages
│   ├── AdminUsers.jsx   # Admin user management
│   ├── CourseCreation.jsx # Course creation form
│   ├── CourseDetails.jsx  # Individual course view
│   ├── Courses.jsx      # Course listing
│   ├── Dashboard.jsx    # User dashboard
│   ├── GoogleCallback.jsx # OAuth callback handler
│   ├── Login.jsx        # Login page
│   ├── ModuleCreation.jsx # Module creation form
│   ├── Register.jsx     # Registration page
│   └── UserProfile.jsx  # User profile management
├── services/           # API integration
│   └── api.js          # Axios configuration and interceptors
├── App.jsx             # Main application component
└── main.jsx            # Application entry point
```

## API Integrations

The frontend communicates with the backend API through the following endpoints:

### Authentication APIs
- `POST /users/login` - User login
- `POST /users/register` - User registration
- `GET /auth/google/login` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### User Management APIs
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/admin/users` - Get all users (admin only)

### Course Management APIs
- `GET /courses` - Get all courses
- `POST /courses` - Create new course (admin only)
- `GET /courses/{id}` - Get course details
- `GET /courses/search` - Search courses by keyword

### Module Management APIs
- `GET /courses/{id}/modules` - Get modules for a course
- `POST /courses/{id}/modules` - Add module to course (admin only)

### Progress Tracking APIs
- `GET /progress/user` - Get user's progress
- `POST /progress/complete` - Mark module as completed
- `DELETE /progress/uncomplete` - Mark module as uncompleted

### Dashboard APIs
- `GET /dashboard/stats` - Get dashboard statistics

### Notification APIs
- `GET /notifications` - Get user notifications
- `POST /notifications` - Create notification (admin only)
- `PUT /notifications/{id}/read` - Mark notification as read

## Page-to-API Mapping

| Page | APIs Called | Purpose |
|------|-------------|----------|
| **Login.jsx** | `POST /users/login` | User authentication |
| **Register.jsx** | `POST /users/register` | User registration |
| **GoogleCallback.jsx** | `GET /auth/google/callback` | Handle OAuth callback |
| **Dashboard.jsx** | `GET /dashboard/stats` | Display learning statistics |
| **Courses.jsx** | `GET /courses`<br>`GET /progress/user`<br>`GET /courses/{id}/modules`<br>`GET /courses/search` | List courses with progress<br>Search functionality |
| **CourseDetails.jsx** | `GET /courses/{id}`<br>`GET /courses/{id}/modules`<br>`GET /progress/user`<br>`POST /progress/complete`<br>`DELETE /progress/uncomplete` | Course details and module tracking |
| **UserProfile.jsx** | `GET /users/profile`<br>`PUT /users/profile` | Profile management |
| **AdminUsers.jsx** | `GET /users/admin/users` | Admin user management |
| **CourseCreation.jsx** | `POST /courses` | Admin course creation |
| **ModuleCreation.jsx** | `POST /courses/{id}/modules` | Admin module creation |

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

### Installation

1. **Clone and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Authentication Flow

1. **JWT Token Management**: Tokens are stored in localStorage and automatically included in API requests
2. **Route Protection**: Protected routes redirect unauthenticated users to login
3. **Role-based Access**: Admin routes are restricted to users with admin role
4. **Auto-logout**: Users are automatically logged out on token expiration (401 responses)

## Development

- **Linting**: `npm run lint`
- **Hot Reload**: Automatic with Vite dev server
- **API Base URL**: Configurable via `VITE_API_URL` environment variable

## API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
