import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { quizApi } from '../services/quizApi';

const QuizHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'score', 'certification'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'completed', 'incomplete'

  useEffect(() => {
    if (user) {
      loadUserQuizzes();
    }
  }, [user]);

  const loadUserQuizzes = async () => {
    try {
      setIsLoading(true);
      const quizzes = await quizApi.getUserQuizzes();
      // Ensure quizzes is always an array
      setUserQuizzes(Array.isArray(quizzes) ? quizzes : []);
    } catch (err) {
      setError('Failed to load quiz history: ' + err.message);
      setUserQuizzes([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredAndSortedQuizzes = () => {
    // Ensure userQuizzes is an array
    if (!Array.isArray(userQuizzes)) {
      return [];
    }
    
    let filtered = userQuizzes;
    
    // Apply filter
    if (filterBy === 'completed') {
      filtered = filtered.filter(quiz => quiz.completed_at);
    } else if (filterBy === 'incomplete') {
      filtered = filtered.filter(quiz => !quiz.completed_at);
    }
    
    // Apply sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'certification':
          return a.certification.localeCompare(b.certification);
        case 'date':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const handleQuizAction = (quiz) => {
    if (quiz.completed_at) {
      navigate(`/quiz/review/${quiz.id}`);
    } else {
      navigate(`/quiz/attempt/${quiz.id}`);
    }
  };

  const getStats = () => {
    const completed = userQuizzes.filter(quiz => quiz.completed_at);
    const totalScore = completed.reduce((sum, quiz) => sum + (quiz.score || 0), 0);
    const averageScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
    
    return {
      total: userQuizzes.length,
      completed: completed.length,
      incomplete: userQuizzes.length - completed.length,
      averageScore
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Quiz History" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredQuizzes = getFilteredAndSortedQuizzes();
  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Quiz History" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Quizzes</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.incomplete}</div>
            <div className="text-sm text-gray-500">Incomplete</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore}%
            </div>
            <div className="text-sm text-gray-500">Average Score</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by:</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Quizzes</option>
                  <option value="completed">Completed</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date Created</option>
                  <option value="score">Score</option>
                  <option value="certification">Certification</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/quiz/create')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Quiz
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Quiz List */}
        {filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterBy === 'all' ? 'No quizzes found' : `No ${filterBy} quizzes found`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filterBy === 'all' 
                ? 'Start by creating your first quiz!' 
                : `Try changing the filter or create a new quiz.`
              }
            </p>
            <button
              onClick={() => navigate('/quiz/create')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quiz.certification}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quiz.completed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quiz.completed_at ? 'Completed' : 'In Progress'}
                      </span>
                      {quiz.completed_at && quiz.score !== null && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBadgeColor(quiz.score)}`}>
                          {quiz.score}%
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Topic: {quiz.topic}</div>
                      <div>Difficulty: {quiz.difficulty}</div>
                      <div>Created: {new Date(quiz.created_at).toLocaleDateString()}</div>
                      {quiz.completed_at && (
                        <div>Completed: {new Date(quiz.completed_at).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleQuizAction(quiz)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        quiz.completed_at
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {quiz.completed_at ? 'Review' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;