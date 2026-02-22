import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Dynamic loader hook that adapts to actual API response times
 * Provides intelligent progress estimation based on historical data
 */
export const useDynamicLoader = (taskType = 'default', duration = null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [actualDuration, setActualDuration] = useState(0);
  
  const startTimeRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Historical data storage key with duration awareness
  const storageKey = `loader_history_${taskType}${duration ? `_${duration}d` : ''}`;
  
  // Helper function to get study plan estimate based on duration
  const getStudyPlanEstimate = useCallback((planDuration) => {
    if (!planDuration) return 10000;
    
    const safeDuration = Math.max(1, Number(planDuration) || 7);
    if (safeDuration <= 7) {
      return 8000;  // 8 seconds for 7-day plans (free tier)
    } else if (safeDuration <= 30) {
      return 12000; // 12 seconds for 30-day plans
    } else if (safeDuration <= 60) {
      return 15000; // 15 seconds for 60-day plans
    } else {
      return 18000; // 18 seconds for 90-day plans
    }
  }, []);

  // Get historical average response time for this task type
  const getHistoricalAverage = useCallback(() => {
    try {
      const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (history.length === 0) {
        // Default estimates based on task type and duration
        const defaults = {
          'quiz_generation': 8000,      // 8 seconds
          'mock_exam_generation': 12000, // 12 seconds
          'study_plan_generation': getStudyPlanEstimate(duration),
          'default': 10000
        };
        return defaults[taskType] || defaults.default;
      }
      
      // Use weighted average (recent entries have more weight)
      const weights = history.map((_, index) => Math.pow(1.1, index));
      const weightedSum = history.reduce((sum, time, index) => sum + (time * weights[index]), 0);
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      
      return Math.round(weightedSum / totalWeight);
    } catch (error) {
      console.warn('Error reading loader history:', error);
      return 10000; // 10 second fallback
    }
  }, [taskType, storageKey, duration, getStudyPlanEstimate]);

  // Store actual response time for future predictions
  const storeResponseTime = useCallback((duration) => {
    try {
      const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
      // Keep only last 10 entries to prevent unlimited growth
      const updatedHistory = [duration, ...history.slice(0, 9)];
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
    } catch (error) {
      console.warn('Error storing loader history:', error);
    }
  }, [storageKey]);

  // Improved progress calculation that provides smoother progression
  const calculateProgress = useCallback((elapsed, estimated) => {
    // Use a more conservative approach that doesn't claim completion
    const normalizedTime = Math.min(elapsed / estimated, 1);
    
    // Smoother logarithmic progress that provides better user experience
    if (normalizedTime < 0.6) {
      // Steady progress up to 60% (corresponds to ~60% completion)
      return normalizedTime * 100; // Direct mapping for first 60%
    } else if (normalizedTime < 0.9) {
      // Gradual slowdown from 60% to 85%
      const progressRange = normalizedTime - 0.6; // 0 to 0.3
      return 60 + (progressRange * 83.33); // 60% to 85%
    } else {
      // Very slow progress from 85% to 92%, never reaching 100%
      const finalRange = normalizedTime - 0.9; // 0 to 0.1
      return 85 + (finalRange * 70); // 85% to 92% max
    }
  }, []);

  // Start loading with simple progress indication
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setProgress(0);
    setCurrentStep(0);
    startTimeRef.current = Date.now();
    
    const estimatedDuration = getHistoricalAverage();

    // Clear any existing intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Simple progress updates without misleading timers
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = calculateProgress(elapsed, estimatedDuration);
      
      setProgress(newProgress);
      setActualDuration(elapsed);
      
      // Update current step based on progress (supports up to 5 steps)
      if (newProgress < 20) {
        setCurrentStep(0);
      } else if (newProgress < 40) {
        setCurrentStep(1);
      } else if (newProgress < 60) {
        setCurrentStep(2);
      } else if (newProgress < 80) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
    }, 300); // Update every 300ms for smooth progress

  }, [getHistoricalAverage, calculateProgress]);

  // Complete loading and store actual duration
  const completeLoading = useCallback(() => {
    if (startTimeRef.current) {
      const totalDuration = Date.now() - startTimeRef.current;
      setActualDuration(totalDuration);
      storeResponseTime(totalDuration);
      
      // Show completion state briefly
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setCurrentStep(0);
        setActualDuration(0);
      }, 500);
    }

    // Clear intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, [storeResponseTime]);

  // Cancel loading
  const cancelLoading = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
    setCurrentStep(0);
    setActualDuration(0);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    progress: Math.round(progress),
    currentStep,
    actualDuration,
    startLoading,
    completeLoading,
    cancelLoading
  };
};

export default useDynamicLoader;
