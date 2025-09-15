import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { mockExamApi } from '../services/mockExamApi';

const MockExamAttempt = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (user && examId) {
      loadExam();
      setStartTime(new Date());
    }
  }, [user, examId]);

  // Timer effect
  useEffect(() => {
    if (startTime && !exam?.completed_at) {
      const timer = setInterval(() => {
        setTimeElapsed(Math.floor((new Date() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, exam?.completed_at]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      const examData = await mockExamApi.getMockExam(examId);
      
      // Check if exam is already completed
      if (examData.completed_at) {
        navigate(`/mock-exam/review/${examId}`);
        return;
      }
      
      setExam(examData);
    } catch (err) {
      setError('Failed to load mock exam: ' + err.message);
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

  const handleSubmitExam = async () => {
    if (!exam || !exam.exam_content) return;

    const answers = exam.exam_content.questions.map(question => ({
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
      
      if (!examId) {
        throw new Error('Invalid exam: missing exam ID');
      }
      
      const result = await mockExamApi.submitMockExam(examId, answers);
      
      // Navigate to results page
      navigate(`/mock-exam/result/${examId}`, { state: { result } });
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
    return exam?.exam_content?.questions?.length || 0;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Taking Mock Exam" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Mock Exam Error" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Taking Mock Exam" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Exam Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {exam?.certification} Mock Exam
              </h2>
              <p className="text-gray-600">
                Certification Level | Pass Threshold: 70% (14/20)
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Progress: {getAnsweredCount()}/{getTotalQuestions()}
              </div>
              <div className="text-sm text-gray-500">
                Time: {formatTime(timeElapsed)}
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(getAnsweredCount() / getTotalQuestions()) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-8">
            {exam?.exam_content?.questions?.map((question, index) => (
              <div key={question.question_id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Question {index + 1} of {getTotalQuestions()}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {question.question}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
                    const isSelected = userAnswers[question.question_id] === optionLetter;
                    
                    return (
                      <label
                        key={optionIndex}
                        className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.question_id}`}
                          value={optionLetter}
                          checked={isSelected}
                          onChange={() => handleAnswerSelect(question.question_id, optionLetter)}
                          className="mt-1 mr-3 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 mr-2">
                            {optionLetter}.
                          </span>
                          <span className="text-gray-700">
                            {option.text}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Questions answered: {getAnsweredCount()} of {getTotalQuestions()}</p>
                <p>Time elapsed: {formatTime(timeElapsed)}</p>
              </div>
              
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting || getAnsweredCount() < getTotalQuestions()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Mock Exam'
                )}
              </button>
            </div>
            
            {getAnsweredCount() < getTotalQuestions() && (
              <p className="text-sm text-yellow-600 mt-2">
                Please answer all questions before submitting.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockExamAttempt;