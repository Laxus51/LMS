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
import TutorChatPage from './pages/TutorChatPage';
import StudyPlanPage from './pages/StudyPlanPage';
import StudyPlanViewPage from './pages/StudyPlanViewPage';
import QuizCreation from './pages/QuizCreation';
import QuizAttempt from './pages/QuizAttempt';
import QuizReview from './pages/QuizReview';
import QuizHistory from './pages/QuizHistory';
import QuizResult from './pages/QuizResult';
import MockExamCreation from './pages/MockExamCreation';
import MockExamAttempt from './pages/MockExamAttempt';
import MockExamResult from './pages/MockExamResult';
import MockExamReview from './pages/MockExamReview';
import MockExamHistory from './pages/MockExamHistory';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionCancel from './pages/SubscriptionCancel';
import Pricing from './pages/Pricing';
import MentorDashboard from './components/MentorDashboard';
import MentorBooking from './components/MentorBooking';
import MentorSessionsPage from './pages/MentorSessionsPage';
import MentorSessionPaymentSuccess from './pages/MentorSessionPaymentSuccess';
import MentorSessionPaymentCancel from './pages/MentorSessionPaymentCancel';

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
                  <TutorChatPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/study-plan" 
              element={
                <ProtectedRoute>
                  <StudyPlanPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/study-plan/preview" 
              element={
                <ProtectedRoute>
                  <StudyPlanViewPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/study-plan/:id" 
              element={
                <ProtectedRoute>
                  <StudyPlanViewPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/quiz/create" 
              element={
                <RoleProtectedRoute allowedRoles={['free', 'premium', 'admin']} redirectTo="/dashboard">
                  <QuizCreation />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/quiz/attempt/:quizId" 
              element={
                <RoleProtectedRoute allowedRoles={['free', 'premium', 'admin']} redirectTo="/dashboard">
                  <QuizAttempt />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/quiz/review/:quizId" 
              element={
                <RoleProtectedRoute allowedRoles={['free', 'premium', 'admin']} redirectTo="/dashboard">
                  <QuizReview />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/quiz/result/:quizId" 
              element={
                <RoleProtectedRoute allowedRoles={['free', 'premium', 'admin']} redirectTo="/dashboard">
                  <QuizResult />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/quiz/history" 
              element={
                <RoleProtectedRoute allowedRoles={['free', 'premium', 'admin']} redirectTo="/dashboard">
                  <QuizHistory />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/quiz" 
              element={<Navigate to="/quiz/create" replace />}
            />

            {/* Mock Exam Routes - Premium Only */}
            <Route 
              path="/mock-exam/create" 
              element={
                <RoleProtectedRoute allowedRoles={['premium', 'admin']} redirectTo="/dashboard">
                  <MockExamCreation />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/mock-exam/attempt/:examId" 
              element={
                <RoleProtectedRoute allowedRoles={['premium', 'admin']} redirectTo="/dashboard">
                  <MockExamAttempt />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/mock-exam/result/:examId" 
              element={
                <RoleProtectedRoute allowedRoles={['premium', 'admin']} redirectTo="/dashboard">
                  <MockExamResult />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/mock-exam/review/:examId" 
              element={
                <RoleProtectedRoute allowedRoles={['premium', 'admin']} redirectTo="/dashboard">
                  <MockExamReview />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/mock-exam/history" 
              element={
                <RoleProtectedRoute allowedRoles={['premium', 'admin']} redirectTo="/dashboard">
                  <MockExamHistory />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/mock-exam" 
              element={<Navigate to="/mock-exam/create" replace />}
            />

            {/* Subscription Routes */}
            <Route 
              path="/pricing" 
              element={
                <ProtectedRoute>
                  <Pricing />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/subscription/success" 
              element={
                <ProtectedRoute>
                  <SubscriptionSuccess />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/subscription/cancel" 
              element={
                <ProtectedRoute>
                  <SubscriptionCancel />
                </ProtectedRoute>
              }
            />

            {/* Mentor Session Routes */}
            <Route 
              path="/mentor/dashboard" 
              element={
                <RoleProtectedRoute requiredRole="mentor" redirectTo="/dashboard">
                  <MentorDashboard />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/mentor-booking" 
              element={
                <RoleProtectedRoute allowedRoles={['free', 'premium', 'admin']} redirectTo="/dashboard">
                  <MentorBooking />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/mentor-sessions" 
              element={
                <RoleProtectedRoute allowedRoles={['premium', 'admin']} redirectTo="/dashboard">
                  <MentorSessionsPage />
                </RoleProtectedRoute>
              }
            />
            <Route 
              path="/mentor-sessions/payment-success" 
              element={
                <ProtectedRoute>
                  <MentorSessionPaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/mentor-sessions/payment-cancel" 
              element={
                <ProtectedRoute>
                  <MentorSessionPaymentCancel />
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