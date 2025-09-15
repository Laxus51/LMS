import api from './api.js';

class StudyPlanApi {
  async getCertifications() {
    const response = await api.get('/study-plans/certifications');
    return response.data;
  }

  async getAllowedDurations() {
    const response = await api.get('/study-plans/allowed-durations');
    return response.data;
  }

  async previewStudyPlan(certification, durationDays, dailyHours) {
    const response = await api.post('/study-plans/preview', {
      certification,
      duration_days: durationDays,
      daily_hours: dailyHours,
    });
    return response.data;
  }

  async generateStudyPlan(certification, durationDays, dailyHours) {
    const response = await api.post('/study-plans/generate', {
      certification,
      duration_days: durationDays,
      daily_hours: dailyHours,
    });
    return response.data;
  }

  async getUserStudyPlans() {
    const response = await api.get('/study-plans/');
    return response.data;
  }

  async getStudyPlan(planId) {
    const response = await api.get(`/study-plans/${planId}`);
    return response.data;
  }

  async deleteStudyPlan(planId) {
    const response = await api.delete(`/study-plans/${planId}`);
    return response.data;
  }


}

export const studyPlanApi = new StudyPlanApi();