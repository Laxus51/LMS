import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import api from '../services/api';
import paymentApi from '../services/paymentApi';
import { User, Mail, Shield, Calendar, AlertTriangle, Crown, Trash2 } from 'lucide-react';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [updateError, setUpdateError] = useState('');
  const navigate = useNavigate();

  // Subscription state
  const [subStatus, setSubStatus] = useState(null);
  const [subLoading, setSubLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  const [cancelError, setCancelError] = useState('');

  // Self-delete state
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchProfile();
    fetchSubscriptionStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users/profile');
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({ name: response.data.data.name || '', password: '', confirmPassword: '' });
      } else {
        setError(response.data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      if (err.response?.status === 401) setError('Session expired. Please sign in again.');
      else if (err.response?.status >= 500) setError('Server error. Try again later.');
      else if (!navigator.onLine) setError('No internet connection.');
      else setError(err.response?.data?.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      setSubLoading(true);
      const data = await paymentApi.getSubscriptionStatus();
      setSubStatus(data);
    } catch (err) {
      console.error('Error fetching subscription status:', err);
    } finally {
      setSubLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      setCancelError('');
      setCancelMessage('');
      const response = await paymentApi.cancelSubscription();
      if (response.success) {
        setCancelMessage(response.message || 'Subscription will be canceled at the end of the current billing period.');
        setShowCancelConfirm(false);
        await fetchSubscriptionStatus(); // Refresh status
      } else {
        setCancelError('Failed to cancel subscription. Please try again.');
      }
    } catch (err) {
      setCancelError(err.response?.data?.detail || 'Failed to cancel subscription. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      setDeleteLoading(true);
      setDeleteError('');
      await api.delete('/users/me');
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (formData.password) {
      if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setUpdateLoading(true);
      setUpdateError('');
      setSuccessMessage('');

      const updateData = { name: formData.name.trim() };
      if (formData.password) updateData.password = formData.password;

      const response = await api.put('/users/profile', updateData);
      if (response.data.success) {
        setProfile(response.data.data);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setUpdateError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      if (err.response?.status === 401) setUpdateError('Session expired. Please sign in again.');
      else if (err.response?.status === 400) setUpdateError('Please check your information and try again.');
      else setUpdateError(err.response?.data?.message || 'Unable to update profile.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({ name: profile?.name || '', password: '', confirmPassword: '' });
    setValidationErrors({});
    setUpdateError('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <>
        <TopBar title="Profile" />
        <div className="app-content flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563EB] border-t-transparent mx-auto mb-3" />
            <p className="text-sm text-[#6B7280]">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <TopBar title="Profile" />
        <div className="app-content flex items-center justify-center min-h-[400px]">
          <div className="card max-w-sm text-center">
            <AlertTriangle className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-[#111827] mb-1">Profile Error</h2>
            <p className="text-xs text-[#6B7280] mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={fetchProfile} className="btn-primary text-sm">Try Again</button>
              <button onClick={() => navigate('/dashboard')} className="btn-secondary text-sm">Dashboard</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isPremium = profile?.role === 'premium';
  const isSubActive = subStatus?.is_active;
  const willCancel = subStatus?.cancel_at_period_end;

  return (
    <>
      <TopBar title="Profile" />
      <div className="app-content">
        <div className="max-w-2xl mx-auto">

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 px-3 py-2 bg-[#F0FDF4] border border-[#16A34A]/20 rounded-md">
              <p className="text-xs text-[#16A34A] font-medium">{successMessage}</p>
            </div>
          )}

          {/* Profile Info Card */}
          <div className="card mb-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E5E7EB]">
              <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-[#2563EB]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#111827]">{profile?.name || 'User'}</h2>
                <p className="text-xs text-[#6B7280]">{profile?.email}</p>
              </div>
              <div className="ml-auto">
                <span className={`badge ${isPremium ? 'badge-info' : 'badge-neutral'}`}>
                  {isPremium ? 'Premium' : profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) || 'Free'}
                </span>
              </div>
            </div>

            {!isEditing ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Full Name</label>
                    <p className="text-sm text-[#111827] mt-0.5">{profile?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Email</label>
                    <p className="text-sm text-[#111827] mt-0.5">{profile?.email}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Auth Method</label>
                    <p className="text-sm text-[#111827] mt-0.5 capitalize">{profile?.auth_method || 'Email'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Role</label>
                    <p className="text-sm text-[#111827] mt-0.5 capitalize">{profile?.role || 'Free'}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setIsEditing(true)} className="btn-primary text-sm">
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                {updateError && (
                  <div className="mb-4 px-3 py-2 bg-[#FEF2F2] border border-[#DC2626]/20 rounded-md">
                    <p className="text-xs text-[#DC2626]">{updateError}</p>
                  </div>
                )}

                <div className="space-y-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-[#6B7280] mb-1">Full Name *</label>
                    <input
                      type="text" id="name" name="name"
                      value={formData.name} onChange={handleInputChange}
                      className={`input ${validationErrors.name ? 'border-[#DC2626]' : ''}`}
                      placeholder="Enter your name"
                    />
                    {validationErrors.name && <p className="mt-1 text-xs text-[#DC2626]">{validationErrors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-xs font-medium text-[#6B7280] mb-1">
                        {profile?.auth_method === 'google' && !profile?.has_password ? 'Set Password' : 'New Password'} (optional)
                      </label>
                      <input
                        type="password" id="password" name="password"
                        value={formData.password} onChange={handleInputChange}
                        className={`input ${validationErrors.password ? 'border-[#DC2626]' : ''}`}
                        placeholder="Enter password"
                      />
                      {validationErrors.password && <p className="mt-1 text-xs text-[#DC2626]">{validationErrors.password}</p>}
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-medium text-[#6B7280] mb-1">Confirm Password</label>
                      <input
                        type="password" id="confirmPassword" name="confirmPassword"
                        value={formData.confirmPassword} onChange={handleInputChange}
                        className={`input ${validationErrors.confirmPassword ? 'border-[#DC2626]' : ''}`}
                        placeholder="Confirm password"
                        disabled={!formData.password}
                      />
                      {validationErrors.confirmPassword && <p className="mt-1 text-xs text-[#DC2626]">{validationErrors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleCancelEdit} className="btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={updateLoading} className="btn-primary text-sm">
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Subscription Management Card */}
          <div className="card mb-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E5E7EB]">
              <Crown className="w-4 h-4 text-[#D97706]" />
              <h3 className="text-sm font-semibold text-[#111827]">Subscription</h3>
            </div>

            {subLoading ? (
              <div className="flex items-center gap-2 py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#2563EB] border-t-transparent" />
                <span className="text-xs text-[#6B7280]">Loading subscription info...</span>
              </div>
            ) : !isPremium && !isSubActive && !subStatus?.subscription_id ? (
              /* Free user — no subscription */
              <div>
                <div className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 bg-[#F9FAFB] rounded-md flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Free Plan</p>
                    <p className="text-xs text-[#6B7280]">You're on the free plan with limited features.</p>
                  </div>
                </div>
                <button onClick={() => navigate('/pricing')} className="btn-primary text-sm mt-2">
                  Upgrade to Premium
                </button>
              </div>
            ) : isPremium && !subStatus?.subscription_id ? (
              /* Premium user without Stripe subscription (manually assigned) */
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Status</label>
                    <div className="mt-1">
                      <span className="badge badge-success">Active</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Plan</label>
                    <p className="text-sm text-[#111827] mt-0.5">Premium</p>
                  </div>
                </div>
                <div className="px-3 py-2 bg-[#EFF6FF] border border-[#2563EB]/10 rounded-md">
                  <p className="text-xs text-[#2563EB]">Your premium access is managed by an administrator.</p>
                </div>
              </div>
            ) : (
              /* Has subscription */
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Status</label>
                    <div className="mt-1">
                      {willCancel ? (
                        <span className="badge badge-warning">Canceling</span>
                      ) : isSubActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-error">{subStatus?.status || 'Inactive'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Plan</label>
                    <p className="text-sm text-[#111827] mt-0.5">Premium — $9.99/mo</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">
                      {willCancel ? 'Access Until' : 'Next Billing'}
                    </label>
                    <p className="text-sm text-[#111827] mt-0.5">
                      {formatDate(subStatus?.current_period_end)}
                    </p>
                  </div>
                </div>

                {/* Cancel confirmation messages */}
                {cancelMessage && (
                  <div className="mb-3 px-3 py-2 bg-[#F0FDF4] border border-[#16A34A]/20 rounded-md">
                    <p className="text-xs text-[#16A34A]">{cancelMessage}</p>
                  </div>
                )}
                {cancelError && (
                  <div className="mb-3 px-3 py-2 bg-[#FEF2F2] border border-[#DC2626]/20 rounded-md">
                    <p className="text-xs text-[#DC2626]">{cancelError}</p>
                  </div>
                )}

                {willCancel ? (
                  /* Already scheduled for cancellation */
                  <div className="px-3 py-2 bg-[#FFFBEB] border border-[#D97706]/20 rounded-md">
                    <p className="text-xs text-[#D97706]">
                      Your subscription will end on <strong>{formatDate(subStatus?.current_period_end)}</strong>.
                      You'll retain premium access until then.
                    </p>
                  </div>
                ) : isSubActive ? (
                  /* Active — show cancel option */
                  <>
                    {!showCancelConfirm ? (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="btn-danger text-sm"
                      >
                        Cancel Subscription
                      </button>
                    ) : (
                      <div className="border border-[#DC2626]/20 rounded-md p-4 bg-[#FEF2F2]">
                        <div className="flex items-start gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-[#111827]">Cancel your subscription?</p>
                            <p className="text-xs text-[#6B7280] mt-1">
                              Your premium access will continue until <strong>{formatDate(subStatus?.current_period_end)}</strong>.
                              After that, you'll be downgraded to the free plan. You can re-subscribe anytime.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setShowCancelConfirm(false); setCancelError(''); }}
                            className="btn-secondary text-sm"
                            disabled={cancelLoading}
                          >
                            Keep Subscription
                          </button>
                          <button
                            onClick={handleCancelSubscription}
                            disabled={cancelLoading}
                            className="btn-danger text-sm"
                          >
                            {cancelLoading ? 'Canceling...' : 'Yes, Cancel'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
          {/* Danger Zone */}
          <div className="card mb-4 border-[#FCA5A5]">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#FCA5A5]">
              <Trash2 className="w-4 h-4 text-[#DC2626]" />
              <h3 className="text-sm font-semibold text-[#DC2626]">Danger Zone</h3>
            </div>

            {!showDeleteAccount ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#111827]">Delete Account</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">Permanently remove your account and all data.</p>
                </div>
                <button
                  onClick={() => setShowDeleteAccount(true)}
                  className="px-3 py-1.5 text-xs font-medium text-[#DC2626] border border-[#DC2626]/30 rounded-md hover:bg-[#FEF2F2] transition-colors"
                >
                  Delete Account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] rounded-md border border-[#FCA5A5]">
                  <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#7F1D1D]">
                    This action is <strong>irreversible</strong>. All your data, courses, quizzes, and progress will be permanently deleted.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">
                    Type <strong>DELETE</strong> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={e => { setDeleteConfirmText(e.target.value); setDeleteError(''); }}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 text-sm border border-[#FCA5A5] rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                {deleteError && (
                  <p className="text-xs text-[#DC2626]">{deleteError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowDeleteAccount(false); setDeleteConfirmText(''); setDeleteError(''); }}
                    className="btn-secondary text-xs flex-1"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#DC2626] rounded-md hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;