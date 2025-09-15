import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Calendar, Clock, DollarSign, User, ArrowRight, Copy, X } from 'lucide-react';
import mentorSessionApi from '../services/mentorSessionApi';
import Header from '../components/Header';

const MentorSessionPaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (sessionId) {
      verifyPaymentAndFetchSession();
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPaymentAndFetchSession = async () => {
    try {
      setVerifying(true);
      
      // First verify the payment
      const verificationResult = await mentorSessionApi.verifySessionPayment(sessionId);
      
      if (verificationResult.success) {
        // Then fetch the updated session details
        const sessionData = await mentorSessionApi.getSessionById(sessionId);
        setSession(sessionData);
      } else {
        setError('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment or fetching session:', error);
      setError('Failed to load session details');
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || verifying) {
    return (
      <>
        <Header title="Payment Processing" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {verifying ? 'Verifying payment...' : 'Processing your booking...'}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Booking Error" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/mentor-booking')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Mentor Booking
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Payment Successful" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your mentor session has been booked and confirmed. You'll receive a confirmation email shortly.
            </p>
          </div>

          {/* Session Details */}
          {session && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{session.title}</p>
                    <p className="text-sm text-gray-600">with {session.mentor?.name || 'Your Mentor'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(session.scheduled_at)}</p>
                    <p className="text-sm text-gray-600">
                      {formatTime(session.scheduled_at)} ({session.duration_minutes} minutes)
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">${session.price}</p>
                    <p className="text-sm text-gray-600">Payment confirmed</p>
                  </div>
                </div>

                {session.description && (
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Session Notes</p>
                      <p className="text-sm text-gray-600">{session.description}</p>
                    </div>
                  </div>
                )}

                {session.meeting_link && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Meeting Link</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-blue-700 break-all mr-2">{session.meeting_link}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(session.meeting_link)}
                        className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  1
                </div>
                <p className="text-gray-700">You'll receive a confirmation email with all session details</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  2
                </div>
                <p className="text-gray-700">Your mentor will send you a meeting link before the session</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  3
                </div>
                <p className="text-gray-700">Join the session at the scheduled time</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/mentor-sessions')}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              View My Sessions
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={() => navigate('/mentor-booking')}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Book Another Session
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentorSessionPaymentSuccess;
