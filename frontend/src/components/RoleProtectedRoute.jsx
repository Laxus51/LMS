import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const RoleProtectedRoute = ({ children, requiredRole, allowedRoles, redirectTo = '/dashboard' }) => {
  const { user, userRole, hasRole, canAccessPremium, canAccessAdmin, canAccessMentor } = useAuth();
  const location = useLocation();

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check access based on specific role requirement
  if (requiredRole) {
    if (!hasRole(requiredRole)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Check access based on allowed roles array
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => hasRole(role));
    if (!hasAllowedRole) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Check for premium access requirement
  if (requiredRole === 'premium' && !canAccessPremium()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check for admin access requirement
  if (requiredRole === 'admin' && !canAccessAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check for mentor access requirement
  if (requiredRole === 'mentor' && !canAccessMentor()) {
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass, render the protected component
  return children;
};

export default RoleProtectedRoute;