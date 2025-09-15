import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { mockExamApi } from '../services/mockExamApi';
import MockExamGenerationLoader from '../components/MockExamGenerationLoader';
import useDynamicLoader from '../hooks/useDynamicLoader';

const MockExamCreation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState([]);
  const [selectedCertification, setSelectedCertification] = useState('');
  const [difficulty] = useState('intermediate'); // Fixed difficulty for real exam simulation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessStatus, setAccessStatus] = useState(null);
  
  // Dynamic loader for mock exam generation
  const {
    isLoading: isGenerating,
    progress,
    currentStep,
    startLoading,
    completeLoading,
    cancelLoading
  } = useDynamicLoader('mock_exam_generation');


  useEffect(() => {
    if (user) {
      loadCertifications();
      checkMockExamAccess();
    }
  }, [user]);



  const loadCertifications = async () => {
    try {
      setIsLoading(true);
      const certificationsResponse = await mockExamApi.getCertifications();
      const certsArray = Object.values(certificationsResponse.certifications || {});
      setCertifications(certsArray);
    } catch (err) {
      setError('Failed to load certifications: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkMockExamAccess = async () => {
    try {
      const response = await mockExamApi.getAccessStatus();
      setAccessStatus(response);
    } catch (err) {
      console.error('Failed to check mock exam access:', err);
      setAccessStatus({ has_access: false, message: 'Failed to check access' });
    }
  };

  const handleGenerateMockExam = async () => {
    if (!selectedCertification) {
      setError('Please select a certification');
      return;
    }

    // Check access before generating
    if (!accessStatus?.has_access) {
      setError(accessStatus?.message || 'You do not have access to generate mock exams');
      return;
    }

    try {
      startLoading();
      setError('');
      
      const response = await mockExamApi.generateMockExam(selectedCertification, difficulty);
      
      // Complete the loading animation
      completeLoading();
      
      // Refresh access status after successful generation
      await checkMockExamAccess();
      
      // Small delay to show completion
      setTimeout(() => {
        if (response?.mock_exam?.id) {
          navigate(`/mock-exam/attempt/${response.mock_exam.id}`);
        } else {
          throw new Error('Invalid response: missing exam ID');
        }
      }, 500);
    } catch (err) {
      setError(err.message);
      cancelLoading();
    }
  };

  const handleReset = () => {
    setSelectedCertification('');
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Create Mock Exam" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show dynamic loading experience during mock exam generation
  if (isGenerating) {
    return (
      <MockExamGenerationLoader
        certification={selectedCertification}
        difficulty={difficulty}
        progress={progress}
        currentStep={currentStep}
        onCancel={cancelLoading}
      />
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Create Mock Exam" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Mock Exam</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Generate a comprehensive 20-question mock exam to test your knowledge and prepare for certification. 
              Mock exams provide a realistic exam experience with pass/fail scoring (70% threshold).
            </p>
          </div>



          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Certification Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification *
              </label>
              <select
                value={selectedCertification}
                onChange={(e) => setSelectedCertification(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isGenerating}
              >
                <option value="">Select a certification...</option>
                {certifications.map((cert) => (
                  <option key={cert.code} value={cert.code}>
                    {cert.name}
                  </option>
                ))}
              </select>
            </div>



            {/* Mock Exam Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Mock Exam Details</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 20 multiple-choice questions</li>
                <li>• Certification-level difficulty (real exam simulation)</li>
                <li>• Pass threshold: 70% (14 correct answers)</li>
                <li>• Comprehensive coverage of certification topics</li>
                <li>• Detailed explanations for all answers</li>
                <li>• Realistic exam simulation experience</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleGenerateMockExam}
                disabled={isGenerating || !selectedCertification}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Mock Exam...
                  </>
                ) : (
                  'Generate Mock Exam'
                )}
              </button>
              
              <button
                onClick={handleReset}
                disabled={isGenerating}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/mock-exam/history')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <h4 className="font-medium text-gray-900">View History</h4>
              <p className="text-sm text-gray-600 mt-1">Review your past mock exams</p>
            </button>
            
            <button
              onClick={() => navigate('/quiz/create')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <h4 className="font-medium text-gray-900">Practice Quiz</h4>
              <p className="text-sm text-gray-600 mt-1">Take a 5-question practice quiz</p>
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <h4 className="font-medium text-gray-900">Dashboard</h4>
              <p className="text-sm text-gray-600 mt-1">Return to your dashboard</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockExamCreation;