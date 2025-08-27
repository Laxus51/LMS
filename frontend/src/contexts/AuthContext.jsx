import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext();

// Role constants
export const USER_ROLES = {
  FREE: 'free',
  PREMIUM: 'premium',
  MENTOR: 'mentor',
  ADMIN: 'admin'
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role utility functions
export const hasRole = (userRole, requiredRole) => {
  const roleHierarchy = {
    [USER_ROLES.FREE]: 0,
    [USER_ROLES.PREMIUM]: 1,
    [USER_ROLES.MENTOR]: 2,
    [USER_ROLES.ADMIN]: 3
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};



export const canAccessPremium = (userRole) => {
  return hasRole(userRole, USER_ROLES.PREMIUM);
};

export const canAccessAdmin = (userRole) => {
  return hasRole(userRole, USER_ROLES.ADMIN);
};

export const canAccessMentor = (userRole) => {
  return hasRole(userRole, USER_ROLES.MENTOR);
};

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing token and user data on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token) {
      setAuthToken(token);
      
      // Restore user data from localStorage if available
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          setUser({ authenticated: true });
        }
      } else {
        setUser({ authenticated: true });
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((token, userData = null) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    
    // Store user data in localStorage for persistence across page refreshes
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } else {
      setUser({ authenticated: true });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    authToken,
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!authToken,
    userRole: user?.role || USER_ROLES.FREE,
    hasRole: (requiredRole) => hasRole(user?.role, requiredRole),
    canAccessPremium: () => canAccessPremium(user?.role),
    canAccessAdmin: () => canAccessAdmin(user?.role),
    canAccessMentor: () => canAccessMentor(user?.role),
    isFreeUser: user?.role === USER_ROLES.FREE,
    isPremiumUser: user?.role === USER_ROLES.PREMIUM,
    isMentor: user?.role === USER_ROLES.MENTOR,
    isAdmin: user?.role === USER_ROLES.ADMIN
  }), [authToken, user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;