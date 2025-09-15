import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import SubscriptionUpgrade from '../components/SubscriptionUpgrade';
import { Crown, Check, X } from 'lucide-react';

const Pricing = () => {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPremium = user?.role === 'premium' || user?.role === 'admin';

  const features = {
    free: [
      'Basic quiz generation (limited)',
      'Access to free courses',
      'Basic study plans',
      'Browse mentor profiles (view-only)',
      'Community support'
    ],
    premium: [
      'Unlimited quiz generation',
      'Access to all courses',
      'Advanced study plans',
      'Mock exams',
      'Book mentor sessions',
      'Priority AI tutor support',
      'Detailed progress analytics',
      'Export study materials',
      'Priority customer support'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock your full potential with our premium features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $0<span className="text-lg text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={user?.role === 'free'}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                user?.role === 'free'
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {user?.role === 'free' ? 'Current Plan' : 'Downgrade to Free'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-500 mr-2" />
                Premium Plan
              </h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                $9.99<span className="text-lg text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Everything you need to excel</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => isPremium ? null : setShowUpgrade(true)}
              disabled={isPremium}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isPremium
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isPremium ? (
                <>
                  <Check className="w-5 h-5 inline mr-2" />
                  Current Plan
                </>
              ) : (
                'Upgrade to Premium'
              )}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards and debit cards through our secure payment processor, Stripe.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                You can start with our free plan immediately. No credit card required. Upgrade to premium when you're ready for more features.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Upgrade Modal */}
      {showUpgrade && (
        <SubscriptionUpgrade
          onClose={() => setShowUpgrade(false)}
          onSuccess={() => {
            setShowUpgrade(false);
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
};

export default Pricing;