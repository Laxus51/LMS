import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import mentorSessionApi from '../services/mentorSessionApi';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday', short: 'Mon' },
  { value: 1, label: 'Tuesday', short: 'Tue' },
  { value: 2, label: 'Wednesday', short: 'Wed' },
  { value: 3, label: 'Thursday', short: 'Thu' },
  { value: 4, label: 'Friday', short: 'Fri' },
  { value: 5, label: 'Saturday', short: 'Sat' },
  { value: 6, label: 'Sunday', short: 'Sun' }
];

const TIME_SLOTS = [];
for (let hour = 0; hour < 24; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    TIME_SLOTS.push(timeString);
  }
}

const MentorAvailability = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    is_active: true
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const data = await mentorSessionApi.getMentorAvailability();
      setAvailability(data);
    } catch (error) {
      setError('Failed to load availability');
      console.error('Availability error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await mentorSessionApi.updateAvailability(editingId, formData);
        setSuccess('Availability updated successfully');
        setEditingId(null);
      } else {
        await mentorSessionApi.createAvailability(formData);
        setSuccess('Availability added successfully');
        setShowAddForm(false);
      }
      
      resetForm();
      fetchAvailability();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to save availability');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      is_active: item.is_active
    });
    setEditingId(item.id);
    setShowAddForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      await mentorSessionApi.deleteAvailability(id);
      setSuccess('Availability deleted successfully');
      fetchAvailability();
    } catch (error) {
      setError('Failed to delete availability');
    }
  };

  const resetForm = () => {
    setFormData({
      day_of_week: 0,
      start_time: '09:00',
      end_time: '17:00',
      is_active: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getDayLabel = (dayValue) => {
    return DAYS_OF_WEEK.find(day => day.value === dayValue)?.label || 'Unknown';
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const validateTimes = () => {
    return formData.start_time < formData.end_time;
  };

  const groupedAvailability = DAYS_OF_WEEK.map(day => ({
    ...day,
    slots: availability.filter(slot => slot.day_of_week === day.value && slot.is_active)
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Weekly Availability</h3>
          <p className="text-gray-600">Set your available hours for each day of the week</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Time Slot
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? 'Edit Availability' : 'Add New Availability'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day of Week
                </label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <select
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <select
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!validateTimes() && (
              <div className="text-red-600 text-sm">
                End time must be after start time
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active (visible to students)
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!validateTimes()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Weekly Calendar View */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {groupedAvailability.map((day) => (
            <div key={day.value} className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 text-center">
                {day.short}
              </h4>
              
              {day.slots.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No availability</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {day.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 relative group"
                    >
                      <div className="text-sm font-medium text-blue-900">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                      
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          onClick={() => handleEdit(slot)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {availability.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No availability set</h3>
          <p className="text-gray-600 mb-4">
            Add your available hours so students can book sessions with you
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Time Slot
          </button>
        </div>
      )}
    </div>
  );
};

export default MentorAvailability;
