import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ModuleCard from '../components/ModuleCard';
import TopBar from '../components/TopBar';
import api from '../services/api';
import { Plus, BookOpen } from 'lucide-react';

const CourseDetails = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedModules, setCompletedModules] = useState(new Set());

  useEffect(() => { if (courseId) fetchCourseData(); }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const requests = [api.get(`/courses/${courseId}`), api.get(`/courses/${courseId}/modules`)];
      if (user?.role === 'free' || user?.role === 'premium') requests.push(api.get('/progress/user'));
      const responses = await Promise.all(requests);
      const courseData = responses[0].data.data || responses[0].data;
      const modulesData = responses[1].data.data || responses[1].data || [];
      setCourse(courseData);
      setModules(modulesData);
      if ((user?.role === 'free' || user?.role === 'premium') && responses[2]) {
        const progressData = responses[2].data.data || responses[2].data || [];
        const moduleIds = new Set(modulesData.map(m => m.id));
        setCompletedModules(new Set(progressData.filter(p => p.status === 'completed' && moduleIds.has(p.module_id)).map(p => p.module_id)));
      } else {
        setCompletedModules(new Set());
      }
    } catch (err) {
      if (err.response?.status === 404) setError('Course not found.');
      else setError(err.response?.data?.message || 'Unable to load course details.');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleComplete = (moduleId) => {
    setCompletedModules(prev => {
      const newSet = new Set(prev);
      newSet.has(moduleId) ? newSet.delete(moduleId) : newSet.add(moduleId);
      return newSet;
    });
  };

  const progressPercentage = modules.length > 0 ? Math.round((completedModules.size / modules.length) * 100) : 0;

  if (loading) {
    return (
      <>
        <TopBar title="Course Details" />
        <div className="app-content flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563EB] border-t-transparent mx-auto mb-3"></div>
            <p className="text-sm text-[#6B7280]">Loading course...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopBar title="Course Details" />
        <div className="app-content flex items-center justify-center">
          <div className="text-center max-w-sm">
            <p className="text-sm text-[#DC2626] mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={fetchCourseData} className="btn-primary text-sm">Try Again</button>
              <button onClick={() => navigate('/courses')} className="btn-secondary text-sm">Back to Courses</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={course?.title || 'Course Details'} />
      <div className="app-content">
        {/* Course Header Card */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-[#111827] mb-2">{course?.title}</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
            {course?.description || 'No description available.'}
          </p>
          {course?.instructor && (
            <div className="flex items-center mb-4">
              <div className="w-7 h-7 bg-[#EFF6FF] rounded-md flex items-center justify-center text-[#2563EB] text-xs font-medium mr-2">
                {course.instructor.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF]">Instructor</p>
                <p className="text-sm font-medium text-[#111827]">{course.instructor}</p>
              </div>
            </div>
          )}

          {/* Progress */}
          {(user?.role === 'free' || user?.role === 'premium') ? (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-[#111827]">Progress</span>
                <span className="text-sm text-[#6B7280]">{completedModules.size}/{modules.length} modules · {progressPercentage}%</span>
              </div>
              <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                <div className="bg-[#2563EB] h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#EFF6FF] border border-[#2563EB]/10 rounded-md">
              <p className="text-xs text-[#2563EB]">
                Viewing as {user?.role === 'admin' ? 'administrator' : user?.role}. Progress tracking is for students only.
              </p>
            </div>
          )}
        </div>

        {/* Modules */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#111827]">Modules ({modules.length})</h3>
          {user?.role === 'admin' && (
            <button onClick={() => navigate(`/courses/${courseId}/modules/create`)} className="btn-primary text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Module
            </button>
          )}
        </div>

        {modules.length === 0 ? (
          <div className="card text-center py-8">
            <BookOpen className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#111827] mb-1">No modules yet</p>
            <p className="text-xs text-[#6B7280] mb-3">Modules will appear here once added.</p>
            <button onClick={fetchCourseData} className="btn-secondary text-sm">Refresh</button>
          </div>
        ) : (
          <div className="space-y-3">
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
    </>
  );
};

export default CourseDetails;