import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  Search,
  Filter,
  ChevronRight,
  ArrowRight,
  Award,
  MessageCircle,
  Crown
} from 'lucide-react';
import mentorSessionApi from '../services/mentorSessionApi';
import { useAuth, canAccessPremiumFeatures } from '../contexts/AuthContext';
import Header from './Header';

const MentorBooking = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    title: '',
    description: '',
    duration_minutes: 60
  });
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState('mentors'); // mentors, slots, booking, confirmation
  const { user } = useAuth();
  const canBookSessions = canAccessPremiumFeatures(user);

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    if (selectedMentor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedMentor, selectedDate]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await mentorSessionApi.getAvailableMentors();
      setMentors(response.mentors);
    } catch (error) {
      setError('Failed to load mentors');
      console.error('Mentors error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await mentorSessionApi.getAvailableTimeSlots(selectedMentor.id, selectedDate);
      setAvailableSlots(response.slots);
    } catch (error) {
      setError('Failed to load available slots');
    }
  };

  const handleMentorSelect = (mentor) => {
    setSelectedMentor(mentor);
    setStep('slots');
    setSelectedDate('');
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep('booking');
  };

  const handleBooking = async () => {
    try {
      setBookingLoading(true);
      const booking = {
        mentor_id: selectedMentor.id,
        scheduled_at: selectedSlot.start_time,
        duration_minutes: bookingData.duration_minutes,
        title: bookingData.title,
        description: bookingData.description
      };

      const response = await mentorSessionApi.bookSession(booking);
      
      if (response.payment_url) {
        // Redirect to Stripe checkout
        window.location.href = response.payment_url;
      } else {
        setStep('confirmation');
      }
    } catch (error) {
      setError('Failed to book session. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mentor.expertise_areas && mentor.expertise_areas.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header title="Find a Mentor" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Dashboard
            </button>
          </li>
          <li className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            <span className="text-gray-900 font-medium">Find a Mentor</span>
          </li>
          {canBookSessions && (
            <li className="flex items-center">
              <span className="text-gray-400 mx-2">•</span>
              <button
                onClick={() => navigate('/mentor-sessions')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                My Sessions
              </button>
            </li>
          )}
        </ol>
      </nav>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {canBookSessions ? 'Book a Mentor Session' : 'Browse Mentors'}
            </h1>
            <p className="text-gray-600 mt-2">
              {canBookSessions 
                ? 'Connect with experienced mentors to accelerate your learning'
                : 'Explore our experienced mentors and their availability'
              }
            </p>
          </div>
          
          {/* Navigation Actions */}
          {canBookSessions && (
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/mentor-sessions')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                My Sessions
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Premium Upgrade Notice for Free Users */}
      {!canBookSessions && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-blue-900">Upgrade to Premium for Mentor Sessions</h3>
              <p className="text-blue-700 mt-1">
                You're currently browsing in view-only mode. Upgrade to Premium to book sessions with our expert mentors.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </a>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Progress Steps - Only show for premium users */}
      {canBookSessions && (
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === 'mentors' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'mentors' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2">Choose Mentor</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center ${step === 'slots' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'slots' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2">Select Time</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center ${step === 'booking' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'booking' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2">Book & Pay</span>
            </div>
          </div>
        </div>
      )}

      {step === 'mentors' && (
        <div>
          {/* Search and Filter */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search mentors by name or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Mentors Grid */}
          {filteredMentors.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No mentors found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <div key={mentor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-600">
                          {mentor.average_rating > 0 ? mentor.average_rating.toFixed(1) : 'New'}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({mentor.total_sessions} sessions)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ${mentor.hourly_rate}/hr
                      </div>
                    </div>
                  </div>

                  {mentor.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {mentor.bio}
                    </p>
                  )}

                  {mentor.expertise_areas && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise_areas.split(',').slice(0, 3).map((area, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {area.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Award className="w-4 h-4 mr-1" />
                      {mentor.years_experience ? `${mentor.years_experience} years` : 'Experience varies'}
                    </div>
                    {canBookSessions ? (
                      <button
                        onClick={() => handleMentorSelect(mentor)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Select Mentor
                      </button>
                    ) : (
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Premium Required</div>
                        <button
                          onClick={() => window.location.href = '/pricing'}
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          Upgrade
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'slots' && selectedMentor && (
        <div>
          <div className="mb-6">
            <button
              onClick={() => setStep('mentors')}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Back to mentors
            </button>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Book with {selectedMentor.name}
              </h3>
              <p className="text-gray-600">${selectedMentor.hourly_rate}/hour</p>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Select Date</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {getNextWeekDates().map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 text-center rounded-lg border transition-colors ${
                    selectedDate === date
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {formatDate(date)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {date}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Available Times</h4>
              {availableSlots.length === 0 ? (
                <p className="text-gray-500">No available slots for this date.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {availableSlots.filter(slot => slot.available).map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      className="p-3 text-center border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-sm font-medium">
                        {formatTime(slot.start_time)}
                      </div>
                      <div className="text-xs text-gray-500">
                        1 hour
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {step === 'booking' && selectedMentor && selectedSlot && (
        <div>
          <div className="mb-6">
            <button
              onClick={() => setStep('slots')}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Back to time slots
            </button>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mentor:</span>
                  <span className="font-medium">{selectedMentor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {formatDate(selectedSlot.start_time)} at {formatTime(selectedSlot.start_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-green-600">${selectedMentor.hourly_rate}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    value={bookingData.title}
                    onChange={(e) => setBookingData({...bookingData, title: e.target.value})}
                    placeholder="e.g., Career guidance, Technical review, Interview prep"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={bookingData.description}
                    onChange={(e) => setBookingData({...bookingData, description: e.target.value})}
                    placeholder="Describe what you'd like to discuss or any specific questions you have..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleBooking}
                  disabled={!bookingData.title || bookingLoading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Book Session - $${selectedMentor.hourly_rate}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default MentorBooking;
