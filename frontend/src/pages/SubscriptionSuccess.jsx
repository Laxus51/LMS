import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import paymentApi from '../services/paymentApi';
import { Check, Crown, ArrowRight, XCircle } from 'lucide-react';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    const verifyAndUpdateSubscription = async () => {
      try {
        if (sessionId) {
          // Verify payment with Stripe and update user subscription
          const result = await paymentApi.verifySubscriptionPayment(sessionId);
          
          if (result.success) {
            // Refresh user data to get updated subscription status
            await refreshUser();
          } else {
            setError('Failed to verify subscription payment');
          }
        } else {
          // Fallback: just refresh user data (for existing flow)
          await refreshUser();
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setError('Failed to process subscription');
      } finally {
        setLoading(false);
      }
    };

    verifyAndUpdateSubscription();
  }, [refreshUser, searchParams]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscription Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Premium!
            </h1>
            <p className="text-gray-600">
              Your subscription has been successfully activated.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Crown className="w-6 h-6 text-yellow-500 mr-2" />
              <span className="font-semibold text-gray-900">Premium Features Unlocked</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Unlimited quiz generation
              </li>
              <li className="flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Access to mock exams
              </li>
              <li className="flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Advanced study plans
              </li>
              <li className="flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Priority AI tutor support
              </li>
            </ul>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center justify-center"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>

          <p className="text-xs text-gray-500 mt-4">
            You can manage your subscription anytime from your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;