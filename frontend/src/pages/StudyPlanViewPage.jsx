import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import StudyPlanDisplay from '../components/StudyPlanDisplay';
import { studyPlanApi } from '../services/studyPlanApi';

const StudyPlanViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Check if we have preview data from navigation state
    if (location.state?.plan) {
      setStudyPlan(location.state.plan);
      setIsPreview(location.state.isPreview || false);
      setLoading(false);
      return;
    }

    // Otherwise fetch the study plan by ID
    const fetchStudyPlan = async () => {
      try {
        setLoading(true);
        const plan = await studyPlanApi.getStudyPlan(id);
        setStudyPlan(plan);
        setIsPreview(false);
      } catch (err) {
        console.error('Error fetching study plan:', err);
        setError('Failed to load study plan');
      } finally {
        setLoading(false);
      }
    };

    if (id && id !== 'preview') {
      fetchStudyPlan();
    } else if (id === 'preview' && !location.state?.plan) {
      setError('No preview data available');
      setLoading(false);
    }
  }, [id, location.state]);

  const handleBack = () => {
    navigate('/study-plan');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Study Plan" showBackButton onBackClick={handleBack} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Study Plan" showBackButton onBackClick={handleBack} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={handleBack}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Study Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!studyPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Study Plan" showBackButton onBackClick={handleBack} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-gray-600 text-lg mb-4">Study plan not found</div>
            <button
              onClick={handleBack}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Study Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Study Plan" showBackButton onBackClick={handleBack} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudyPlanDisplay 
          plan={studyPlan}
          onBack={handleBack}
          isPreview={isPreview}
          onGenerate={async () => {
            // Handle generate from preview
            try {
              const generatedPlan = await studyPlanApi.generateStudyPlan(
                studyPlan.certification_name,
                studyPlan.duration_days,
                studyPlan.daily_hours
              );
              navigate(`/study-plan/${generatedPlan.id}`);
            } catch (err) {
              console.error('Error generating study plan:', err);
            }
          }}
        />
      </div>
    </div>
  );
};

export default StudyPlanViewPage;