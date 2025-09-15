import React from 'react';
import Header from '../components/Header';
import TutorChat from '../components/TutorChat';

const TutorChatPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="AI Tutor" />
      <div className="h-[calc(100vh-4rem)]">
        <TutorChat />
      </div>
    </div>
  );
};

export default TutorChatPage;