import api from './api';

export const mockExamApi = {
  // Check access status for mock exams
  getAccessStatus: async () => {
    try {
      const response = await api.get('/mock-exam/access-status');
      return response.data;
    } catch (error) {
      console.error('Error checking mock exam access:', error);
      throw new Error(error.response?.data?.detail || 'Failed to check mock exam access');
    }
  },

  // Generate a new mock exam (20 questions)
  generateMockExam: async (certification, difficulty) => {
    try {
      const response = await api.post('/mock-exam/generate', {
        certification,
        difficulty
      });
      return response.data;
    } catch (error) {
      console.error('Error generating mock exam:', error);
      throw new Error(error.response?.data?.detail || 'Failed to generate mock exam');
    }
  },

  // Submit mock exam answers
  submitMockExam: async (examId, answers) => {
    try {
      const response = await api.post('/mock-exam/submit', {
        mock_exam_id: examId,
        answers
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting mock exam:', error);
      throw new Error(error.response?.data?.detail || 'Failed to submit mock exam');
    }
  },

  // Get user's mock exams
  getUserMockExams: async (skip = 0, limit = 20) => {
    try {
      const response = await api.get(`/mock-exam/?skip=${skip}&limit=${limit}`);
      return response.data.mock_exams; // Extract mock_exams array from response
    } catch (error) {
      console.error('Error fetching user mock exams:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch mock exams');
    }
  },

  // Get specific mock exam
  getMockExam: async (examId) => {
    try {
      const response = await api.get(`/mock-exam/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mock exam:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch mock exam');
    }
  },

  // Get detailed mock exam review with explanations
  getMockExamReview: async (examId) => {
    try {
      const response = await api.get(`/mock-exam/${examId}/review`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mock exam review:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch mock exam review');
    }
  },

  // Delete mock exam
  deleteMockExam: async (examId) => {
    try {
      const response = await api.delete(`/mock-exam/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting mock exam:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete mock exam');
    }
  },

  // Get mock exam statistics
  getMockExamStatistics: async () => {
    try {
      const response = await api.get('/mock-exam/statistics/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching mock exam statistics:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch mock exam statistics');
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
  }
};

export default mockExamApi;