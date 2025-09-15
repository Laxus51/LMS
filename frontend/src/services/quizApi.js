import api from './api';

export const quizApi = {
  // Generate a new quiz
  generateQuiz: async (certification, topic, difficulty) => {
    try {
      const response = await api.post('/quiz/generate', {
        certification,
        topic,
        difficulty
      });
      return response.data;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error(error.response?.data?.detail || 'Failed to generate quiz');
    }
  },

  // Submit quiz answers
  submitQuiz: async (quizId, answers) => {
    try {
      const response = await api.post('/quiz/submit', {
        quiz_id: quizId,
        answers
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw new Error(error.response?.data?.detail || 'Failed to submit quiz');
    }
  },

  // Get user's quizzes
  getUserQuizzes: async (skip = 0, limit = 20) => {
    try {
      const response = await api.get(`/quiz/?skip=${skip}&limit=${limit}`);
      return response.data.quizzes; // Extract quizzes array from response
    } catch (error) {
      console.error('Error fetching user quizzes:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch quizzes');
    }
  },

  // Get specific quiz
  getQuiz: async (quizId) => {
    try {
      const response = await api.get(`/quiz/${quizId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch quiz');
    }
  },

  // Get detailed quiz review with explanations
  getQuizReview: async (quizId) => {
    try {
      const response = await api.get(`/quiz/${quizId}/review`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz review:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch quiz review');
    }
  },



  // Delete quiz
  deleteQuiz: async (quizId) => {
    try {
      const response = await api.delete(`/quiz/${quizId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete quiz');
    }
  },

  // Get quiz statistics
  getQuizStatistics: async () => {
    try {
      const response = await api.get('/quiz/statistics/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch quiz statistics');
    }
  },

  // Get available certifications (reuse from study plan)
  getCertifications: async () => {
    try {
      const response = await api.get('/study-plans/certifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching certifications:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch certifications');
    }
  },

  // Get quiz access status
  getAccessStatus: async () => {
    try {
      const response = await api.get('/quiz/access-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz access status:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch access status');
    }
  }
};

export default quizApi;