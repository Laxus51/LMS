import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import api from '../services/api';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [updateError, setUpdateError] = useState('');
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users/profile');
      
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({
          name: response.data.data.name || '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setError(response.data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      // Provide specific error messages based on status code
      if (err.response?.status === 401) {
        setError('Your session has expired. Please sign in again to view your profile.');
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to access this profile.');
      } else if (err.response?.status >= 500) {
        setError('Our servers are experiencing issues. Please try again in a few minutes.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network and try again.');
      } else {
        setError(
          err.response?.data?.message || 
          err.message || 
          'Unable to load your profile right now. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 1) {
      errors.name = 'Name must be at least 1 character long';
    }

    // Password validation (only if password is provided)
    if (formData.password) {
      if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError('');
      setSuccessMessage('');

      // Prepare update data
      const updateData = {
        name: formData.name.trim()
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await api.put('/users/profile', updateData);
      
      if (response.data.success) {
        setProfile(response.data.data);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setUpdateError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      
      // Provide specific error messages based on status code
      if (err.response?.status === 401) {
        setUpdateError('Your session has expired. Please sign in again to update your profile.');
      } else if (err.response?.status === 400) {
        setUpdateError('Please check your information and try again. Make sure all fields are filled correctly.');
      } else if (err.response?.status === 409) {
        setUpdateError('This email is already in use. Please choose a different email address.');
      } else if (err.response?.status >= 500) {
        setUpdateError('Our servers are experiencing issues. Please try again in a few minutes.');
      } else if (!navigator.onLine) {
        setUpdateError('No internet connection. Please check your network and try again.');
      } else {
        setUpdateError(
          err.response?.data?.message || 
          err.message || 
          'Unable to update your profile right now. Please try again later.'
        );
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: profile?.name || '',
      password: '',
      confirmPassword: ''
    });
    setValidationErrors({});
    setUpdateError('');
  };

  const handleRetry = () => {
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <Header title="User Profile" showBackButton={true} backTo="/dashboard" />
      <div className="container mx-auto px-4 py-8">

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-8 rounded-lg mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-indigo-600 bg-opacity-30 rounded-full flex items-center justify-center mr-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{profile?.name || 'User'}</h2>
              <p className="text-indigo-100">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div>
            {!isEditing ? (
              // View Mode
              <div>
                <div className="mb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-lg text-gray-900">{profile?.name || 'Not provided'}</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <p className="text-lg text-gray-900">{profile?.email}</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleUpdateProfile}>
                {/* Update Error */}
                {updateError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 font-medium">{updateError}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Name Field */}
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                        validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      {profile?.auth_method === 'google' && !profile?.has_password 
                        ? 'Set Password (optional)' 
                        : 'New Password (optional)'
                      }
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                        validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={profile?.auth_method === 'google' && !profile?.has_password 
                        ? 'Set your password' 
                        : 'Enter new password'
                      }
                    />
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      {profile?.auth_method === 'google' && !profile?.has_password 
                        ? 'Confirm Password' 
                        : 'Confirm New Password'
                      }
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                        validationErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={profile?.auth_method === 'google' && !profile?.has_password 
                        ? 'Confirm your password' 
                        : 'Confirm new password'
                      }
                      disabled={!formData.password}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Password Info */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-blue-700 text-sm font-medium mb-1">
                        {profile?.auth_method === 'google' && !profile?.has_password 
                          ? 'Set Password Information:' 
                          : 'Password Requirements:'
                        }
                      </p>
                      <ul className="text-blue-600 text-sm space-y-1">
                        <li>• At least 6 characters long</li>
                        {profile?.auth_method === 'google' && !profile?.has_password ? (
                          <>
                            <li>• Setting a password allows you to login with email/password</li>
                            <li>• You can still continue using Google OAuth</li>
                          </>
                        ) : (
                          <li>• Leave blank to keep current password</li>
                        )}
                        <li>• Both password fields must match</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      updateLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white hover:scale-105'
                    }`}
                  >
                    {updateLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;