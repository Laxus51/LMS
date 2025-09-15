import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Cog, 
  Shield,
  CheckCircle,
  Clock,
  Trophy,
  Target
} from 'lucide-react';

const MockExamGenerationLoader = ({ 
  certification, 
  difficulty, 
  progress = 0, 
  currentStep = 0, 
  onCancel 
}) => {
  const [currentTip, setCurrentTip] = useState(0);

  const steps = [
    {
      title: "Analyzing Exam Blueprint",
      description: `Reviewing ${certification} exam objectives and domains`,
      icon: Search,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Curating Question Bank", 
      description: `Selecting diverse questions across all exam topics`,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Calibrating Difficulty",
      description: `Ensuring ${difficulty} level matches real exam standards`,
      icon: Target,
      color: "text-purple-600", 
      bgColor: "bg-purple-100"
    },
    {
      title: "Assembling Final Exam",
      description: "Creating comprehensive exam with proper weighting",
      icon: Shield,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const tips = [
    `🎯 Mock exams simulate real ${certification} exam conditions`,
    `⏱️ Practice time management with realistic exam duration`,
    `📊 Get detailed performance analytics across all domains`,
    `🔄 Each mock exam has unique questions for varied practice`,
    `💯 Explanations help you understand correct and incorrect answers`,
    `📈 Track improvement across multiple mock exam attempts`,
    `🚀 Build confidence before taking the actual certification exam`,
    `🎓 Mock exams identify knowledge gaps for focused study`
  ];

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3500);

    return () => clearInterval(tipInterval);
  }, [tips.length]);

  const currentStepData = steps[currentStep] || steps[0];
  const StepIcon = currentStepData.icon;

  // Get certification-specific details
  const getCertificationDetails = () => {
    const details = {
      'SC-900': { questions: '50', duration: '60 minutes', domains: '6' },
      'AZ-900': { questions: '40-60', duration: '85 minutes', domains: '6' },
      'MS-900': { questions: '40-60', duration: '60 minutes', domains: '6' },
      'AZ-104': { questions: '40-60', duration: '120 minutes', domains: '5' },
      'AZ-204': { questions: '40-60', duration: '120 minutes', domains: '5' },
    };
    return details[certification] || { questions: '40-60', duration: '90 minutes', domains: '5-6' };
  };

  const certDetails = getCertificationDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-white animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generating Mock Exam
          </h1>
          <p className="text-gray-600">
            Creating comprehensive {certification} practice exam
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Processing your request...
          </div>
          <div className="mt-3 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              {certDetails.questions} questions
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {certDetails.duration}
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-1" />
              {certDetails.domains} domains
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Exam Generation Progress</span>
            <span className="text-sm font-medium text-indigo-600">{progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
            <div 
              className="h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700 ease-out relative"
              style={{ width: `${Math.max(0, progress)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
              <div className="absolute right-0 top-0 h-full w-1 bg-white/50 animate-pulse"></div>
            </div>
          </div>
          
          {/* Current Step */}
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${currentStepData.bgColor} transition-all duration-300 animate-pulse`}>
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
          <h3 className="font-semibold text-gray-900 mb-4">Exam Creation Process</h3>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const StepIconComponent = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center space-x-3 transition-all duration-300 ${
                    isCurrent ? 'transform scale-105 bg-gray-50 rounded-lg p-2 -m-2' : ''
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
                      } ${isCurrent ? 'animate-pulse' : ''}`} />
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
                  {isCompleted && (
                    <div className="ml-auto">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Exam Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Mock Exam Will Include</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-gray-600">Multiple choice questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Scenario-based problems</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Detailed explanations</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Performance analytics</span>
            </div>
          </div>
        </div>

        {/* Dynamic Tips */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-full flex-shrink-0">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Pro Tip</h3>
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

export default MockExamGenerationLoader;
