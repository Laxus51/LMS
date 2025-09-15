import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { quizApi } from '../services/quizApi';

const QuizResult = () => {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get result from navigation state if available
  const resultFromState = location.state?.result;

  useEffect(() => {
    if (user && quizId) {
      loadQuiz();
    }
  }, [user, quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      const quizData = await quizApi.getQuiz(quizId);
      
      // Check if quiz is not completed
      if (!quizData.completed_at) {
        navigate(`/quiz/attempt/${quizId}`);
        return;
      }
      
      setQuiz(quizData);
    } catch (err) {
      setError('Failed to load quiz results: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return { message: 'Excellent work!', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 80) return { message: 'Great job!', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (score >= 70) return { message: 'Good effort!', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (score >= 60) return { message: 'Keep practicing!', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { message: 'More study needed.', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const getCorrectAnswersCount = () => {
    if (!quiz?.user_answers || !quiz?.quiz_content?.questions) return 0;
    return quiz.user_answers.filter(answer => answer.is_correct).length;
  };

  const getTotalQuestions = () => {
    return quiz?.quiz_content?.questions?.length || 0;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Quiz Results" />
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
        <Header title="Quiz Results" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/quiz/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const score = quiz?.score || 0;
  const performance = getPerformanceMessage(score);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Quiz Results" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Congratulations Banner */}
        <div className={`${performance.bgColor} border border-opacity-20 rounded-lg p-6 mb-8 text-center`}>
          <div className="mb-4">
            <svg className={`w-16 h-16 mx-auto ${performance.color}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
          <p className={`text-lg font-medium ${performance.color}`}>
            {performance.message}
          </p>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {quiz?.certification} Quiz Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Topic:</span> {quiz?.topic}
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span> {quiz?.difficulty}
                </div>
                <div>
                  <span className="font-medium">Completed:</span> {quiz?.completed_at ? new Date(quiz.completed_at).toLocaleString() : 'Just now'}
                </div>
                <div>
                  <span className="font-medium">Time Taken:</span> {quiz?.created_at && quiz?.completed_at ? 
                    Math.round((new Date(quiz.completed_at) - new Date(quiz.created_at)) / 60000) + ' minutes' : 
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
                      score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate(`/quiz/review/${quiz?.id}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Review Answers
          </button>
          
          <button
            onClick={() => navigate('/quiz/create')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Take New Quiz
          </button>
          
          <button
            onClick={() => navigate('/quiz/history')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;