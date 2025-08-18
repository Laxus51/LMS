import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        
        // Check for error in URL params first
        const error = searchParams.get('error');
        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          
          // Map backend error codes to user-friendly messages
          let errorMessage = 'Google authentication failed. Please try again.';
          if (error === 'failed_to_get_user_info') {
            errorMessage = 'Failed to get user information from Google. Please try again.';
          } else if (error === 'email_not_provided') {
            errorMessage = 'Email not provided by Google. Please try again.';
          } else if (error === 'oauth_callback_failed') {
            errorMessage = 'OAuth authentication failed. Please try again.';
          }
          
          setTimeout(() => {
            navigate('/login', { 
              state: { error: errorMessage } 
            });
          }, 2000);
          return;
        }

        // Get token and user info from URL params (sent by backend redirect)
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const userId = searchParams.get('user_id');
        
        if (!token || !email) {
          setStatus('error');
          setTimeout(() => {
            navigate('/login', { 
              state: { error: 'Invalid authentication response. Please try again.' } 
            });
          }, 2000);
          return;
        }

        // Create user object from URL parameters
        const user = {
          id: parseInt(userId),
          email: email,
          name: name || '',
          role: 'user' // Default role for OAuth users
        };
        
        // Save token and user data using AuthContext
        login(token, user);
        
        // Get intended route from sessionStorage (set during OAuth initiation) or default to dashboard
        const from = sessionStorage.getItem('oauth_intended_route') || '/dashboard';
        // Clear the stored route after use
        sessionStorage.removeItem('oauth_intended_route');
        
        // Redirect immediately without showing success page
        navigate(from, { replace: true });
        
      } catch (err) {
        console.error('Callback processing error:', err);
        setStatus('error');
        
        const errorMessage = err.message || 'Authentication failed. Please try again.';
        
        setTimeout(() => {
          navigate('/login', { 
            state: { error: errorMessage } 
          });
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, location, login]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Signing you in...
              </h2>
              <p className="text-gray-600">
                Please wait while we complete your Google authentication.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Success!
              </h2>
              <p className="text-gray-600">
                You have been successfully signed in. Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-red-100 p-3">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600">
                There was an issue with your Google authentication. Redirecting to login...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;