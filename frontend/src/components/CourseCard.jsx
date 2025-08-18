import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CourseCard = ({ title, description, instructor, id, progressPercentage = 0, totalModules = 0, completedModules = 0 }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleViewDetails = () => {
    navigate(`/courses/${id}`);
  };

  // Truncate description to ~100 characters
  const truncatedDescription = description && description.length > 100 
    ? description.substring(0, 100) + '...' 
    : description;

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden border border-gray-100 h-full flex flex-col">
      {/* Card Header with Gradient */}
      <div className="h-1.5 sm:h-2 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
      
      {/* Card Content */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        {/* Course Title */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 flex-shrink-0">
          {title}
        </h3>
        
        {/* Course Description */}
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed flex-1">
          {truncatedDescription || 'No description available.'}
        </p>
        
        {/* Instructor */}
        <div className="flex items-center mb-3 sm:mb-4 flex-shrink-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold mr-2 sm:mr-3">
            {instructor ? instructor.charAt(0).toUpperCase() : 'I'}
          </div>
          <span className="text-gray-700 text-xs sm:text-sm font-medium truncate">
            {instructor || 'Instructor'}
          </span>
        </div>
        
        {/* Progress Bar - Only for students */}
        {user?.role === 'user' && (
          <div className="mb-3 sm:mb-4 flex-shrink-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs text-gray-500 font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            {totalModules > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                {completedModules} of {totalModules} modules completed
              </div>
            )}
          </div>
        )}
        
        {/* View Details Button */}
        <button
          onClick={handleViewDetails}
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium sm:font-semibold py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base rounded-md sm:rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex-shrink-0"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default CourseCard;