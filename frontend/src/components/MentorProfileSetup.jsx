import React, { useState } from 'react';
import { User, DollarSign, Clock, Award, Save } from 'lucide-react';
import mentorSessionApi from '../services/mentorSessionApi';

const MentorProfileSetup = ({ onProfileCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    bio: '',
    expertise_areas: '',
    hourly_rate: 50,
    years_experience: 1,
    is_accepting_sessions: true,
    min_session_duration: 30,
    max_session_duration: 120
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const profile = await mentorSessionApi.createMentorProfile(formData);
      onProfileCreated(profile);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create mentor profile');
      console.error('Profile creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <User className="w-6 h-6 mr-2" />
          Create Your Mentor Profile
        </h2>
        <p className="text-gray-600 mt-2">
          Set up your profile to start accepting mentoring sessions
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio *
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell students about your background, experience, and what you can help them with..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Areas of Expertise *
          </label>
          <input
            type="text"
            value={formData.expertise_areas}
            onChange={(e) => handleChange('expertise_areas', e.target.value)}
            placeholder="e.g., Web Development, Data Science, Career Guidance, Interview Prep"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Separate multiple areas with commas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Hourly Rate (USD) *
            </label>
            <input
              type="number"
              value={formData.hourly_rate}
              onChange={(e) => handleChange('hourly_rate', parseFloat(e.target.value))}
              min="10"
              max="500"
              step="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="w-4 h-4 inline mr-1" />
              Years of Experience
            </label>
            <input
              type="number"
              value={formData.years_experience}
              onChange={(e) => handleChange('years_experience', parseInt(e.target.value))}
              min="0"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Min Session Duration (minutes)
            </label>
            <select
              value={formData.min_session_duration}
              onChange={(e) => handleChange('min_session_duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Max Session Duration (minutes)
            </label>
            <select
              value={formData.max_session_duration}
              onChange={(e) => handleChange('max_session_duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
              <option value={240}>4 hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_accepting_sessions}
              onChange={(e) => handleChange('is_accepting_sessions', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">
              I'm ready to accept mentoring sessions
            </span>
          </label>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Profile
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MentorProfileSetup;
