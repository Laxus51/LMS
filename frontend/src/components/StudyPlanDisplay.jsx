import React, { useState, useEffect } from 'react';
import { studyPlanProgressApi } from '../services/studyPlanProgressApi';

const StudyPlanDisplay = ({ plan, isPreview, onBack, onGenerate }) => {
  const [activeDay, setActiveDay] = useState(1);
  const [completedDays, setCompletedDays] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [progressError, setProgressError] = useState(null);

  // Load existing progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      if (isPreview || !plan?.id) return;
      
      try {
        setIsLoading(true);
        setProgressError(null);
        const response = await studyPlanProgressApi.getProgressSummary(plan.id);
        const completedDayNumbers = response.data.completed_day_numbers || [];
        setCompletedDays(new Set(completedDayNumbers));
      } catch (error) {
        console.error('Failed to load progress:', error);
        setProgressError('Failed to load progress data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [plan?.id, isPreview]);

  const toggleDayCompletion = async (dayNumber) => {
    if (isPreview || isLoading) return; // Don't allow completion toggle in preview mode or while loading
    
    try {
      setIsLoading(true);
      setProgressError(null);
      
      // Call API to toggle completion
      await studyPlanProgressApi.toggleDayCompletion(plan.id, dayNumber);
      
      // Update local state
      const newCompletedDays = new Set(completedDays);
      if (completedDays.has(dayNumber)) {
        newCompletedDays.delete(dayNumber);
      } else {
        newCompletedDays.add(dayNumber);
      }
      setCompletedDays(newCompletedDays);
      
    } catch (error) {
      console.error('Failed to update progress:', error);
      setProgressError('Failed to update progress. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!plan?.plan_content?.daily_plan?.length) {
      return 0;
    }
    return Math.round((completedDays.size / plan.plan_content.daily_plan.length) * 100);
  };

  const formatTime = (hours) => {
    if (!hours || isNaN(hours)) {
      return '0h';
    }
    if (hours >= 1) {
      return `${hours}h`;
    } else {
      return `${Math.round(hours * 60)}min`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack} 
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Back to Generator
            </button>
            <div className="text-center flex-1 mx-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{plan.certification_name}</h1>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{plan.duration_days} days</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">{formatTime(plan.daily_hours)} per day</span>
                {isPreview && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">Preview</span>}
              </div>
            </div>
            {isPreview && (
              <button 
                onClick={onGenerate} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate & Save This Plan
              </button>
            )}
          </div>
          
          {!isPreview && (
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress: {completedDays.size}/{plan.plan_content.daily_plan.length} days</span>
                <span className="text-sm font-medium text-gray-900">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              {progressError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{progressError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar with day navigation */}
          <div className="w-80 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Schedule</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {plan.plan_content.daily_plan.map((day, index) => {
                const dayNumber = index + 1;
                const isCompleted = completedDays.has(dayNumber);
                const isActive = activeDay === dayNumber;
                
                return (
                  <div
                    key={dayNumber}
                    className={`p-3 m-1 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive ? 'bg-blue-100 border-2 border-blue-500' : isCompleted ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    onClick={() => setActiveDay(dayNumber)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">Day {dayNumber}</div>
                      <div className="text-sm text-gray-600 truncate">{day.topic}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            {plan.plan_content.daily_plan[activeDay - 1] && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Day {activeDay}: {plan.plan_content.daily_plan[activeDay - 1].topic}
                  </h2>
                  <div className="flex items-center text-blue-600">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      📚 {formatTime(plan.plan_content.daily_plan[activeDay - 1].hours)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
                    {!isPreview && (
                      <button
                        onClick={() => toggleDayCompletion(activeDay)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          completedDays.has(activeDay)
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isLoading ? 'Updating...' : completedDays.has(activeDay) ? 'Mark as Incomplete' : 'Mark as Completed'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {plan.plan_content.daily_plan[activeDay - 1].activities.map((activity, index) => {
                      // Handle both old format (string) and new format (object with task and time_minutes)
                      const activityText = typeof activity === 'string' ? activity : activity.task;
                      const timeMinutes = typeof activity === 'object' && activity.time_minutes ? activity.time_minutes : null;
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium">{activityText}</p>
                              </div>
                            </div>
                            {timeMinutes && (
                              <div className="flex-shrink-0 ml-4">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {timeMinutes >= 60 ? 
                                    (timeMinutes % 60 === 0 ? 
                                      `${Math.floor(timeMinutes / 60)}h` : 
                                      `${Math.floor(timeMinutes / 60)}h ${timeMinutes % 60}min`
                                    ) : 
                                    `${timeMinutes}min`
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resources Section */}
                {plan.plan_content.daily_plan[activeDay - 1].resources && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                    <div className="space-y-2">
                      {plan.plan_content.daily_plan[activeDay - 1].resources.map((resource, index) => (
                        <div key={index} className="flex items-center space-x-2 text-gray-600">
                          <span className="text-green-500">📖</span>
                          <span>{resource}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}




              </div>
            )}
          </div>
        </div>

        {/* Exam info section */}
        {plan.plan_content.exam_info && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Exam Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Duration</h3>
                <p className="text-blue-700">{plan.plan_content.exam_info.duration || 'Not available'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Questions</h3>
                <p className="text-green-700">{plan.plan_content.exam_info.questions || 'Not available'}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Passing Score</h3>
                <p className="text-purple-700">{plan.plan_content.exam_info.passing_score || 'Not available'}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">Cost</h3>
                <p className="text-orange-700">{plan.plan_content.exam_info.cost || 'Not available'}</p>
              </div>
            </div>
            
            {plan.plan_content.exam_info.registration_url && (
              <div className="text-center">
                <a 
                  href={plan.plan_content.exam_info.registration_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Register for Exam
                </a>
              </div>
            )}
          </div>
        )}

        {/* General tips */}
        {plan.plan_content.tips && plan.plan_content.tips.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">General Study Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.plan_content.tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg">
                  <span className="text-yellow-600 text-lg">💡</span>
                  <span className="text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanDisplay;