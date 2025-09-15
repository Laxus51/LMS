import api from './api.js';

class StudyPlanProgressApi {
  async toggleDayCompletion(studyPlanId, dayNumber) {
    const response = await api.post(`/study-plans/${studyPlanId}/progress/days/${dayNumber}/toggle`);
    return response.data;
  }

  async markDayCompleted(studyPlanId, dayNumber) {
    const response = await api.post(`/study-plans/${studyPlanId}/progress/days/${dayNumber}/complete`);
    return response.data;
  }

  async markDayIncomplete(studyPlanId, dayNumber) {
    const response = await api.post(`/study-plans/${studyPlanId}/progress/days/${dayNumber}/incomplete`);
    return response.data;
  }

  async getStudyPlanProgress(studyPlanId) {
    const response = await api.get(`/study-plans/${studyPlanId}/progress`);
    return response.data;
  }

  async getProgressSummary(studyPlanId) {
    const response = await api.get(`/study-plans/${studyPlanId}/progress/summary`);
    return response.data;
  }
}

export const studyPlanProgressApi = new StudyPlanProgressApi();