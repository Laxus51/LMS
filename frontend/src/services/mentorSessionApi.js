import api from './api';

const mentorSessionApi = {
  // Mentor Profile Management
  createMentorProfile: async (profileData) => {
    try {
      const response = await api.post('/mentor-sessions/mentor/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error creating mentor profile:', error);
      throw error;
    }
  },

  getMentorProfile: async () => {
    try {
      const response = await api.get('/mentor-sessions/mentor/profile');
      return response.data;
    } catch (error) {
      // 404 is expected when mentor hasn't created profile yet
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error getting mentor profile:', error);
      throw error;
    }
  },

  updateMentorProfile: async (profileData) => {
    try {
      const response = await api.put('/mentor-sessions/mentor/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating mentor profile:', error);
      throw error;
    }
  },

  getPublicMentorProfile: async (mentorId) => {
    try {
      const response = await api.get(`/mentor-sessions/mentor/${mentorId}/profile`);
      return response.data;
    } catch (error) {
      // 404 is expected when mentor hasn't created profile yet
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error getting public mentor profile:', error);
      throw error;
    }
  },

  // Mentor Availability Management
  createAvailability: async (availabilityData) => {
    try {
      const response = await api.post('/mentor-sessions/mentor/availability', availabilityData);
      return response.data;
    } catch (error) {
      console.error('Error creating availability:', error);
      throw error;
    }
  },

  getMentorAvailability: async () => {
    try {
      const response = await api.get('/mentor-sessions/mentor/availability');
      return response.data;
    } catch (error) {
      console.error('Error getting mentor availability:', error);
      throw error;
    }
  },

  updateAvailability: async (availabilityId, availabilityData) => {
    try {
      const response = await api.put(`/mentor-sessions/mentor/availability/${availabilityId}`, availabilityData);
      return response.data;
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  },

  deleteAvailability: async (availabilityId) => {
    try {
      const response = await api.delete(`/mentor-sessions/mentor/availability/${availabilityId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting availability:', error);
      throw error;
    }
  },

  // Mentor Discovery
  getAvailableMentors: async (expertiseArea = null) => {
    try {
      const params = expertiseArea ? { expertise_area: expertiseArea } : {};
      const response = await api.get('/mentor-sessions/mentors', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting available mentors:', error);
      throw error;
    }
  },

  getAvailableTimeSlots: async (mentorId, date) => {
    try {
      const response = await api.get(`/mentor-sessions/mentor/${mentorId}/available-slots`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      throw error;
    }
  },

  // Session Booking
  bookSession: async (bookingData) => {
    try {
      const response = await api.post('/mentor-sessions/book', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error booking session:', error);
      throw error;
    }
  },

  // Session Management
  getUserSessions: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/mentor-sessions/sessions', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  },

  // Get session by ID
  getSessionById: async (sessionId) => {
    try {
      const response = await api.get(`/mentor-sessions/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting session by ID:', error);
      throw error;
    }
  },

  getSession: async (sessionId) => {
    try {
      const response = await api.get(`/mentor-sessions/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  },

  updateSessionStatus: async (sessionId, status) => {
    try {
      const response = await api.put(`/mentor-sessions/sessions/${sessionId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  },

  // Session Reviews
  createSessionReview: async (sessionId, reviewData) => {
    try {
      const response = await api.post(`/mentor-sessions/sessions/${sessionId}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating session review:', error);
      throw error;
    }
  },

  // Payment Verification
  verifySessionPayment: async (sessionId) => {
    try {
      const response = await api.post(`/mentor-sessions/session/${sessionId}/verify-payment`);
      return response.data;
    } catch (error) {
      console.error('Error verifying session payment:', error);
      throw error;
    }
  },

  // Dashboard Stats
  getMentorDashboard: async () => {
    try {
      const response = await api.get('/mentor-sessions/mentor/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error getting mentor dashboard:', error);
      throw error;
    }
  },

  getStudentDashboard: async () => {
    try {
      const response = await api.get('/mentor-sessions/student/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error getting student dashboard:', error);
      throw error;
    }
  }
};

export default mentorSessionApi;
