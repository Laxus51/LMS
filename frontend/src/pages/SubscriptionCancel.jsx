import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, Crown } from 'lucide-react';

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/profile'); // Navigate back to profile where they can try upgrading again
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Subscription Canceled
            </h1>
            <p className="text-gray-600">
              Your subscription process was canceled. No charges were made to your account.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Crown className="w-6 h-6 text-blue-500 mr-2" />
              <span className="font-semibold text-gray-900">Premium Features Available</span>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Upgrade anytime to unlock:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Unlimited quiz generation</li>
              <li>• Access to mock exams</li>
              <li>• Advanced study plans</li>
              <li>• Priority AI tutor support</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700"
            >
              Try Again
            </button>
            
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            You can continue using the free features of our platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancel;