import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyPlanApi } from '../services/studyPlanApi';
import { useAuth } from '../contexts/AuthContext';
import StudyPlanLoadingExperience from './StudyPlanLoadingExperience';

const StudyPlanGenerator = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState([]);
  const [allowedDurations, setAllowedDurations] = useState([]);
  const [selectedCertification, setSelectedCertification] = useState('');
  const [dailyHours, setDailyHours] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApiComplete, setIsApiComplete] = useState(false);
  const [error, setError] = useState('');
  const [userStudyPlans, setUserStudyPlans] = useState([]);
  const [showExistingPlans, setShowExistingPlans] = useState(true);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [certificationsResponse, durationsResponse, plansResponse] = await Promise.all([
        studyPlanApi.getCertifications(),
        studyPlanApi.getAllowedDurations(),
        studyPlanApi.getUserStudyPlans()
      ]);
      
      // Convert certifications object to array
      const certsArray = Object.values(certificationsResponse.certifications || {});
      setCertifications(certsArray);
      setAllowedDurations(durationsResponse.durations || []);
      setUserStudyPlans(plansResponse.study_plans || []);
      
      // Set default duration based on user role
      if ((durationsResponse.durations || []).length > 0) {
        setSelectedDuration(durationsResponse.durations[0]);
      }
    } catch (err) {
      setError('Failed to load initial data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedCertification) {
      setError('Please select a certification');
      return;
    }

    try {
      setIsGenerating(true);
      setIsApiComplete(false);
      setError('');
      const validDailyHours = dailyHours === '' || isNaN(parseFloat(dailyHours)) ? 1 : parseFloat(dailyHours);
      const validDuration = selectedDuration === '' || isNaN(parseInt(selectedDuration)) ? 7 : parseInt(selectedDuration);
      const plan = await studyPlanApi.previewStudyPlan(
        selectedCertification,
        validDuration,
        validDailyHours
      );
      setIsApiComplete(true);
      // Small delay to show completion before navigation
      setTimeout(() => {
        navigate(`/study-plan/preview`, { state: { plan, isPreview: true } });
      }, 500);
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
      setIsApiComplete(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCertification) {
      setError('Please select a certification');
      return;
    }

    try {
      setIsGenerating(true);
      setIsApiComplete(false);
      setError('');
      const validDailyHours = dailyHours === '' || isNaN(parseFloat(dailyHours)) ? 1 : parseFloat(dailyHours);
      const validDuration = selectedDuration === '' || isNaN(parseInt(selectedDuration)) ? 7 : parseInt(selectedDuration);
      const plan = await studyPlanApi.generateStudyPlan(
        selectedCertification,
        validDuration,
        validDailyHours
      );
      setIsApiComplete(true);
      // Small delay to show completion before navigation
      setTimeout(() => {
        navigate(`/study-plan/${plan.id}`);
      }, 500);
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
      setIsApiComplete(false);
    }
  };

  const handleCancel = () => {
    setIsGenerating(false);
    setError('');
  };



  const handleDeletePlan = async (planId) => {
    try {
      await studyPlanApi.deleteStudyPlan(planId);
      // Refresh user study plans
      const plansResponse = await studyPlanApi.getUserStudyPlans();
      setUserStudyPlans(plansResponse.study_plans);
    } catch (err) {
      setError('Failed to delete study plan: ' + err.message);
    }
  };

  const handleViewPlan = (planId) => {
    navigate(`/study-plan/${planId}`);
  };



  // Show loading state for initial data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show engaging loading experience during study plan generation
  if (isGenerating) {
    return (
      <StudyPlanLoadingExperience 
        certification={selectedCertification}
        duration={selectedDuration}
        dailyHours={dailyHours}
        onCancel={handleCancel}
        isComplete={isApiComplete}
      />
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Microsoft Security Certification Study Plan Generator</h1>
          <p className="text-gray-600">Create a personalized study plan for Microsoft Security certifications</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate New Study Plan</h2>
              
              <div className="mb-6">
                <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-2">Select Certification</label>
                <select
                  id="certification"
                  value={selectedCertification}
                  onChange={(e) => setSelectedCertification(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a certification...</option>
                  {certifications.map((cert) => (
                    <option key={cert.code} value={cert.code}>
                      {cert.name} ({cert.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="dailyHours" className="block text-sm font-medium text-gray-700 mb-2">Daily Study Hours</label>
                <input
                  type="number"
                  id="dailyHours"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setDailyHours('');
                    } else {
                      const numValue = parseFloat(value);
                      setDailyHours(isNaN(numValue) ? 1 : numValue);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                      setDailyHours(1);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <small className="text-gray-500 text-sm mt-1 block">How many hours can you study per day?</small>
              </div>

              {userRole !== 'free' && (
                <div className="mb-6">
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">Study Plan Duration</label>
                  <select
                    id="duration"
                    value={selectedDuration}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setSelectedDuration(isNaN(value) ? 7 : value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {(allowedDurations || []).map((duration) => (
                      <option key={duration} value={duration}>
                        {duration} days
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {userRole === 'free' && (
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Free Plan:</span> Your study plan will be 7 days long.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      💎 Upgrade to Premium for 30, 60, and 90-day plans
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={handlePreview}
                  disabled={isLoading || isGenerating || !selectedCertification}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Preview Plan'}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || isGenerating || !selectedCertification}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Generate & Save Plan'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Study Plans</h2>
                <button
                  onClick={() => setShowExistingPlans(!showExistingPlans)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {showExistingPlans ? 'Hide' : 'Show'} ({userStudyPlans.length})
                </button>
              </div>
              
              {showExistingPlans && (
                <div className="space-y-4">
                  {(userStudyPlans || []).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No study plans created yet.</p>
                  ) : (
                    (userStudyPlans || []).map((plan) => (
                      <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{plan.certification_name} ({plan.certification})</h3>
                            <p className="text-sm text-gray-600 mb-1">{plan.duration_days} days • {plan.daily_hours}h/day</p>
                            <small className="text-xs text-gray-500">Created: {new Date(plan.created_at).toLocaleDateString()}</small>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleViewPlan(plan.id)}
                              className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanGenerator;