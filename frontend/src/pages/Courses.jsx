import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from '../components/CourseCard';
import TopBar from '../components/TopBar';
import api from '../services/api';
import { Search, X, Plus, BookOpen } from 'lucide-react';

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
  const searchTimeoutRef = useRef(null);

  useEffect(() => { fetchCoursesAndProgress(); }, []);

  const fetchCoursesAndProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const coursesResponse = await api.get('/courses');
      const coursesData = coursesResponse.data.data || coursesResponse.data || [];
      setCourses(coursesData);

      if (user?.role === 'free' || user?.role === 'premium') {
        const progressResponse = await api.get('/progress/user');
        const progressData = progressResponse.data.data || progressResponse.data || [];
        const coursesWithProgressData = await Promise.all(
          coursesData.map(async (course) => {
            try {
              const modulesResponse = await api.get(`/courses/${course.id}/modules`);
              const modules = modulesResponse.data.data || modulesResponse.data || [];
              const moduleIds = new Set(modules.map(m => m.id));
              const completedModules = progressData.filter(p => p.status === 'completed' && moduleIds.has(p.module_id));
              return {
                ...course,
                progressPercentage: modules.length > 0 ? Math.round((completedModules.length / modules.length) * 100) : 0,
                totalModules: modules.length,
                completedModules: completedModules.length
              };
            } catch {
              return { ...course, progressPercentage: 0, totalModules: 0, completedModules: 0 };
            }
          })
        );
        setCoursesWithProgress(coursesWithProgressData);
      } else {
        setCoursesWithProgress(coursesData.map(c => ({ ...c, progressPercentage: 0, totalModules: 0, completedModules: 0 })));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const searchCourses = async (keyword) => {
    if (!keyword?.trim()) { clearSearch(); return; }
    try {
      setIsSearching(true);
      setSearchError(null);
      const response = await api.get(`/courses/search?keyword=${encodeURIComponent(keyword.trim())}&limit=20`);
      const searchData = response.data.data || response.data || [];

      if (user?.role === 'free' || user?.role === 'premium') {
        const progressResponse = await api.get('/progress/user');
        const progressData = progressResponse.data.data || progressResponse.data || [];
        const results = await Promise.all(
          searchData.map(async (course) => {
            try {
              const modulesResponse = await api.get(`/courses/${course.id}/modules`);
              const modules = modulesResponse.data.data || modulesResponse.data || [];
              const moduleIds = new Set(modules.map(m => m.id));
              const completedModules = progressData.filter(p => p.status === 'completed' && moduleIds.has(p.module_id));
              return {
                ...course,
                progressPercentage: modules.length > 0 ? Math.round((completedModules.length / modules.length) * 100) : 0,
                totalModules: modules.length,
                completedModules: completedModules.length
              };
            } catch {
              return { ...course, progressPercentage: 0, totalModules: 0, completedModules: 0 };
            }
          })
        );
        setSearchResults(results);
      } else {
        setSearchResults(searchData.map(c => ({ ...c, progressPercentage: 0, totalModules: 0, completedModules: 0 })));
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Search failed.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => { setSearchKeyword(''); setSearchResults([]); setIsSearching(false); setSearchError(null); };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchCourses(value), 500);
  };

  return (
    <>
      <TopBar title="Courses" />
      <div className="app-content">
        {/* Header area */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[20px] font-semibold text-[#111827]">Available Courses</h2>
            <p className="text-sm text-[#6B7280]">Browse and explore our course catalog.</p>
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin/courses/create')} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Create Course
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchKeyword}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && searchCourses(searchKeyword)}
              placeholder="Search courses..."
              className="input pl-9 pr-9"
            />
            {searchKeyword && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchKeyword && !isSearching && (
            <p className="mt-2 text-xs text-[#6B7280]">
              {searchError ? <span className="text-[#DC2626]">{searchError}</span> :
                searchResults.length > 0 ? `${searchResults.length} result${searchResults.length > 1 ? 's' : ''} for "${searchKeyword}"` :
                  `No courses found for "${searchKeyword}"`}
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-[#E5E7EB] rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-[#E5E7EB] rounded w-full mb-2"></div>
                <div className="h-3 bg-[#E5E7EB] rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-[#E5E7EB] rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card border-[#DC2626]/20 text-center py-8">
            <p className="text-sm text-[#DC2626] mb-3">{error}</p>
            <button onClick={fetchCoursesAndProgress} className="btn-primary text-sm">Try Again</button>
          </div>
        ) : (() => {
          const displayCourses = searchKeyword ? searchResults : coursesWithProgress;
          if (displayCourses.length === 0) {
            return (
              <div className="text-center py-12">
                <BookOpen className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-sm font-medium text-[#111827] mb-1">
                  {searchKeyword ? `No results for "${searchKeyword}"` : 'No courses available'}
                </p>
                <p className="text-xs text-[#6B7280] mb-4">
                  {searchKeyword ? 'Try different keywords.' : 'Check back later.'}
                </p>
                {searchKeyword && (
                  <button onClick={clearSearch} className="btn-secondary text-sm mr-2">Show All</button>
                )}
                <button onClick={fetchCoursesAndProgress} className="btn-primary text-sm">Refresh</button>
              </div>
            );
          }
          return (
            <>
              {searchKeyword && (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-[#111827]">Results for "{searchKeyword}"</h3>
                  <button onClick={clearSearch} className="text-xs text-[#2563EB] hover:underline">Show all</button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </>
          );
        })()}
      </div>
    </>
  );
};

export default Courses;