import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ModuleCard = ({ title, content_link, id, isCompleted: initialCompleted, onComplete }) => {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Only free and premium users can complete modules
   const canComplete = user?.role === 'free' || user?.role === 'premium';

  const handleMarkComplete = async () => {
    if (isCompleted || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Call backend to mark module as completed
      await api.post(`/progress/modules/${id}/complete`);
      
      // Update local state
      setIsCompleted(true);
      
      // Notify parent component
      if (onComplete) {
        onComplete(id);
      }
    } catch (err) {
      console.error('Error marking module as complete:', err);
      
      // Provide specific error messages based on status code
      if (err.response?.status === 401) {
        setError('Your session has expired. Please sign in again to mark modules as complete.');
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to complete this module.');
      } else if (err.response?.status === 404) {
        setError('This module could not be found.');
      } else if (err.response?.status >= 500) {
        setError('Our servers are experiencing issues. Please try again in a few minutes.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network and try again.');
      } else {
        setError(
          err.response?.data?.message || 
          err.message || 
          'Unable to mark module as complete right now. Please try again later.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnmarkComplete = async () => {
    if (!isCompleted || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Call backend to unmark module as completed
      await api.post(`/progress/modules/${id}/uncomplete`);
      
      // Update local state
      setIsCompleted(false);
      
      // Notify parent component
      if (onComplete) {
        onComplete(id);
      }
    } catch (err) {
      console.error('Error unmarking module as complete:', err);
      
      // Provide specific error messages based on status code
      if (err.response?.status === 401) {
        setError('Your session has expired. Please sign in again to update module status.');
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to update this module.');
      } else if (err.response?.status === 404) {
        setError('This module could not be found.');
      } else if (err.response?.status >= 500) {
        setError('Our servers are experiencing issues. Please try again in a few minutes.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network and try again.');
      } else {
        setError(
          err.response?.data?.message || 
          err.message || 
          'Unable to update module status right now. Please try again later.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (isCompleted) {
      handleUnmarkComplete();
    } else {
      handleMarkComplete();
    }
  };

  return (
    <div className={`bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out border border-gray-100 ${
      isCompleted 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 transform scale-[1.02]' 
        : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 hover:border-indigo-200'
    }`}>
      <div className="p-4 sm:p-6">
        {/* Module Header */}
        <div className="mb-3 sm:mb-4">
          <div className="flex-1">
            <h3 className={`text-base sm:text-lg font-semibold ${
              isCompleted ? 'text-green-800' : 'text-gray-900'
            }`}>
              {title}
            </h3>
            {content_link && (
              <div className="mt-2">
                <a
                  href={content_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Content
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <span className="text-red-700 text-xs sm:text-sm leading-relaxed">{error}</span>
                <button
                  onClick={handleRetry}
                  className="block mt-1 text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Completion Checkbox */}
        <div className="flex justify-end">
          {canComplete ? (
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={isCompleted ? handleUnmarkComplete : handleMarkComplete}
                  disabled={isLoading}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ease-in-out ${
                  isLoading
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    : isCompleted
                      ? 'border-green-500 bg-green-500 group-hover:border-green-600 group-hover:bg-green-600'
                      : 'border-gray-300 bg-white group-hover:border-indigo-500'
                }`}>
                  {isCompleted && (
                     <svg className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
                   )}
                  {isLoading && (
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                       <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"></div>
                     </div>
                   )}
                </div>
              </div>
              <span className={`ml-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                isLoading
                  ? 'text-gray-400'
                  : isCompleted
                    ? 'text-green-600 group-hover:text-green-700'
                    : 'text-gray-600 group-hover:text-indigo-600'
              }`}>
                {isLoading ? 'Updating...' : 'Mark as Completed'}
              </span>
            </label>
          ) : (
            <div className="flex items-center">
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                {isCompleted ? 'Completed' : 'View Only'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;