import api from './api';

const paymentApi = {
  // Create a subscription checkout session
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/payment/create-subscription', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Get current subscription status
  getSubscriptionStatus: async () => {
    try {
      const response = await api.get('/payment/subscription-status');
      return response.data;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const response = await api.post('/payment/cancel-subscription');
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Create customer portal session
  createPortalSession: async (returnUrl) => {
    try {
      const response = await api.post('/payment/create-portal-session', {
        return_url: returnUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  },

  // Verify subscription payment
  verifySubscriptionPayment: async (sessionId) => {
    try {
      const response = await api.post('/payment/verify-subscription', null, {
        params: { session_id: sessionId }
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying subscription payment:', error);
      throw error;
    }
  }
};

export default paymentApi;