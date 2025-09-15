import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import paymentApi from '../services/paymentApi';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Crown, Check, X } from 'lucide-react';

// Initialize Stripe (you'll need to add your publishable key to environment variables)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SubscriptionUpgrade = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const status = await paymentApi.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      const currentUrl = window.location.origin;
      const subscriptionData = {
        price_id: 'price_1S4oRJF6GQnnXPTYEWJQqC3C', // This matches your Stripe price ID from backend
        success_url: `${currentUrl}/subscription-success`,
        cancel_url: `${currentUrl}/subscription-cancel`
      };

      const response = await paymentApi.createSubscription(subscriptionData);
      
      // Redirect to Stripe Checkout
      window.location.href = response.session_url;
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setLoading(true);
    try {
      await paymentApi.cancelSubscription();
      await fetchSubscriptionStatus();
      await refreshUser();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const currentUrl = window.location.origin;
      const response = await paymentApi.createPortalSession(currentUrl);
      window.location.href = response.url;
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to open subscription management');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isActive = subscriptionStatus?.is_active;
  const isPremium = user?.role === 'premium' || user?.role === 'admin';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Crown className="w-6 h-6 text-yellow-500 mr-2" />
            Premium Subscription
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isPremium ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">
                  You have an active premium subscription!
                </span>
              </div>
            </div>

            {subscriptionStatus && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">
                    {subscriptionStatus.status}
                  </span>
                </div>
                {subscriptionStatus.current_period_end && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next billing date:</span>
                    <span className="font-medium">
                      {formatDate(subscriptionStatus.current_period_end)}
                    </span>
                  </div>
                )}
                {subscriptionStatus.cancel_at_period_end && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <span className="text-yellow-700">
                      Your subscription will be canceled at the end of the current period.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Manage Subscription'}
              </button>
              
              {!subscriptionStatus?.cancel_at_period_end && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-2">Premium Plan</h3>
                <div className="text-3xl font-bold mb-2">$9.99<span className="text-lg">/month</span></div>
                <p className="text-blue-100">Unlock all premium features</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Premium Features:</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-gray-700">Unlimited quiz generation</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-gray-700">Access to mock exams</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-gray-700">Advanced study plans</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-gray-700">Priority AI tutor support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-gray-700">Detailed progress analytics</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Upgrade to Premium
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Secure payment powered by Stripe. Cancel anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SubscriptionUpgradeWrapper = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionUpgrade {...props} />
    </Elements>
  );
};

export default SubscriptionUpgradeWrapper;