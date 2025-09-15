import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { mockExamApi } from '../services/mockExamApi';

const MockExamReview = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  useEffect(() => {
    if (user && examId) {
      loadExamReview();
    }
  }, [user, examId]);

  const loadExamReview = async () => {
    try {
      setIsLoading(true);
      const examData = await mockExamApi.getMockExamReview(examId);
      
      // Check if exam is not completed
      if (!examData.completed_at) {
        navigate(`/mock-exam/attempt/${examId}`);
        return;
      }
      
      setExam(examData);
    } catch (err) {
      setError('Failed to load mock exam review: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionExpansion = (questionId) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const expandAllQuestions = () => {
    if (exam?.questions_with_answers) {
      const allQuestionIds = exam.questions_with_answers.map(q => q.question_id);
      setExpandedQuestions(new Set(allQuestionIds));
    }
  };

  const collapseAllQuestions = () => {
    setExpandedQuestions(new Set());
  };

  const getCorrectAnswersCount = () => {
    if (!exam?.questions_with_answers) return 0;
    return exam.questions_with_answers.filter(q => q.is_correct).length;
  };

  const getTotalQuestions = () => {
    return exam?.questions_with_answers?.length || 0;
  };

  const getUserAnswer = (questionId) => {
    const questionData = exam?.questions_with_answers?.find(q => q.question_id === questionId);
    return questionData ? {
      selected_option: questionData.user_answer,
      is_correct: questionData.is_correct
    } : null;
  };

  const getOptionClass = (question, optionLetter, userAnswer) => {
    const isCorrect = optionLetter === question.correct_answer;
    const isUserSelected = userAnswer?.selected_option === optionLetter;
    
    if (isCorrect && isUserSelected) {
      return 'border-green-500 bg-green-50 text-green-800';
    } else if (isCorrect) {
      return 'border-green-500 bg-green-50 text-green-800';
    } else if (isUserSelected) {
      return 'border-red-500 bg-red-50 text-red-800';
    }
    return 'border-gray-200 bg-white text-gray-700';
  };

  const getOptionIcon = (question, optionLetter, userAnswer) => {
    const isCorrect = optionLetter === question.correct_answer;
    const isUserSelected = userAnswer?.selected_option === optionLetter;
    
    if (isCorrect) {
      return <span className="text-green-600 font-bold">✓</span>;
    } else if (isUserSelected) {
      return <span className="text-red-600 font-bold">✗</span>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Mock Exam Review" />
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
        <Header title="Mock Exam Review" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Mock Exam Review" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {exam?.certification} Mock Exam Review
              </h2>
              <p className="text-gray-600">
                Certification Level | Completed: {exam?.completed_at ? new Date(exam.completed_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                status === 'pass' ? 'text-green-600' : 'text-red-600'
              }`}>
                {score}%
              </div>
              <div className="text-sm text-gray-500">
                {getCorrectAnswersCount()}/{getTotalQuestions()} Correct
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {status === 'pass' ? '✅ PASSED' : '❌ FAILED'}
              </span>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={expandAllQuestions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllQuestions}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          {exam?.questions_with_answers?.map((question, index) => {
            const userAnswer = getUserAnswer(question.question_id);
            const isExpanded = expandedQuestions.has(question.question_id);
            const isCorrect = userAnswer?.is_correct;
            
            return (
              <div key={question.question_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Question Header */}
                <div 
                  className={`p-4 cursor-pointer border-l-4 ${
                    isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                  onClick={() => toggleQuestionExpansion(question.question_id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-gray-500 mr-2">
                          Question {index + 1}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {question.question}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Your answer:</span> {userAnswer?.selected_option || 'Not answered'}
                        <span className="mx-2">|</span>
                        <span className="font-medium">Correct answer:</span> {question.correct_answer}
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg 
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-6 border-t border-gray-200">
                    {/* Options */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Answer Options:</h4>
                      {question.options.map((option, optionIndex) => {
                        const optionLetter = String.fromCharCode(65 + optionIndex);
                        const optionClass = getOptionClass(question, optionLetter, userAnswer);
                        const optionIcon = getOptionIcon(question, optionLetter, userAnswer);
                        
                        return (
                          <div
                            key={optionIndex}
                            className={`flex items-start p-3 rounded-lg border-2 ${optionClass}`}
                          >
                            <div className="flex items-center mr-3">
                              <span className="font-medium mr-2">
                                {optionLetter}.
                              </span>
                              {optionIcon}
                            </div>
                            <span className="flex-1">
                              {option.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                        <p className="text-blue-800 leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate(`/mock-exam/result/${examId}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Results
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

export default MockExamReview;