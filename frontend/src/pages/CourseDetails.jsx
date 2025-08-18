import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ModuleCard from '../components/ModuleCard';
import Header from '../components/Header';
import api from '../services/api';

const CourseDetails = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedModules, setCompletedModules] = useState(new Set());

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch course details and modules
      const requests = [
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/modules`)
      ];
      
      // Only fetch progress for non-admin users
      if (user?.role !== 'admin') {
        requests.push(api.get('/progress/user'));
      }
      
      const responses = await Promise.all(requests);
      const courseResponse = responses[0];
      const modulesResponse = responses[1];
      const progressResponse = responses[2]; // Will be undefined for admin users
      
      const courseData = courseResponse.data.data || courseResponse.data;
      const modulesData = modulesResponse.data.data || modulesResponse.data || [];
      
      setCourse(courseData);
      setModules(modulesData);
      
      // Initialize completed modules set based on user progress
      // Only for non-admin users
      if (user?.role !== 'admin' && progressResponse) {
        const progressData = progressResponse.data.data || progressResponse.data || [];
        const moduleIds = new Set(modulesData.map(module => module.id));
        const completed = new Set(
          progressData
            .filter(progress => progress.status === 'completed' && moduleIds.has(progress.module_id))
            .map(progress => progress.module_id)
        );
        setCompletedModules(completed);
      } else {
        // Admin users should not see any modules as completed
        setCompletedModules(new Set());
      }
      
    } catch (err) {
      console.error('Error fetching course data:', err);
      
      // Provide specific error messages based on status code
      if (err.response?.status === 401) {
        setError('Your session has expired. Please sign in again to view course details.');
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to access this course.');
      } else if (err.response?.status === 404) {
        setError('This course could not be found. It may have been removed or you may not have access to it.');
      } else if (err.response?.status >= 500) {
        setError('Our servers are experiencing issues. Please try again in a few minutes.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network and try again.');
      } else {
        setError(
          err.response?.data?.message || 
          err.message || 
          'Unable to load course details right now. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModuleComplete = (moduleId) => {
    setCompletedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleRetry = () => {
    fetchCourseData();
  };

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  // Calculate progress percentage
  const progressPercentage = modules.length > 0 
    ? Math.round((completedModules.size / modules.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToCourses}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <Header title={course?.title || 'Course Details'} showBackButton={true} backTo="/courses" />
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">

        {/* Course Header */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 mb-4 sm:mb-6 md:mb-8 overflow-hidden">
          {/* Course Header Gradient */}
          <div className="h-1.5 sm:h-2 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {course?.title || 'Course Title'}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-0">
                  {course?.description || 'No description available for this course.'}
                </p>
                {course?.instructor && (
                  <div className="flex items-center mt-3 sm:mt-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {course.instructor.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Instructor</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{course.instructor}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress Bar - Only for students */}
            {user?.role === 'user' ? (
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-1 sm:space-y-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Course Progress</h3>
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    {completedModules.size} of {modules.length} modules completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-end items-center mt-1">
                  <span className="text-xs sm:text-sm font-medium text-indigo-600">{progressPercentage}%</span>
                </div>
              </div>
            ) : (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start sm:items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 mt-0.5 sm:mt-0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-blue-800">Administrator View</h3>
                    <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">You are viewing this course as an administrator. Progress tracking is available for students only.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modules Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Course Modules</h2>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate(`/courses/${courseId}/modules/create`)}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium sm:font-semibold py-2 px-3 sm:px-4 text-sm sm:text-base rounded-md sm:rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center sm:justify-start"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Module
              </button>
            )}
          </div>
          
          {modules.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8 lg:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                This course has no modules yet.
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Modules will appear here once they are added to the course.
              </p>
              <button
                onClick={handleRetry}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium sm:font-semibold py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-md sm:rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Refresh
              </button>
            </div>
          ) : (
            // Modules List
            <div className="space-y-3 md:space-y-4">
              {modules.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  id={module.id}
                  title={module.title || `Module ${index + 1}`}
                  content_link={module.content_link}
                  isCompleted={completedModules.has(module.id)}
                  onComplete={handleModuleComplete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;