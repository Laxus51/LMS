import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from '../components/CourseCard';
import Header from '../components/Header';
import api from '../services/api';

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [coursesWithProgress, setCoursesWithProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    fetchCoursesAndProgress();
  }, []);

  const fetchCoursesAndProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch courses
      const coursesResponse = await api.get('/courses');
      const coursesData = coursesResponse.data.data || coursesResponse.data || [];
      setCourses(coursesData);
      
      // Only fetch progress for students, not admins
      if (user?.role === 'user') {
        // Fetch user progress for students
        const progressResponse = await api.get('/progress/user');
        const progressData = progressResponse.data.data || progressResponse.data || [];
        
        // Calculate progress for each course
        const coursesWithProgressData = await Promise.all(
          coursesData.map(async (course) => {
            try {
              // Fetch modules for this course
              const modulesResponse = await api.get(`/courses/${course.id}/modules`);
              const modules = modulesResponse.data.data || modulesResponse.data || [];
              
              // Calculate completed modules for this course
              const moduleIds = new Set(modules.map(module => module.id));
              const completedModules = progressData.filter(
                progress => progress.status === 'completed' && moduleIds.has(progress.module_id)
              );
              
              const progressPercentage = modules.length > 0 
                ? Math.round((completedModules.length / modules.length) * 100)
                : 0;
              
              return {
                ...course,
                progressPercentage,
                totalModules: modules.length,
                completedModules: completedModules.length
              };
            } catch (moduleErr) {
              console.error(`Error fetching modules for course ${course.id}:`, moduleErr);
              return {
                ...course,
                progressPercentage: 0,
                totalModules: 0,
                completedModules: 0
              };
            }
          })
        );
        
        setCoursesWithProgress(coursesWithProgressData);
      } else {
        // For admins, just show courses without progress data
        const coursesWithoutProgress = coursesData.map(course => ({
          ...course,
          progressPercentage: 0,
          totalModules: 0,
          completedModules: 0
        }));
        
        setCoursesWithProgress(coursesWithoutProgress);
      }
    } catch (err) {
      console.error('Error fetching courses and progress:', err);
      
      // Provide specific error messages based on status code
      if (err.response?.status === 401) {
        setError('Your session has expired. Please sign in again to view courses.');
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to access courses.');
      } else if (err.response?.status >= 500) {
        setError('Our servers are experiencing issues. Please try again in a few minutes.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network and try again.');
      } else {
        setError(
          err.response?.data?.message || 
          err.message || 
          'Unable to load courses right now. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchCoursesAndProgress();
  };

  const searchCourses = async (keyword) => {
    if (!keyword || !keyword.trim()) {
      clearSearch();
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      
      const response = await api.get(`/courses/search?keyword=${encodeURIComponent(keyword.trim())}&limit=20`);
      const searchData = response.data.data || response.data || [];
      
      // For search results, we need to calculate progress for students
      if (user?.role === 'user') {
        // Fetch user progress for students
        const progressResponse = await api.get('/progress/user');
        const progressData = progressResponse.data.data || progressResponse.data || [];
        
        // Calculate progress for each search result
        const searchResultsWithProgress = await Promise.all(
          searchData.map(async (course) => {
            try {
              // Fetch modules for this course
              const modulesResponse = await api.get(`/courses/${course.id}/modules`);
              const modules = modulesResponse.data.data || modulesResponse.data || [];
              
              // Calculate completed modules for this course
              const moduleIds = new Set(modules.map(module => module.id));
              const completedModules = progressData.filter(
                progress => progress.status === 'completed' && moduleIds.has(progress.module_id)
              );
              
              const progressPercentage = modules.length > 0 
                ? Math.round((completedModules.length / modules.length) * 100)
                : 0;
              
              return {
                ...course,
                progressPercentage,
                totalModules: modules.length,
                completedModules: completedModules.length
              };
            } catch (moduleErr) {
              console.error(`Error fetching modules for course ${course.id}:`, moduleErr);
              return {
                ...course,
                progressPercentage: 0,
                totalModules: 0,
                completedModules: 0
              };
            }
          })
        );
        
        setSearchResults(searchResultsWithProgress);
      } else {
        // For admins, just show search results without progress data
        const searchResultsWithoutProgress = searchData.map(course => ({
          ...course,
          progressPercentage: 0,
          totalModules: 0,
          completedModules: 0
        }));
        
        setSearchResults(searchResultsWithoutProgress);
      }
    } catch (err) {
      console.error('Error searching courses:', err);
      
      // Provide specific error messages based on status code
      if (err.response?.status === 401) {
        setSearchError('Your session has expired. Please sign in again to search courses.');
      } else if (err.response?.status >= 500) {
        setSearchError('Our servers are experiencing issues. Please try searching again in a few minutes.');
      } else if (!navigator.onLine) {
        setSearchError('No internet connection. Please check your network and try again.');
      } else {
        setSearchError(
          err.response?.data?.message || 
          err.message || 
          'Unable to search courses right now. Please try again later.'
        );
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(null);
  };

  const searchTimeoutRef = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    
    // Debounce search - search after user stops typing for 500ms
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchCourses(value);
    }, 500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchCourses(searchKeyword);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          {/* Loading Spinner */}
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <Header title="Available Courses" showBackButton={true} backTo="/dashboard" />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Explore our comprehensive collection of courses designed to help you learn and grow.
          </p>
          
          {/* Search Section */}
          <div className="max-w-md mx-auto px-4 sm:px-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  placeholder="Search courses..."
                  className="block w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </form>
            
            {/* Search Status */}
            {searchKeyword && !isSearching && (
              <div className="mt-3 text-sm text-gray-600 text-center">
                {searchError ? (
                  <span className="text-red-600">{searchError}</span>
                ) : (
                  <span>
                    {searchResults.length > 0 
                      ? `Found ${searchResults.length} course${searchResults.length === 1 ? '' : 's'} for "${searchKeyword}"`
                      : `No courses found for "${searchKeyword}"`
                    }
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Create Course Button */}
          {user?.role === 'admin' && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => navigate('/admin/courses/create')}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                title="Create New Course"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {(() => {
          // Determine which courses to display
          const displayCourses = searchKeyword ? searchResults : coursesWithProgress;
          const isEmptyState = displayCourses.length === 0;
          
          if (isEmptyState) {
            return (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {searchKeyword ? `No courses found for "${searchKeyword}"` : 'No courses available yet.'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchKeyword 
                      ? 'Try searching with different keywords or browse all courses.' 
                      : 'Check back later for new courses or contact your administrator.'
                    }
                  </p>
                  <div className="space-x-4">
                    {searchKeyword && (
                      <button
                        onClick={clearSearch}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Show All Courses
                      </button>
                    )}
                    <button
                      onClick={handleRetry}
                      className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              );
          }
          
          return (
            <div>
              {/* Results Header */}
              {searchKeyword && (
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Search Results for "{searchKeyword}"
                  </h2>
                  <button
                    onClick={clearSearch}
                    className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                  >
                    Show All Courses
                  </button>
                </div>
              )}
              
              {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 px-4 sm:px-0">
                {displayCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    instructor={course.instructor_name || course.instructor}
                    progressPercentage={course.progressPercentage}
                    totalModules={course.totalModules}
                    completedModules={course.completedModules}
                  />
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Courses;