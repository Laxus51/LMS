import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL query params
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setTimeout(() => {
            navigate('/login', { 
              state: { error: 'Google authentication failed. Please try again.' } 
            });
          }, 2000);
          return;
        }

        if (token) {
          // Save token to localStorage
          localStorage.setItem('token', token);
          setStatus('success');
          
          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setStatus('error');
          setTimeout(() => {
            navigate('/login', { 
              state: { error: 'No authentication token received. Please try again.' } 
            });
          }, 2000);
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        setStatus('error');
        setTimeout(() => {
          navigate('/login', { 
            state: { error: 'Authentication failed. Please try again.' } 
          });
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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