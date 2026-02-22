import React from 'react';
import TopBar from '../components/TopBar';
import TutorChat from '../components/TutorChat';

const TutorChatPage = () => {
  return (
    <>
      <TopBar title="AI Tutor" />
      <div className="flex-1 overflow-hidden">
        <TutorChat />
      </div>
    </>
  );
};

export default TutorChatPage;