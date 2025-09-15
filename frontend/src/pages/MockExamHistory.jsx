import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { mockExamApi } from '../services/mockExamApi';

const MockExamHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState('');
  const [filterCertification, setFilterCertification] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (user) {
      loadExams();
      loadStatistics();
    }
  }, [user]);

  const loadExams = async () => {
    try {
      setIsLoading(true);
      const examsData = await mockExamApi.getUserMockExams(0, 50); // Load more exams
      // Ensure examsData is an array and each exam has required properties
      const validExams = Array.isArray(examsData) ? examsData.filter(exam => exam && exam.id) : [];
      setExams(validExams);
    } catch (err) {
      setError('Failed to load mock exam history: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      setIsLoadingStats(true);
      const statsData = await mockExamApi.getMockExamStatistics();
      setStatistics(statsData);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this mock exam? This action cannot be undone.')) {
      return;
    }

    try {
      await mockExamApi.deleteMockExam(examId);
      setExams(exams.filter(exam => exam.id !== examId));
      // Reload statistics after deletion
      loadStatistics();
    } catch (err) {
      setError('Failed to delete mock exam: ' + err.message);
    }
  };

  const getFilteredAndSortedExams = () => {
    // Ensure exams is an array and filter out any invalid entries
    const validExams = Array.isArray(exams) ? exams.filter(exam => exam && exam.id) : [];
    
    let filtered = validExams.filter(exam => {
      const matchesCertification = !filterCertification || exam.certification === filterCertification;
      const matchesStatus = !filterStatus || exam.status === filterStatus;
      return matchesCertification && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at' || sortBy === 'completed_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getUniqueValues = (field) => {
    return [...new Set(exams.map(exam => exam[field]).filter(Boolean))];
  };

  const getStatusBadge = (status, score) => {
    if (status === 'pass') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✅ PASSED ({score}%)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ❌ FAILED ({score}%)
        </span>
      );
    }
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
        <Header title="Mock Exam History" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredExams = getFilteredAndSortedExams();
  const certifications = getUniqueValues('certification');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Mock Exam History" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mock Exam History</h1>
            <p className="text-gray-600 mt-2">
              Review your past mock exam performance and track your progress
            </p>
          </div>
          <button
            onClick={() => navigate('/mock-exam/create')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Take New Mock Exam
          </button>
        </div>

        {/* Statistics Cards */}
        {!isLoadingStats && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {statistics.total_exams || 0}
              </div>
              <div className="text-sm text-gray-600">Total Exams</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {statistics.passed_exams || 0}
              </div>
              <div className="text-sm text-gray-600">Passed Exams</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {statistics.average_score ? `${statistics.average_score.toFixed(1)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {statistics.pass_rate ? `${statistics.pass_rate.toFixed(1)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-600">Pass Rate</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Certification
              </label>
              <select
                value={filterCertification}
                onChange={(e) => setFilterCertification(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Certifications</option>
                {certifications.map(cert => (
                  <option key={cert} value={cert}>{cert}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pass">Passed</option>
                <option value="fail">Failed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_at">Date Created</option>
                <option value="completed_at">Date Completed</option>
                <option value="score">Score</option>
                <option value="certification">Certification</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exams List */}
        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {exams.length === 0 ? 'No Mock Exams Yet' : 'No Exams Match Your Filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {exams.length === 0 
                ? 'Take your first mock exam to start tracking your progress'
                : 'Try adjusting your filters to see more results'
              }
            </p>
            <button
              onClick={() => navigate('/mock-exam/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Take Mock Exam
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExams.map((exam) => (
              exam && exam.id ? (
                <div key={exam.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-4">
                        {exam.certification} Mock Exam
                      </h3>
                      {getStatusBadge(exam.status, exam.score)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Level:</span> Certification
                      </div>
                      <div>
                        <span className="font-medium">Score:</span> 
                        <span className={`ml-1 font-bold ${getScoreColor(exam.score)}`}>
                          {exam.score}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Completed:</span> {exam.completed_at ? new Date(exam.completed_at).toLocaleDateString() : 'In Progress'}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {exam.created_at && exam.completed_at ? 
                          Math.round((new Date(exam.completed_at) - new Date(exam.created_at)) / 60000) + ' min' : 
                          'N/A'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {exam.completed_at && (
                      <>
                        <button
                          onClick={() => navigate(`/mock-exam/result/${exam.id}`)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          Results
                        </button>
                        <button
                          onClick={() => navigate(`/mock-exam/review/${exam.id}`)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                        >
                          Review
                        </button>
                      </>
                    )}
                    {!exam.completed_at && (
                      <button
                        onClick={() => navigate(`/mock-exam/attempt/${exam.id}`)}
                        className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
                      >
                        Continue
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                </div>
              ) : null
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredExams.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {filteredExams.length} of {exams.length} mock exams
          </div>
        )}
      </div>
    </div>
  );
};

export default MockExamHistory;