import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import api from '../services/api';
import { Trash2, Shield, Users } from 'lucide-react';

const ROLES = ['free', 'premium', 'mentor', 'admin'];

const getRoleBadge = (role) => {
  const map = {
    admin: 'bg-red-100 text-red-800',
    premium: 'bg-purple-100 text-purple-800',
    mentor: 'bg-blue-100 text-blue-800',
    free: 'bg-gray-100 text-gray-700',
  };
  return map[role] || 'bg-gray-100 text-gray-700';
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  // { userId, currentRole, newRole }
  const [pendingRole, setPendingRole] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/users/admin/users');
      if (res.data.success) setUsers(res.data.data);
      else setError(res.data.message || 'Failed to fetch users');
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login'); }
      else setError(err.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (targetUser) => {
    setDeletingId(targetUser.id);
    try {
      await api.delete(`/users/admin/users/${targetUser.id}`);
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
      setConfirmDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await api.put(`/users/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setUpdatingId(null);
      setPendingRole(null);
    }
  };

  const stageRoleChange = (userId, currentRole, newRole) => {
    if (newRole === currentRole) return;
    setPendingRole({ userId, currentRole, newRole });
  };

  if (user?.role !== 'admin') return null;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <button onClick={fetchUsers} className="btn-primary">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="User Management" showBackButton backTo="/dashboard" />

      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {['free', 'premium', 'mentor', 'admin'].map(role => (
            <div key={role} className="bg-white rounded-lg border border-[#E5E7EB] p-4 text-center">
              <div className="text-2xl font-bold text-[#111827]">
                {users.filter(u => u.role === role).length}
              </div>
              <div className="text-xs text-[#6B7280] mt-1 capitalize">{role}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#6B7280]" />
            <h3 className="text-sm font-semibold text-[#111827]">All Users ({users.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">ID</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    {/* User info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-blue-600">
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{u.name || '—'}</div>
                          <div className="text-xs text-gray-500 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role selector */}
                    <td className="px-4 py-3">
                      {u.id === user.id ? (
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadge(u.role)}`}>
                          {u.role} (you)
                        </span>
                      ) : pendingRole?.userId === u.id ? (
                        /* Step 2: inline confirm */
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadge(pendingRole.currentRole)}`}>
                            {pendingRole.currentRole}
                          </span>
                          <span className="text-xs text-gray-400">→</span>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleBadge(pendingRole.newRole)}`}>
                            {pendingRole.newRole}
                          </span>
                          <button
                            onClick={() => handleRoleChange(pendingRole.userId, pendingRole.newRole)}
                            disabled={updatingId === u.id}
                            className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {updatingId === u.id ? '...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setPendingRole(null)}
                            disabled={updatingId === u.id}
                            className="px-2 py-0.5 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        /* Step 1: dropdown */
                        <select
                          value={u.role}
                          disabled={updatingId === u.id || !!pendingRole}
                          onChange={e => stageRoleChange(u.id, u.role, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* ID */}
                    <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">#{u.id}</td>

                    {/* Delete */}
                    <td className="px-4 py-3 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => setConfirmDelete(u)}
                          disabled={deletingId === u.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete User</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-5">
              Are you sure you want to delete <strong>{confirmDelete.name || confirmDelete.email}</strong>? All their data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deletingId === confirmDelete.id ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;