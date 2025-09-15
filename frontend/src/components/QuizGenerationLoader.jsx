import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  BookOpen, 
  Target, 
  Zap,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const QuizGenerationLoader = ({ 
  certification, 
  topic, 
  difficulty, 
  progress = 0, 
  currentStep = 0, 
  onCancel 
}) => {
  const [currentTip, setCurrentTip] = useState(0);

  const steps = [
    {
      title: "Analyzing Topic",
      description: `Understanding ${topic} concepts and key areas`,
      icon: Brain,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Crafting Questions", 
      description: `Creating ${difficulty} level questions for ${certification}`,
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Optimizing Difficulty",
      description: "Ensuring questions match your skill level",
      icon: Target,
      color: "text-purple-600", 
      bgColor: "bg-purple-100"
    },
    {
      title: "Finalizing Quiz",
      description: "Adding explanations and organizing content",
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const tips = [
    `💡 ${certification} covers multiple domains - we're focusing on ${topic}`,
    `🎯 ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} questions test practical application`,
    `📚 Each question includes detailed explanations to enhance learning`,
    `⚡ AI-generated questions adapt to current industry standards`,
    `🚀 Practice regularly to improve retention and understanding`,
    `💪 Challenge yourself with different difficulty levels`,
    `📈 Track your progress across multiple quiz attempts`
  ];

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, [tips.length]);

  const currentStepData = steps[currentStep] || steps[0];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generating Your Quiz
          </h1>
          <p className="text-gray-600">
            Creating personalized {difficulty} questions on {topic}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Processing your request...
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Generation Progress</span>
            <span className="text-sm font-medium text-blue-600">{progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
            <div 
              className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${Math.max(0, progress)}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
          
          {/* Current Step */}
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${currentStepData.bgColor} transition-all duration-300`}>
              <StepIcon className={`w-6 h-6 ${currentStepData.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{currentStepData.title}</h3>
              <p className="text-sm text-gray-600">{currentStepData.description}</p>
            </div>
          </div>
        </div>

        {/* Steps Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Generation Process</h3>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const StepIconComponent = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center space-x-3 transition-all duration-300 ${
                    isCurrent ? 'transform scale-105' : ''
                  }`}
                >
                  <div className={`p-2 rounded-full transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-100' 
                      : isCurrent 
                        ? step.bgColor 
                        : 'bg-gray-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <StepIconComponent className={`w-4 h-4 ${
                        isCurrent ? step.color : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                  <span className={`text-sm transition-colors duration-300 ${
                    isCompleted 
                      ? 'text-green-700 font-medium' 
                      : isCurrent 
                        ? 'text-gray-900 font-medium' 
                        : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tips */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-full flex-shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Did You Know?</h3>
              <p 
                key={currentTip}
                className="text-gray-600 text-sm animate-fadeIn"
              >
                {tips[currentTip]}
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel Generation
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default QuizGenerationLoader;
