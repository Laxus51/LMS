import { USER_ROLES } from '../contexts/AuthContext';

/**
 * Get the appropriate dashboard URL based on user role
 * @param {string} userRole - The user's role
 * @returns {string} - The appropriate dashboard URL
 */
export const getRoleDashboard = (userRole) => {
  switch (userRole) {
    case USER_ROLES.MENTOR:
      return '/mentor/dashboard';
    case USER_ROLES.ADMIN:
    case USER_ROLES.PREMIUM:
    case USER_ROLES.FREE:
    default:
      return '/dashboard';
  }
};

/**
 * Get the redirect path after login based on intended route and user role
 * @param {string} intendedPath - The path user was trying to access
 * @param {string} userRole - The user's role
 * @returns {string} - The appropriate redirect path
 */
export const getLoginRedirectPath = (intendedPath, userRole) => {
  // If no intended path or intended path is generic dashboard, use role-based dashboard
  if (!intendedPath || intendedPath === '/dashboard' || intendedPath === '/') {
    return getRoleDashboard(userRole);
  }
  
  // If intended path is mentor-specific but user is not a mentor, redirect to their dashboard
  if (intendedPath.startsWith('/mentor') && userRole !== USER_ROLES.MENTOR) {
    return getRoleDashboard(userRole);
  }
  
  // If intended path is student-specific but user is a mentor, redirect to mentor dashboard
  const studentPaths = ['/courses', '/study-plan', '/quiz', '/mock-exam', '/tutor-chat'];
  if (studentPaths.some(path => intendedPath.startsWith(path)) && userRole === USER_ROLES.MENTOR) {
    return getRoleDashboard(userRole);
  }
  
  // Otherwise, use the intended path
  return intendedPath;
};
