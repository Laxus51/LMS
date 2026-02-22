import { Navigate } from 'react-router-dom';
import { useAuth, USER_ROLES } from '../contexts/AuthContext';

const RoleAwareRedirect = ({ defaultPath = '/dashboard' }) => {
  const { userRole } = useAuth();
  
  // Redirect mentors to their dashboard, others to the default path
  const redirectPath = userRole === USER_ROLES.MENTOR ? '/mentor/dashboard' : defaultPath;
  
  return <Navigate to={redirectPath} replace />;
};

export default RoleAwareRedirect;
