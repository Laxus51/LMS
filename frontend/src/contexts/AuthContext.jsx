import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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
    isAuthenticated: !!authToken
  }), [authToken, user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;