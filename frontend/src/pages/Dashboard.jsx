import { useNavigate } from 'react-router-dom';
import { useAuth, USER_ROLES } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import api from '../services/api';
import { BookOpen, CheckCircle, ArrowRight, Crown } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/stats');
      const data = response.data.data || response.data;
      setDashboardStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeLearning = () => {
    if (dashboardStats?.last_viewed?.course_id) {
      navigate(`/courses/${dashboardStats.last_viewed.course_id}`);
    } else {
      navigate('/courses');
    }
  };

  const formatLastAccessed = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="app-content">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-[26px] font-semibold text-[#111827] mb-1">
            {user?.role === 'admin'
              ? `Welcome, ${user?.name?.split(' ')[0] || 'Admin'}`
              : `Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
          </h2>
          <p className="text-sm text-[#6B7280]">
            {user?.role === 'admin'
              ? 'Manage your platform and track student progress.'
              : 'Track your progress and continue learning.'}
          </p>
        </div>

        {/* Stats Cards */}
        {(user?.role === USER_ROLES.FREE || user?.role === USER_ROLES.PREMIUM || user?.role === USER_ROLES.MENTOR || user?.role === USER_ROLES.ADMIN) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-3 bg-[#E5E7EB] rounded w-2/3 mb-3"></div>
                  <div className="h-6 bg-[#E5E7EB] rounded w-1/3"></div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full card border-[#DC2626]/20">
                <p className="text-sm text-[#DC2626]">{error}</p>
                <button onClick={fetchDashboardStats} className="text-sm text-[#2563EB] hover:underline mt-2">
                  Try again
                </button>
              </div>
            ) : (
              <>
                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#F0FDF4] rounded-md flex items-center justify-center">
                      <CheckCircle className="w-[18px] h-[18px] text-[#16A34A]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Courses Completed</p>
                      <p className="text-xl font-semibold text-[#111827]">{dashboardStats?.completed_courses || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#EFF6FF] rounded-md flex items-center justify-center">
                      <BookOpen className="w-[18px] h-[18px] text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Modules Completed</p>
                      <p className="text-xl font-semibold text-[#111827]">{dashboardStats?.completed_modules || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#EFF6FF] rounded-md flex items-center justify-center">
                      <ArrowRight className="w-[18px] h-[18px] text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Continue Learning</p>
                      <p className="text-sm font-medium text-[#111827]">
                        {dashboardStats?.last_viewed ? 'Resume Course' : 'Start Learning'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Upgrade banner for free users */}
        {user?.role === USER_ROLES.FREE && (
          <div className="card border-[#2563EB]/20 bg-[#EFF6FF] mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#111827] mb-1">Unlock Premium Features</h3>
                <p className="text-sm text-[#6B7280] mb-2">
                  Get unlimited quizzes, mock exams, AI tutoring, and mentor sessions.
                </p>
                <ul className="text-xs text-[#6B7280] space-y-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" /> Unlimited quiz generation
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" /> Mock certification exams
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" /> 1-on-1 mentor sessions
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="btn-primary flex items-center gap-2 shrink-0"
              >
                <Crown className="w-4 h-4" />
                Upgrade
              </button>
            </div>
          </div>
        )}

        {/* Continue Learning */}
        {(user?.role === USER_ROLES.FREE || user?.role === USER_ROLES.PREMIUM || user?.role === USER_ROLES.ADMIN) && !loading && !error && (
          <div className="card mb-6">
            <h3 className="text-base font-semibold text-[#111827] mb-4">Continue Learning</h3>
            {dashboardStats?.last_viewed ? (
              <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-md border border-[#E5E7EB]">
                <div>
                  <p className="text-sm font-medium text-[#111827]">{dashboardStats.last_viewed.course_title}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Last module: {dashboardStats.last_viewed.module_title}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {formatLastAccessed(dashboardStats.last_viewed.last_accessed)}
                  </p>
                </div>
                <button onClick={handleResumeLearning} className="btn-primary text-sm">
                  Resume
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-sm font-medium text-[#111827] mb-1">Start Your Learning Journey</p>
                <p className="text-xs text-[#6B7280] mb-4">Explore our courses and begin learning.</p>
                <button onClick={() => navigate('/courses')} className="btn-primary text-sm">
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-base font-semibold text-[#111827] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="card text-left hover:border-[#2563EB]/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F0FDF4] rounded-md flex items-center justify-center">
                  <BookOpen className="w-[18px] h-[18px] text-[#16A34A]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">View Courses</p>
                  <p className="text-xs text-[#6B7280]">Browse and enroll in courses</p>
                </div>
              </div>
            </button>

            {(user?.role === USER_ROLES.FREE || user?.role === USER_ROLES.PREMIUM) && (
              <button
                onClick={() => navigate('/profile')}
                className="card text-left hover:border-[#2563EB]/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#EFF6FF] rounded-md flex items-center justify-center">
                    <svg className="w-[18px] h-[18px] text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">My Profile</p>
                    <p className="text-xs text-[#6B7280]">Update your information</p>
                  </div>
                </div>
              </button>
            )}

            {user?.role === USER_ROLES.ADMIN && (
              <button
                onClick={() => navigate('/admin/users')}
                className="card text-left hover:border-[#2563EB]/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#FEF2F2] rounded-md flex items-center justify-center">
                    <svg className="w-[18px] h-[18px] text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Manage Users</p>
                    <p className="text-xs text-[#6B7280]">Admin user management</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;