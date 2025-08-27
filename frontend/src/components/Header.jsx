import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, USER_ROLES } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import NotificationPanel from './NotificationPanel';
import { Crown } from 'lucide-react';

const Header = ({ title, showBackButton = false, backTo = '/dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, userRole, canAccessPremium, canAccessAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const desktopProfileDropdownRef = useRef(null);
  const mobileProfileDropdownRef = useRef(null);

  // Function to check if a path is currently active
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    if (path === '/admin/users') {
      return location.pathname.startsWith('/admin');
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  const toggleNotificationPanel = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
  };

  const closeNotificationPanel = () => {
    setIsNotificationPanelOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://localhost:8000/notifications/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const notifications = data.data || [];
          const unread = notifications.filter(notif => !notif.is_read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Failed to fetch notification count:', err);
      }
    };

    fetchUnreadCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDesktop = desktopProfileDropdownRef.current && !desktopProfileDropdownRef.current.contains(event.target);
      const isOutsideMobile = mobileProfileDropdownRef.current && !mobileProfileDropdownRef.current.contains(event.target);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  return (
    <>
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Back button and Title */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={() => navigate(backTo)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                title="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {title}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isActive('/dashboard')
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              
              <button
                onClick={() => navigate('/courses')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isActive('/courses')
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium">Courses</span>
              </button>
              
              {/* Hide AI Tutor for mentor users */}
              {userRole !== USER_ROLES.MENTOR && (
                <button
                  onClick={() => navigate('/tutor-chat')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    isActive('/tutor-chat')
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm font-medium">AI Tutor</span>
                </button>
              )}

              
              <button
                onClick={toggleNotificationPanel}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                title="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={desktopProfileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    isActive('/profile') || isProfileDropdownOpen
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        closeProfileDropdown();
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleLogout();
                        closeProfileDropdown();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
              
              {canAccessAdmin() && (
                <button
                  onClick={() => navigate('/admin/users')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    isActive('/admin/users')
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="text-sm font-medium">Manage Users</span>
                </button>
              )}
            </nav>
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile notification bell */}
            <button
              onClick={toggleNotificationPanel}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              title="Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User greeting */}
              <div className="px-3 py-2 text-sm text-gray-700 font-medium border-b border-gray-100 mb-2">
                Welcome, {user?.name || user?.email || 'User'}!
              </div>
              
              {/* Navigation Links */}
              <button
                onClick={() => handleNavigation('/dashboard')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                  isActive('/dashboard')
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => handleNavigation('/courses')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                  isActive('/courses')
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                </svg>
                <span>Courses</span>
              </button>
              
              {/* Hide AI Tutor for mentor users */}
              {userRole !== USER_ROLES.MENTOR && (
                <button
                  onClick={() => handleNavigation('/tutor-chat')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                    isActive('/tutor-chat')
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>AI Tutor</span>
                </button>
              )}

              
              <button
                onClick={toggleNotificationPanel}
                className="relative w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Mobile Profile Dropdown */}
              <div className="relative" ref={mobileProfileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                    isActive('/profile') || isProfileDropdownOpen
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Mobile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="mt-2 ml-8 space-y-1">
                    <button
                      onClick={() => {
                        handleNavigation('/profile');
                        closeProfileDropdown();
                        closeMobileMenu();
                      }}
                      className="w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        closeProfileDropdown();
                        closeMobileMenu();
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
              
              {canAccessAdmin() && (
                <button
                  onClick={() => handleNavigation('/admin/users')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                    isActive('/admin/users')
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Manage Users</span>
                </button>
              )}

            </div>
          </div>
        )}
      </div>
    </header>
    
    {/* Notification Panel */}
    <NotificationPanel 
      isOpen={isNotificationPanelOpen} 
      onClose={closeNotificationPanel}
      onNotificationUpdate={() => {
        // Refresh unread count when notifications are updated
        const fetchUnreadCount = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await fetch('http://localhost:8000/notifications/', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const notifications = data.data || [];
              const unread = notifications.filter(notif => !notif.is_read).length;
              setUnreadCount(unread);
            }
          } catch (err) {
            console.error('Failed to fetch notification count:', err);
          }
        };
        fetchUnreadCount();
      }}
    />
    

    </>
  );
};

export default Header;