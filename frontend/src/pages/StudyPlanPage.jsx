import React from 'react';
import Header from '../components/Header';
import StudyPlanGenerator from '../components/StudyPlanGenerator';

const StudyPlanPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Study Plan" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudyPlanGenerator />
      </div>
    </div>
  );
};

export default StudyPlanPage;