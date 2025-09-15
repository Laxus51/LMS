import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import mentorSessionApi from '../services/mentorSessionApi';
import { useAuth } from '../contexts/AuthContext';
import MentorProfileSetup from './MentorProfileSetup';
import MentorAvailability from './MentorAvailability';
import Header from './Header';

const MentorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, sessionsData, profileData] = await Promise.all([
        mentorSessionApi.getMentorDashboard(),
        mentorSessionApi.getUserSessions(),
        mentorSessionApi.getMentorProfile()
      ]);

      setStats(statsData);
      setSessions(sessionsData);
      setProfile(profileData);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (sessionId, newStatus) => {
    try {
      await mentorSessionApi.updateSessionStatus(sessionId, newStatus);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      setError('Failed to update session status');
    }
  };

  const handleProfileCreated = (newProfile) => {
    setProfile(newProfile);
    setShowProfileSetup(false);
    fetchDashboardData(); // Refresh all data
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header title="Mentor Dashboard" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your mentoring sessions and profile</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {!profile && !showProfileSetup && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          <p>You haven't set up your mentor profile yet. 
            <button 
              onClick={() => setShowProfileSetup(true)}
              className="ml-2 text-yellow-800 underline hover:text-yellow-900"
            >
              Create Profile
            </button>
          </p>
        </div>
      )}

      {showProfileSetup && (
        <div className="mb-6">
          <MentorProfileSetup 
            onProfileCreated={handleProfileCreated}
            onCancel={() => setShowProfileSetup(false)}
          />
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
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
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming_sessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.total_earnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'availability'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Availability
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sessions</h3>
              {sessions.length === 0 ? (
                <p className="text-gray-500">No sessions yet.</p>
              ) : (
                <div className="space-y-4">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{session.title}</h4>
                          <p className="text-sm text-gray-600">
                            with {session.student_name} • {formatDate(session.scheduled_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                          {getStatusIcon(session.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">All Sessions</h3>
                <div className="flex space-x-2">
                  {stats?.pending_sessions > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                      {stats.pending_sessions} pending
                    </span>
                  )}
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No sessions scheduled yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{session.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Student: {session.student_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(session.scheduled_at)} • {session.duration_minutes} min
                          </p>
                          {session.description && (
                            <p className="text-sm text-gray-600 mt-2">{session.description}</p>
                          )}
                          <p className="text-sm font-medium text-green-600 mt-2">
                            ${session.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                          {session.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(session.id, 'completed')}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <div>
              <MentorAvailability />
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Management</h3>
              {profile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                    <p className="text-lg font-semibold text-green-600">${profile.hourly_rate}/hour</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <p className="text-gray-900">{profile.bio || 'No bio added yet'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expertise Areas</label>
                    <p className="text-gray-900">{profile.expertise_areas || 'No expertise areas added yet'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                    <p className="text-gray-900">{profile.years_experience || 'Not specified'}</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Create your mentor profile to start accepting sessions.</p>
                  <button 
                    onClick={() => setShowProfileSetup(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default MentorDashboard;
