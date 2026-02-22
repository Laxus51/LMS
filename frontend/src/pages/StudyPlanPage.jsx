import React from 'react';
import TopBar from '../components/TopBar';
import StudyPlanGenerator from '../components/StudyPlanGenerator';

const StudyPlanPage = () => {
  return (
    <>
      <TopBar title="Study Plan" />
      <div className="app-content">
        <StudyPlanGenerator />
      </div>
    </>
  );
};

export default StudyPlanPage;