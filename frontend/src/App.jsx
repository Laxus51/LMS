import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GoogleCallback from './pages/GoogleCallback';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import UserProfile from './pages/UserProfile';
import AdminUsers from './pages/AdminUsers';
import CourseCreation from './pages/CourseCreation';
import ModuleCreation from './pages/ModuleCreation';
import TutorChat from './components/TutorChat';

import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:id" 
              element={
                <ProtectedRoute>
                  <CourseDetails />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/users" 
              element={
                <RoleProtectedRoute requiredRole="admin" redirectTo="/dashboard">
                  <AdminUsers />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses/create" 
              element={
                <RoleProtectedRoute requiredRole="admin" redirectTo="/dashboard">
                  <CourseCreation />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:courseId/modules/create" 
              element={
                <RoleProtectedRoute requiredRole="admin" redirectTo="/dashboard">
                  <ModuleCreation />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/tutor-chat" 
              element={
                <ProtectedRoute>
                  <TutorChat />
                </ProtectedRoute>
              } 
            />

            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;