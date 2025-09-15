import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { quizApi } from '../services/quizApi';
import QuizGenerationLoader from '../components/QuizGenerationLoader';
import useDynamicLoader from '../hooks/useDynamicLoader';

const QuizCreation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState([]);
  const [selectedCertification, setSelectedCertification] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessStatus, setAccessStatus] = useState(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  
  // Dynamic loader for quiz generation
  const {
    isLoading: isGenerating,
    progress,
    currentStep,
    startLoading,
    completeLoading,
    cancelLoading
  } = useDynamicLoader('quiz_generation');

  useEffect(() => {
    if (user) {
      loadCertifications();
      checkQuizAccess();
    }
  }, [user]);

  const checkQuizAccess = async () => {
    try {
      setIsCheckingAccess(true);
      const response = await quizApi.getAccessStatus();
      setAccessStatus(response); // Response already contains has_access, message, user_role
    } catch (err) {
      console.error('Failed to check quiz access:', err);
      setError('Failed to check quiz access: ' + err.message);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const loadCertifications = async () => {
    try {
      setIsLoading(true);
      const certificationsResponse = await quizApi.getCertifications();
      const certsArray = Object.values(certificationsResponse.certifications || {});
      setCertifications(certsArray);
    } catch (err) {
      setError('Failed to load certifications: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedCertification || !topic.trim()) {
      setError('Please select a certification and enter a topic');
      return;
    }

    // Check access before generating
    if (!accessStatus?.has_access) {
      setError(accessStatus?.message || 'You do not have access to generate quizzes');
      return;
    }

    try {
      startLoading();
      setError('');
      
      const response = await quizApi.generateQuiz(selectedCertification, topic.trim(), difficulty);
      
      // Complete the loading animation
      completeLoading();
      
      // Refresh access status after successful generation
      await checkQuizAccess();
      
      // Small delay to show completion
      setTimeout(() => {
        navigate(`/quiz/attempt/${response.quiz.id}`);
      }, 500);
    } catch (err) {
      setError(err.message);
      cancelLoading();
    }
  };

  const handleReset = () => {
    setSelectedCertification('');
    setTopic('');
    setDifficulty('beginner');
    setError('');
  };

  if (isLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Create Quiz" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">
              {isCheckingAccess ? 'Checking access...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show dynamic loading experience during quiz generation
  if (isGenerating) {
    return (
      <QuizGenerationLoader
        certification={selectedCertification}
        topic={topic}
        difficulty={difficulty}
        progress={progress}
        currentStep={currentStep}
        onCancel={cancelLoading}
      />
    );
  }

  // If user is a mentor, show access denied message
  if (accessStatus?.role === 'mentor') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Create Quiz" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600 mb-4">{accessStatus.message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Create Quiz" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quota Display */}
        {accessStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            accessStatus.role === 'free' 
              ? accessStatus.has_access 
                ? 'bg-blue-50 border border-blue-200' 
                : 'bg-red-50 border border-red-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-medium ${
                  accessStatus.role === 'free'
                    ? accessStatus.has_access ? 'text-blue-900' : 'text-red-900'
                    : 'text-green-900'
                }`}>
                  {accessStatus.role === 'free' ? 'Free Plan' : 
                   accessStatus.role === 'premium' ? 'Premium Plan' : 'Admin Access'}
                </h3>
                <p className={`text-sm ${
                  accessStatus.role === 'free'
                    ? accessStatus.has_access ? 'text-blue-700' : 'text-red-700'
                    : 'text-green-700'
                }`}>
                  {accessStatus.message}
                </p>
              </div>
              {accessStatus.role === 'free' && !accessStatus.has_access && (
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Generate New Quiz</h2>
            <button
              onClick={() => navigate('/quiz/history')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              View History
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification
              </label>
              <select
                value={selectedCertification}
                onChange={(e) => setSelectedCertification(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value="">Select a certification</option>
                {certifications.map((cert) => (
                  <option key={cert.code} value={cert.code}>
                    {cert.code} - {cert.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a specific topic (e.g., 'AWS EC2 instances', 'Network security protocols')..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            />
            <p className="text-sm text-gray-500 mt-1">
              Be specific about the topic you want to be quizzed on
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || !selectedCertification || !topic.trim() || !accessStatus?.has_access}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Quiz...
                </>
              ) : !accessStatus?.has_access ? (
                accessStatus?.role === 'free' ? 'Daily Limit Reached' : 'Access Restricted'
              ) : (
                'Generate Quiz'
              )}
            </button>
            
            <button
              onClick={handleReset}
              disabled={isGenerating}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select your target certification</li>
              <li>• Choose the difficulty level that matches your experience</li>
              <li>• Enter a specific topic you want to focus on</li>
              <li>• Get 5 AI-generated questions tailored to your needs</li>
              <li>• Review your answers and explanations after completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreation;