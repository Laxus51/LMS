import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import paymentApi from '../services/paymentApi';
import { Crown, Check } from 'lucide-react';



const Pricing = () => {
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPremium = user?.role === 'premium' || user?.role === 'admin';

  const handleUpgrade = async () => {
    try {
      setUpgradeLoading(true);
      setError('');
      const response = await paymentApi.createSubscription({
        success_url: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/subscription/cancel`
      });
      // Redirect to Stripe Checkout
      if (response.session_url) {
        window.location.href = response.session_url;
      } else {
        setError('Failed to create checkout session. Please try again.');
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
      if (err.response?.status === 400) {
        setError('You already have an active subscription.');
      } else {
        setError(err.response?.data?.detail || 'Failed to start checkout. Please try again.');
      }
    } finally {
      setUpgradeLoading(false);
    }
  };

  const freeFeatures = [
    'Basic quiz generation (limited)',
    'Access to free courses',
    'Basic study plans',
    'Browse mentor profiles',
    'Community support'
  ];

  const premiumFeatures = [
    'Unlimited quiz generation',
    'Access to all courses',
    'Advanced study plans',
    'Mock exams',
    'Book mentor sessions',
    'Priority AI tutor support',
    'Progress analytics',
    'Priority support'
  ];

  return (
    <>
      <TopBar title="Pricing" />
      <div className="app-content">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-[#111827] mb-1">Choose Your Plan</h1>
            <p className="text-sm text-[#6B7280]">Unlock your full potential with premium features</p>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 bg-[#FEF2F2] border border-[#DC2626]/20 rounded-md max-w-lg mx-auto">
              <p className="text-xs text-[#DC2626]">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Free Plan */}
            <div className="card">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-[#111827] mb-1">Free</h3>
                <div className="text-2xl font-bold text-[#111827]">
                  $0<span className="text-sm text-[#9CA3AF] font-normal">/month</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">Perfect for getting started</p>
              </div>

              <ul className="space-y-2 mb-6">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Check className="w-4 h-4 text-[#16A34A] shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={user?.role === 'free'}
                className={`w-full py-2 rounded-md text-sm font-medium ${user?.role === 'free'
                  ? 'bg-[#F9FAFB] text-[#9CA3AF] border border-[#E5E7EB] cursor-not-allowed'
                  : 'btn-secondary'
                  }`}
              >
                {user?.role === 'free' ? 'Current Plan' : 'Free Plan'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="card border-[#2563EB] relative">
              <div className="absolute -top-3 left-4">
                <span className="bg-[#2563EB] text-white text-xs font-medium px-2.5 py-0.5 rounded">
                  Recommended
                </span>
              </div>

              <div className="mb-5">
                <h3 className="text-base font-semibold text-[#111827] mb-1 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#D97706]" /> Premium
                </h3>
                <div className="text-2xl font-bold text-[#2563EB]">
                  $9.99<span className="text-sm text-[#9CA3AF] font-normal">/month</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">Everything you need to excel</p>
              </div>

              <ul className="space-y-2 mb-6">
                {premiumFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Check className="w-4 h-4 text-[#16A34A] shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleUpgrade}
                disabled={isPremium || upgradeLoading}
                className={`w-full py-2 rounded-md text-sm font-medium ${isPremium
                  ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 cursor-not-allowed'
                  : 'btn-primary'
                  }`}
              >
                {isPremium ? (
                  <><Check className="w-4 h-4 inline mr-1" /> Current Plan</>
                ) : upgradeLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Redirecting to Stripe...
                  </span>
                ) : (
                  'Upgrade to Premium'
                )}
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-10">
            <h2 className="text-base font-semibold text-[#111827] text-center mb-4">FAQ</h2>
            <div className="space-y-3">
              {[
                { q: 'Can I cancel anytime?', a: 'Yes. You\'ll keep premium access until the end of your billing period.' },
                { q: 'What payment methods?', a: 'All major credit and debit cards via Stripe.' },
                { q: 'Is there a free trial?', a: 'Start with our free plan immediately. No credit card required.' }
              ].map((faq, i) => (
                <div key={i} className="card">
                  <h3 className="text-sm font-medium text-[#111827] mb-1">{faq.q}</h3>
                  <p className="text-xs text-[#6B7280]">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;