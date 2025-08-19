import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const NotificationPanel = ({ isOpen, onClose, onNotificationUpdate }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNotification, setNewNotification] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const panelRef = useRef(null);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Handle outside click to close panel and prevent background scroll
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/notifications/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        const sortedNotifications = (data.data || []).sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setNotifications(sortedNotifications);
        // Call the callback to update unread count in header
        if (onNotificationUpdate) {
          onNotificationUpdate();
        }
      } else {
        if (response.status === 401) {
          setError('Your session has expired. Please sign in again.');
        } else if (response.status === 403) {
          setError('You don\'t have permission to access notifications.');
        } else if (response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(data.message || 'Unable to load notifications.');
        }
      }
    } catch (err) {
      if (!navigator.onLine) {
        setError('No internet connection. Please check your network.');
      } else {
        setError('Unable to connect to server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    if (!newNotification.trim()) return;

    setCreating(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/notifications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newNotification.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setCreateSuccess('Notification created successfully!');
        setNewNotification('');
        fetchNotifications(); // Refresh the list
        // Update unread count in header
        if (onNotificationUpdate) {
          onNotificationUpdate();
        }
        setTimeout(() => setCreateSuccess(''), 3000);
      } else {
        setCreateError(data.message || 'Failed to create notification');
      }
    } catch (err) {
      setCreateError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
      // Update unread count in header
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Notification Panel */}
      <div 
        ref={panelRef}
        className={`fixed top-20 right-2 left-2 sm:right-4 sm:left-auto h-[calc(100vh-6rem)] w-auto sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out rounded-lg ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white rounded-t-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            aria-label="Close notifications"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Admin Create Notification Form */}
          {user?.role === 'admin' && (
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Create New Notification</h3>
              
              {createError && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
                  {createError}
                </div>
              )}
              
              {createSuccess && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm sm:text-base">
                  {createSuccess}
                </div>
              )}

              <form onSubmit={handleCreateNotification} className="space-y-3 sm:space-y-4">
                <textarea
                  value={newNotification}
                  onChange={(e) => setNewNotification(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base touch-manipulation"
                  placeholder="Enter notification message..."
                />
                <button
                  type="submit"
                  disabled={creating || !newNotification.trim()}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
                >
                  {creating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Notification'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Notifications List */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-sm text-gray-600">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="py-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">No notifications available.</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 sm:p-4 rounded-lg border transition-colors duration-200 cursor-pointer touch-manipulation ${
                      notification.is_read 
                        ? 'bg-white border-gray-200 hover:bg-gray-50' 
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2 sm:pr-3">
                        <p className="text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">{notification.message}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;