import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { userApi } from '../services/userApi';

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

// Subscription utility functions
export const hasActiveSubscription = (user) => {
  if (!user) return false;
  
  // Check if user has premium role (legacy check)
  if (user.role === USER_ROLES.PREMIUM || user.role === USER_ROLES.ADMIN) {
    return true;
  }
  
  // Check subscription status and end date
  if (user.subscription_status === 'active' && user.subscription_end_date) {
    const endDate = new Date(user.subscription_end_date);
    const now = new Date();
    return endDate > now;
  }
  
  return false;
};

export const canAccessPremiumFeatures = (user) => {
  return hasActiveSubscription(user) || user?.role === USER_ROLES.ADMIN;
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

  const refreshUser = useCallback(async () => {
    if (!authToken) return;
    
    try {
      const response = await userApi.getProfile();
      const userData = response.data;
      
      // Update localStorage and state
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If token is invalid, logout
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  }, [authToken, logout]);

  const value = useMemo(() => ({
    authToken,
    user,
    isLoading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!authToken,
    userRole: user?.role || USER_ROLES.FREE,
    hasRole: (requiredRole) => hasRole(user?.role, requiredRole),
    canAccessPremium: () => canAccessPremium(user?.role),
    canAccessAdmin: () => canAccessAdmin(user?.role),
    canAccessMentor: () => canAccessMentor(user?.role),
    isFreeUser: user?.role === USER_ROLES.FREE,
    isPremiumUser: user?.role === USER_ROLES.PREMIUM,
    isMentor: user?.role === USER_ROLES.MENTOR,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    // Subscription-related functions
    hasActiveSubscription: () => hasActiveSubscription(user),
    canAccessPremiumFeatures: () => canAccessPremiumFeatures(user),
    subscriptionStatus: user?.subscription_status,
    subscriptionEndDate: user?.subscription_end_date,
    subscriptionId: user?.subscription_id
  }), [authToken, user, isLoading, login, logout, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;