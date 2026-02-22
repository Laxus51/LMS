import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CourseCard = ({ title, description, instructor, id, progressPercentage = 0, totalModules = 0, completedModules = 0 }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const truncatedDescription = description && description.length > 100
    ? description.substring(0, 100) + '...'
    : description;

  return (
    <div
      onClick={() => navigate(`/courses/${id}`)}
      className="card hover:border-[#2563EB]/30 transition-colors cursor-pointer flex flex-col h-full"
    >
      <h3 className="text-sm font-semibold text-[#111827] mb-1.5 line-clamp-2">
        {title}
      </h3>

      <p className="text-xs text-[#6B7280] mb-3 leading-relaxed flex-1">
        {truncatedDescription || 'No description available.'}
      </p>

      {/* Instructor */}
      <div className="flex items-center mb-3">
        <div className="w-6 h-6 bg-[#EFF6FF] rounded-md flex items-center justify-center text-[#2563EB] text-xs font-medium mr-2">
          {instructor ? instructor.charAt(0).toUpperCase() : 'I'}
        </div>
        <span className="text-xs text-[#6B7280] truncate">
          {instructor || 'Instructor'}
        </span>
      </div>

      {/* Progress */}
      {(user?.role === 'free' || user?.role === 'premium') && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#9CA3AF]">Progress</span>
            <span className="text-xs text-[#6B7280] font-medium">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-[#E5E7EB] rounded-full h-1.5">
            <div
              className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {totalModules > 0 && (
            <p className="text-xs text-[#9CA3AF] mt-1">
              {completedModules}/{totalModules} modules
            </p>
          )}
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); navigate(`/courses/${id}`); }}
        className="btn-primary w-full text-sm"
      >
        View Details
      </button>
    </div>
  );
};

export default CourseCard;