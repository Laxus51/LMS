import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { quizApi } from '../services/quizApi';

const QuizReview = () => {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('Failed to load quiz: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getOptionClass = (question, option) => {
    const userAnswer = quiz.user_answers?.find(answer => answer.question_id === question.question_id);
    const isUserSelected = userAnswer?.selected_option === option.option_id;
    const isCorrect = question.correct_answer === option.option_id;
    
    if (isCorrect) {
      return 'border-green-500 bg-green-50 text-green-800';
    } else if (isUserSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-800';
    }
    return 'border-gray-200 bg-gray-50';
  };

  const getOptionIcon = (question, option) => {
    const userAnswer = quiz.user_answers?.find(answer => answer.question_id === question.question_id);
    const isUserSelected = userAnswer?.selected_option === option.option_id;
    const isCorrect = question.correct_answer === option.option_id;
    
    if (isCorrect) {
      return (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    } else if (isUserSelected && !isCorrect) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return { message: 'Excellent work!', color: 'text-green-600' };
    if (score >= 80) return { message: 'Great job!', color: 'text-blue-600' };
    if (score >= 70) return { message: 'Good effort!', color: 'text-yellow-600' };
    if (score >= 60) return { message: 'Keep practicing!', color: 'text-orange-600' };
    return { message: 'More study needed.', color: 'text-red-600' };
  };

  const getCorrectAnswersCount = () => {
    if (!quiz?.user_answers || !quiz?.quiz_content?.questions) return 0;
    return quiz.user_answers.filter(answer => answer.is_correct).length;
  };

  const getTotalQuestions = () => {
    return quiz?.quiz_content?.questions?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Quiz Review" />
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
        <Header title="Quiz Review" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/quiz/history')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Quiz History
            </button>
          </div>
        </div>
      </div>
    );
  }

  const performance = getPerformanceMessage(quiz?.score || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Quiz Review" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Results Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {quiz?.certification} Quiz Results
            </h2>
            <p className="text-gray-600 mb-4">
              Topic: {quiz?.topic} | Difficulty: {quiz?.difficulty}
            </p>
            
            <div className="flex justify-center items-center space-x-8 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {quiz?.score || 0}%
                </div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {getCorrectAnswersCount()}/{getTotalQuestions()}
                </div>
                <div className="text-sm text-gray-500">Correct</div>
              </div>
            </div>
            
            <p className={`text-lg font-medium ${performance.color}`}>
              {performance.message}
            </p>
            
            {quiz?.completed_at && (
              <p className="text-sm text-gray-500 mt-2">
                Completed on {new Date(quiz.completed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Detailed Review */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Review</h3>
          
          <div className="space-y-8">
            {quiz?.quiz_content?.questions?.map((question, index) => {
              const userAnswer = quiz.user_answers?.find(answer => answer.question_id === question.question_id);
              const isCorrect = userAnswer?.is_correct;
              
              return (
                <div key={question.question_id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 flex-1">
                      {index + 1}. {question.question}
                    </h4>
                    <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                      isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const userAnswer = quiz.user_answers?.find(answer => answer.question_id === question.question_id);
                      const isUserSelected = userAnswer?.selected_option === option.option_id;
                      const isCorrect = question.correct_answer === option.option_id;
                      
                      return (
                        <div
                          key={option.option_id}
                          className={`flex items-center p-3 rounded-lg border ${getOptionClass(question, option)}`}
                        >
                          <div className="flex items-center flex-1">
                            <span className="font-medium mr-2">{option.option_id}.</span>
                            <span>{option.text}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isUserSelected && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Your Answer
                              </span>
                            )}
                            {isCorrect && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Correct Answer
                              </span>
                            )}
                            {getOptionIcon(question, option)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {question.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1">Explanation:</h5>
                      <p className="text-blue-800 text-sm">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/quiz/history')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to History
          </button>
          
          <button
            onClick={() => navigate('/quiz/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take New Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizReview;