import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNotification, setNewNotification] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state to mark notification as read
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/notifications/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Sort notifications by created_at in descending order (latest first)
        const sortedNotifications = (data.data || []).sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setNotifications(sortedNotifications);
      } else {
        // Provide specific error messages based on status code
        if (response.status === 401) {
          setError('Your session has expired. Please sign in again to view notifications.');
        } else if (response.status === 403) {
          setError('You don\'t have permission to access notifications.');
        } else if (response.status >= 500) {
          setError('Our servers are experiencing issues. Please try again in a few minutes.');
        } else {
          setError(data.message || 'Unable to load notifications right now. Please try again later.');
        }
      }
    } catch (err) {
      if (!navigator.onLine) {
        setError('No internet connection. Please check your network and try again.');
      } else {
        setError('Unable to connect to our servers. Please try again later.');
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
        body: JSON.stringify({ message: newNotification })
      });

      const data = await response.json();

      if (response.ok) {
        setCreateSuccess('Notification created successfully!');
        setNewNotification('');
        // Add the new notification to the top of the list immediately
        const newNotificationObj = {
          id: data.data.id,
          message: data.data.message,
          created_at: data.data.created_at,
          created_by: data.data.created_by,
          is_read: data.data.is_read || false
        };
        setNotifications(prevNotifications => [newNotificationObj, ...prevNotifications]);
        setTimeout(() => setCreateSuccess(''), 3000);
      } else {
        // Provide specific error messages based on status code
        if (response.status === 401) {
          setCreateError('Your session has expired. Please sign in again to create notifications.');
        } else if (response.status === 403) {
          setCreateError('You don\'t have permission to create notifications.');
        } else if (response.status === 400) {
          setCreateError('Please check your message and try again. Make sure it\'s not empty.');
        } else if (response.status >= 500) {
          setCreateError('Our servers are experiencing issues. Please try again in a few minutes.');
        } else {
          setCreateError(data.message || 'Unable to create notification right now. Please try again later.');
        }
      }
    } catch (err) {
      if (!navigator.onLine) {
        setCreateError('No internet connection. Please check your network and try again.');
      } else {
        setCreateError('Unable to connect to our servers. Please try again later.');
      }
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Notifications" showBackButton={true} backTo="/dashboard" />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Admin Create Notification Form */}
        {user?.role === 'admin' && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Notification</h2>
            
            {createError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {createError}
              </div>
            )}
            
            {createSuccess && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Notification Message *
                </label>
                <textarea
                  id="message"
                  value={newNotification}
                  onChange={(e) => setNewNotification(e.target.value)}
                  required
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter notification message..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creating || !newNotification.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {creating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Notification'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Latest Notifications</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No notifications available.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">
                        Created on {formatDate(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
  );
};

export default Notifications;