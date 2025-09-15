import React, { useState, useEffect } from 'react';
import useDynamicLoader from '../hooks/useDynamicLoader';

const StudyPlanLoadingExperience = ({ certification, duration, dailyHours, onCancel, isComplete = false }) => {
  const [currentTip, setCurrentTip] = useState(0);
  
  // Use dynamic loader hook
  const {
    progress,
    currentStep: dynamicStep,
    startLoading,
    completeLoading
  } = useDynamicLoader('study_plan_generation');

  // Dynamic steps based on plan duration
  const getStepsForDuration = (planDuration) => {
    const safeDuration = Math.max(1, Number(planDuration) || 7);
    
    if (safeDuration <= 7) {
      return [
        {
          title: "Analyzing Certification Requirements",
          description: "Reviewing exam objectives and skill areas",
          icon: "🔍",
          duration: 800
        },
        {
          title: "Customizing Learning Path",
          description: "Tailoring content to your 7-day schedule",
          icon: "🎯",
          duration: 1000
        },
        {
          title: "Generating Daily Activities",
          description: "Creating focused study tasks for each day",
          icon: "📚",
          duration: 1200
        },
        {
          title: "Optimizing Study Schedule",
          description: "Balancing intensive learning sessions",
          icon: "⚡",
          duration: 800
        },
        {
          title: "Adding Resources & Tips",
          description: "Including essential materials and quick tips",
          icon: "💡",
          duration: 600
        }
      ];
    } else if (safeDuration <= 30) {
      return [
        {
          title: "Analyzing Certification Requirements",
          description: "Deep-diving into exam objectives and skill areas",
          icon: "🔍",
          duration: 1000
        },
        {
          title: "Customizing Learning Path",
          description: "Tailoring content to your 30-day journey",
          icon: "🎯",
          duration: 1200
        },
        {
          title: "Generating Daily Activities",
          description: "Creating comprehensive study tasks and milestones",
          icon: "📚",
          duration: 1500
        },
        {
          title: "Optimizing Study Schedule",
          description: "Balancing theory, practice, and review cycles",
          icon: "⚡",
          duration: 1200
        },
        {
          title: "Adding Resources & Tips",
          description: "Including detailed materials and expert guidance",
          icon: "💡",
          duration: 1000
        }
      ];
    } else if (safeDuration <= 60) {
      return [
        {
          title: "Analyzing Certification Requirements",
          description: "Comprehensive analysis of exam objectives",
          icon: "🔍",
          duration: 1200
        },
        {
          title: "Customizing Learning Path",
          description: "Designing your extensive 60-day learning journey",
          icon: "🎯",
          duration: 1500
        },
        {
          title: "Generating Daily Activities",
          description: "Creating detailed study plans with progressive complexity",
          icon: "📚",
          duration: 2000
        },
        {
          title: "Optimizing Study Schedule",
          description: "Balancing intensive study with retention strategies",
          icon: "⚡",
          duration: 1500
        },
        {
          title: "Adding Resources & Tips",
          description: "Curating extensive resources and advanced techniques",
          icon: "💡",
          duration: 1200
        }
      ];
    } else {
      return [
        {
          title: "Analyzing Certification Requirements",
          description: "In-depth analysis of all exam domains and objectives",
          icon: "🔍",
          duration: 1500
        },
        {
          title: "Customizing Learning Path",
          description: "Architecting your comprehensive 90-day mastery plan",
          icon: "🎯",
          duration: 2000
        },
        {
          title: "Generating Daily Activities",
          description: "Creating extensive study curriculum with advanced scenarios",
          icon: "📚",
          duration: 2500
        },
        {
          title: "Optimizing Study Schedule",
          description: "Designing optimal learning cycles and retention patterns",
          icon: "⚡",
          duration: 2000
        },
        {
          title: "Adding Resources & Tips",
          description: "Compiling comprehensive resources and expert strategies",
          icon: "💡",
          duration: 1500
        }
      ];
    }
  };
  
  const steps = getStepsForDuration(duration);

  // Dynamic study tips based on plan duration
  const getStudyTipsForDuration = (planDuration) => {
    const safeDuration = Math.max(1, Number(planDuration) || 7);
    
    if (safeDuration <= 7) {
      return [
        "⚡ Intensive focus: Dedicate uninterrupted blocks for deep learning",
        "🎯 Prioritize high-impact topics that appear frequently on exams",
        "📝 Practice with timed mock exams to build speed and confidence",
        "🧠 Use active recall and spaced repetition for quick retention",
        "💪 Stay energized with proper sleep and nutrition during intensive study",
        "🔥 Eliminate distractions - every minute counts in your sprint!",
        "📚 Focus on understanding core concepts rather than memorizing details",
        "🎉 Reward yourself after each successful study session!"
      ];
    } else if (safeDuration <= 30) {
      return [
        "📅 Build a sustainable daily routine that you can maintain",
        "🧠 Use active recall: test yourself instead of just re-reading",
        "🎯 Balance theory with hands-on practice and real scenarios",
        "⏰ Take regular breaks to maintain concentration and avoid burnout",
        "📝 Practice with exam scenarios weekly to track progress",
        "🔄 Review previous topics regularly to reinforce learning",
        "👥 Join study groups or forums for peer support and motivation",
        "🎉 Celebrate weekly milestones to stay motivated!"
      ];
    } else {
      return [
        "🏗️ Build strong foundations before moving to advanced topics",
        "📊 Track your progress weekly and adjust your study plan accordingly",
        "🔄 Implement spaced repetition cycles for long-term retention",
        "🎯 Deep dive into complex scenarios and edge cases",
        "💡 Create mind maps and visual aids for complex concepts",
        "👥 Engage with professional communities and expert discussions",
        "📚 Supplement with additional resources and real-world projects",
        "🌟 Maintain momentum with regular self-assessments and goal setting"
      ];
    }
  };
  
  const studyTips = getStudyTipsForDuration(duration);

  const certificationFacts = {
    "SC-100": [
      "🏗️ Focuses on designing comprehensive security architectures",
      "🔐 Covers Zero Trust principles and implementation",
      "☁️ Integrates cloud and hybrid security strategies"
    ],
    "SC-200": [
      "🛡️ Emphasizes threat hunting and incident response",
      "📊 Uses KQL (Kusto Query Language) for data analysis",
      "🔍 Covers Microsoft 365 Defender and Azure Sentinel"
    ],
    "SC-300": [
      "👤 Focuses on identity and access management",
      "🔑 Covers Azure Active Directory administration",
      "🛡️ Implements conditional access and governance"
    ],
    "SC-900": [
      "📖 Perfect starting point for security fundamentals",
      "🌟 Covers security, compliance, and identity basics",
      "🚀 Great foundation for advanced security certifications"
    ]
  };

  useEffect(() => {
    if (isComplete) {
      completeLoading();
    } else {
      startLoading();
    }
  }, [isComplete, startLoading, completeLoading]);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % studyTips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, []);

  const getCurrentFacts = () => {
    return certificationFacts[certification] || certificationFacts["SC-900"];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse">
            <span className="text-3xl text-white">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crafting Your Perfect Study Plan
          </h1>
          <p className="text-gray-600">
            Creating a personalized {duration}-day plan for {certification} • {dailyHours}h/day
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Generation Progress</span>
            <span className="text-sm font-medium text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${Math.max(0, progress)}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
          
          {/* Current Step */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl animate-bounce">{steps[dynamicStep]?.icon}</div>
            <div>
              <h3 className="font-semibold text-gray-900">{steps[dynamicStep]?.title}</h3>
              <p className="text-sm text-gray-600">{steps[dynamicStep]?.description}</p>
            </div>
          </div>
        </div>

        {/* Steps Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Generation Steps</h3>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
                index < dynamicStep ? 'bg-green-50 text-green-800' :
                index === dynamicStep ? 'bg-blue-50 text-blue-800 scale-105' :
                'text-gray-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < dynamicStep ? 'bg-green-500 text-white' :
                  index === dynamicStep ? 'bg-blue-500 text-white animate-pulse' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {index < dynamicStep ? '✓' : index + 1}
                </div>
                <span className="font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Study Tips */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Study Tips
            </h3>
            <div className="min-h-[60px] flex items-center">
              <p className="text-gray-700 transition-all duration-500 transform">
                {studyTips[currentTip]}
              </p>
            </div>
          </div>

          {/* Certification Facts */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              About {certification}
            </h3>
            <div className="space-y-2">
              {getCurrentFacts().map((fact, index) => (
                <div key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="text-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel Generation
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanLoadingExperience;