import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Dynamic loader hook that adapts to actual API response times
 * Provides intelligent progress estimation based on historical data
 */
export const useDynamicLoader = (taskType = 'default') => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [actualDuration, setActualDuration] = useState(0);
  
  const startTimeRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Historical data storage key
  const storageKey = `loader_history_${taskType}`;
  
  // Get historical average response time for this task type
  const getHistoricalAverage = useCallback(() => {
    try {
      const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (history.length === 0) {
        // Default estimates based on task type
        const defaults = {
          'quiz_generation': 8000,      // 8 seconds
          'mock_exam_generation': 12000, // 12 seconds
          'study_plan_generation': 15000, // 15 seconds
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
  }, [taskType, storageKey]);

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

  // Simple progress calculation that stays reasonable until completion
  const calculateProgress = useCallback((elapsed, estimated) => {
    // Use a more conservative approach that doesn't claim completion
    const normalizedTime = Math.min(elapsed / estimated, 1);
    
    // Logarithmic progress that slows down but never reaches 100% until actual completion
    if (normalizedTime < 0.8) {
      // Normal progress up to 80%
      return normalizedTime * 80;
    } else {
      // Very slow progress from 80% to 90%, never reaching 100%
      return 80 + (normalizedTime - 0.8) * 50; // Max 90%
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
      
      // Update current step based on progress
      if (newProgress < 25) {
        setCurrentStep(0);
      } else if (newProgress < 50) {
        setCurrentStep(1);
      } else if (newProgress < 75) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
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
