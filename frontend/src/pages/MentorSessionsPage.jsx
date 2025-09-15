import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Star,
  MessageCircle,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Filter,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import mentorSessionApi from '../services/mentorSessionApi';
import { useAuth, USER_ROLES } from '../contexts/AuthContext';
import Header from '../components/Header';

const MentorSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchSessionData();
  }, []);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const [sessionsData, statsData] = await Promise.all([
        mentorSessionApi.getUserSessions(),
        mentorSessionApi.getStudentDashboard()
      ]);

      setSessions(sessionsData);
      setStats(statsData);
    } catch (error) {
      setError('Failed to load session data');
      console.error('Session data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await mentorSessionApi.createSessionReview(selectedSession.id, reviewData);
      setShowReviewModal(false);
      setSelectedSession(null);
      setReviewData({ rating: 5, comment: '' });
      fetchSessionData(); // Refresh data
    } catch (error) {
      setError('Failed to submit review');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSessions = sessions.filter(session => {
    if (selectedStatus === 'all') return true;
    return session.status === selectedStatus;
  });

  const upcomingSessions = sessions.filter(session => 
    session.status === 'confirmed' && new Date(session.scheduled_at) > new Date()
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header title="My Mentor Sessions" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Dashboard
            </button>
          </li>
          <li className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            <span className="text-gray-900 font-medium">My Sessions</span>
          </li>
          <li className="flex items-center">
            <span className="text-gray-400 mx-2">•</span>
            <button
              onClick={() => navigate('/mentor-booking')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Find Mentors
            </button>
          </li>
        </ol>
      </nav>
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Mentor Sessions</h1>
            <p className="text-gray-600 mt-2">Track and manage your mentoring sessions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/mentor-booking')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book New Session
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_sessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming_sessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed_sessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.total_spent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Sessions Highlight */}
      {upcomingSessions.length > 0 && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Upcoming Sessions</h3>
          <div className="space-y-3">
            {upcomingSessions.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between bg-white rounded-lg p-4">
                <div>
                  <h4 className="font-medium text-gray-900">{session.title}</h4>
                  <p className="text-sm text-gray-600">
                    with {session.mentor_name} • {formatDate(session.scheduled_at)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">${session.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">All Sessions</h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {selectedStatus === 'all' ? 'No sessions booked yet.' : `No ${selectedStatus} sessions.`}
              </p>
              <a
                href="/mentor-booking"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Your First Session
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{session.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                          {getStatusIcon(session.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <User className="w-4 h-4 inline mr-1" />
                            Mentor: {session.mentor_name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(session.scheduled_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Duration: {session.duration_minutes} minutes
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            Price: ${session.price}
                          </p>
                        </div>
                      </div>

                      {session.description && (
                        <p className="text-sm text-gray-700 mb-4">{session.description}</p>
                      )}

                      {session.meeting_link && session.status === 'confirmed' && (
                        <div className="mb-4">
                          <a
                            href={session.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}

                      <div className="flex items-center space-x-4">
                        {session.status === 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowReviewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Leave Review
                          </button>
                        )}
                        
                        {session.mentor_notes && (
                          <div className="text-sm">
                            <span className="text-gray-600">Mentor Notes:</span>
                            <p className="text-gray-900 mt-1">{session.mentor_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Review Session with {selectedSession.mentor_name}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    className={`w-8 h-8 ${
                      star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                placeholder="Share your experience with this mentor..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedSession(null);
                  setReviewData({ rating: 5, comment: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default MentorSessionsPage;
