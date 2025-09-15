import React from 'react';
import { Check, X, Crown } from 'lucide-react';

const MentorFeatureComparison = ({ showUpgradeButton = true }) => {
  const features = [
    {
      name: 'Browse mentor profiles',
      free: true,
      premium: true,
      description: 'View mentor bios, expertise, and ratings'
    },
    {
      name: 'View mentor availability',
      free: true,
      premium: true,
      description: 'See when mentors are available for sessions'
    },
    {
      name: 'Book mentor sessions',
      free: false,
      premium: true,
      description: 'Schedule and pay for one-on-one mentoring'
    },
    {
      name: 'Session management',
      free: false,
      premium: true,
      description: 'Manage your booked sessions and history'
    },
    {
      name: 'Direct messaging',
      free: false,
      premium: true,
      description: 'Communicate with mentors before/after sessions'
    },
    {
      name: 'Session reviews',
      free: false,
      premium: true,
      description: 'Rate and review your mentoring experience'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentorship Features</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-900">Feature</th>
              <th className="text-center py-3 px-2 font-medium text-gray-600">Free</th>
              <th className="text-center py-3 px-2 font-medium text-blue-600 flex items-center justify-center">
                <Crown className="w-4 h-4 mr-1" />
                Premium
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-b-0">
                <td className="py-3 px-2">
                  <div>
                    <div className="font-medium text-gray-900">{feature.name}</div>
                    <div className="text-sm text-gray-500">{feature.description}</div>
                  </div>
                </td>
                <td className="text-center py-3 px-2">
                  {feature.free ? (
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  )}
                </td>
                <td className="text-center py-3 px-2">
                  {feature.premium ? (
                    <Check className="w-5 h-5 text-blue-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUpgradeButton && (
        <div className="mt-6 text-center">
          <a
            href="/pricing"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </a>
        </div>
      )}
    </div>
  );
};

export default MentorFeatureComparison;
