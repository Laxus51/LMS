import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { mockExamApi } from '../services/mockExamApi';

const MockExamResult = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get result from navigation state if available
  const resultFromState = location.state?.result;

  useEffect(() => {
    if (user && examId) {
      loadExam();
    }
  }, [user, examId]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      const examData = await mockExamApi.getMockExam(examId);
      
      // Check if exam is not completed
      if (!examData.completed_at) {
        navigate(`/mock-exam/attempt/${examId}`);
        return;
      }
      
      setExam(examData);
    } catch (err) {
      setError('Failed to load mock exam results: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceMessage = (score, status) => {
    if (status === 'pass') {
      if (score >= 90) {
        return {
          message: 'Outstanding Performance! You\'re well-prepared for the certification exam.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: '🏆'
        };
      } else if (score >= 80) {
        return {
          message: 'Excellent Work! You have a strong understanding of the material.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: '🎉'
        };
      } else {
        return {
          message: 'Good Job! You passed the mock exam. Keep studying to improve your score.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: '✅'
        };
      }
    } else {
      return {
        message: 'Keep Studying! You need 70% to pass. Review the explanations and try again.',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '📚'
      };
    }
  };

  const getCorrectAnswersCount = () => {
    if (!exam?.user_answers || !exam?.exam_content?.questions) return 0;
    return exam.user_answers.filter(answer => answer.is_correct).length;
  };

  const getTotalQuestions = () => {
    return exam?.exam_content?.questions?.length || 0;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status) => {
    if (status === 'pass') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          ✅ PASSED
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          ❌ FAILED
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Mock Exam Results" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <Header title="Mock Exam Results" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/mock-exam/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Mock Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  const score = exam?.score || 0;
  const status = exam?.status || 'fail';
  const performance = getPerformanceMessage(score, status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Mock Exam Results" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Banner */}
        <div className={`${performance.bgColor} border border-opacity-20 rounded-lg p-6 mb-8 text-center`}>
          <div className="mb-4">
            <div className="text-6xl mb-4">{performance.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mock Exam Completed!</h2>
            <div className="mb-4">
              {getStatusBadge(status)}
            </div>
            <p className={`text-lg font-medium ${performance.color}`}>
              {performance.message}
            </p>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {exam?.certification} Mock Exam Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(score)} mb-2`}>
                  {score}%
                </div>
                <div className="text-sm text-gray-500">Final Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {getCorrectAnswersCount()}
                </div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {getTotalQuestions()}
                </div>
                <div className="text-sm text-gray-500">Total Questions</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  14
                </div>
                <div className="text-sm text-gray-500">Required to Pass</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Certification:</span> {exam?.certification}
                </div>
                <div>
                  <span className="font-medium">Level:</span> Certification
                </div>
                <div>
                  <span className="font-medium">Completed:</span> {exam?.completed_at ? new Date(exam.completed_at).toLocaleString() : 'Just now'}
                </div>
                <div>
                  <span className="font-medium">Time Taken:</span> {exam?.created_at && exam?.completed_at ? 
                    Math.round((new Date(exam.completed_at) - new Date(exam.created_at)) / 60000) + ' minutes' : 
                    'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Performance Analysis</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Accuracy Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      score >= 70 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <span className={`font-medium ${getScoreColor(score)}`}>{score}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Correct:</span>
                <span className="font-medium text-green-600">{getCorrectAnswersCount()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Incorrect:</span>
                <span className="font-medium text-red-600">{getTotalQuestions() - getCorrectAnswersCount()}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pass Threshold:</span>
                <span className="font-medium text-blue-600">70% (14/20 questions)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate(`/mock-exam/review/${examId}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Review Answers
          </button>
          
          <button
            onClick={() => navigate('/mock-exam/create')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Take New Mock Exam
          </button>
          
          <button
            onClick={() => navigate('/mock-exam/history')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            View History
          </button>
          
          {status === 'fail' && (
            <button
              onClick={() => navigate('/quiz/create')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Practice with Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockExamResult;