import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import Header from '../components/Header';

const MentorSessionPaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <>
      <Header title="Payment Cancelled" />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-orange-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled and no charges were made. Your session was not booked.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/mentor-booking')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              Back to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentorSessionPaymentCancel;
