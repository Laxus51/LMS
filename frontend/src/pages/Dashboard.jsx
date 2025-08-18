import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // No need for loading check since ProtectedRoute handles authentication
  // Component will only render if user is authenticated
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to your Dashboard!</h2>
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/courses')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  View Courses
                </button>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Manage Users
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;