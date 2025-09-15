import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { quizApi } from '../services/quizApi';

const QuizAttempt = () => {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      
      // Check if quiz is already completed
      if (quizData.completed_at) {
        navigate(`/quiz/review/${quizId}`);
        return;
      }
      
      setQuiz(quizData);
    } catch (err) {
      setError('Failed to load quiz: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !quiz.quiz_content) return;

    const answers = quiz.quiz_content.questions.map(question => ({
      question_id: question.question_id,
      selected_option: userAnswers[question.question_id] || '',
      is_correct: userAnswers[question.question_id] === question.correct_answer
    }));

    // Check if all questions are answered
    const unansweredQuestions = answers.filter(answer => !answer.selected_option);
    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const result = await quizApi.submitQuiz(quiz.id, answers);
      
      // Navigate to results page
      navigate(`/quiz/result/${quiz.id}`, { state: { result } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).filter(key => userAnswers[key]).length;
  };

  const getTotalQuestions = () => {
    return quiz?.quiz_content?.questions?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Taking Quiz" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Quiz Error" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Taking Quiz" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Quiz Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {quiz?.certification} Quiz
              </h2>
              <p className="text-gray-600">
                Topic: {quiz?.topic} | Difficulty: {quiz?.difficulty}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Progress: {getAnsweredCount()}/{getTotalQuestions()}
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-8">
            {quiz?.quiz_content?.questions?.map((question, index) => (
              <div key={question.question_id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {index + 1}. {question.question}
                </h3>
                
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option.option_id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        userAnswers[question.question_id] === option.option_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.question_id}`}
                        value={option.option_id}
                        checked={userAnswers[question.question_id] === option.option_id}
                        onChange={() => handleAnswerSelect(question.question_id, option.option_id)}
                        className="mr-3"
                      />
                      <span className="font-medium mr-2">{option.option_id}.</span>
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => navigate('/quiz/create')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {getAnsweredCount() === getTotalQuestions() ? 
                  'All questions answered!' : 
                  `${getTotalQuestions() - getAnsweredCount()} questions remaining`
                }
              </div>
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting || getAnsweredCount() !== getTotalQuestions()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;