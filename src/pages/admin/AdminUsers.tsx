import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Shield, 
  Ban, 
  RefreshCcw, 
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  target_exam: string;
  role: string;
  last_active: string;
  status: string;
}

export default function AdminUsers() {
  const { session } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: string; userId: string; role?: string } | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('student');

  useEffect(() => {
    fetchUsers();
  }, [filter, page, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!session?.access_token) return;
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'}/functions/v1/admin-users?page=${page}&limit=${usersPerPage}&filter=${filter}&search=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!confirmAction || !session?.access_token) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'}/functions/v1/admin-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(confirmAction)
      });
      
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setShowConfirm(false);
      setConfirmAction(null);
      setShowRoleModal(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'super_admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'content_editor': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'moderator': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'unverified': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const tabs = ['All', 'Active', 'Suspended', 'Verified', 'Admin', 'Moderator'];

  return (
    <div className="min-h-screen bg-[#04202E] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-white/60 mt-2">Manage user accounts, roles, and access permissions</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === tab 
                    ? 'bg-[#5CE1E6] text-[#062B3D]' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-medium text-white/60">User</th>
                  <th className="p-4 font-medium text-white/60">Target Exam</th>
                  <th className="p-4 font-medium text-white/60">Role</th>
                  <th className="p-4 font-medium text-white/60">Last Active</th>
                  <th className="p-4 font-medium text-white/60">Status</th>
                  <th className="p-4 font-medium text-white/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="w-24 h-4 bg-white/10 rounded"></div>
                            <div className="w-32 h-3 bg-white/10 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><div className="w-16 h-4 bg-white/10 rounded"></div></td>
                      <td className="p-4"><div className="w-20 h-6 bg-white/10 rounded-full"></div></td>
                      <td className="p-4"><div className="w-24 h-4 bg-white/10 rounded"></div></td>
                      <td className="p-4"><div className="w-20 h-6 bg-white/10 rounded-full"></div></td>
                      <td className="p-4"><div className="w-8 h-8 bg-white/10 rounded-xl ml-auto"></div></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-white/60">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=0D8ABC&color=fff`} 
                            alt={user.full_name} 
                            className="w-10 h-10 rounded-full border border-white/10"
                          />
                          <div>
                            <div className="font-medium">{user.full_name || 'Unknown'}</div>
                            <div className="text-sm text-white/60">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-white/80">{user.target_exam || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${getRoleColor(user.role)}`}>
                          {user.role?.replace('_', ' ').toUpperCase() || 'STUDENT'}
                        </span>
                      </td>
                      <td className="p-4 text-white/60 text-sm">
                        {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${getStatusColor(user.status)}`}>
                          {user.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setSelectedRole(user.role || 'student');
                              setShowRoleModal(true);
                            }}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors tooltip"
                            title="Change Role"
                          >
                            <Shield className="w-4 h-4 text-white/80" />
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmAction({ action: user.status === 'suspended' ? 'restore' : 'suspend', userId: user.id });
                              setShowConfirm(true);
                            }}
                            className={`p-2 hover:bg-white/10 rounded-xl transition-colors tooltip ${
                              user.status === 'suspended' ? 'text-green-400' : 'text-red-400'
                            }`}
                            title={user.status === 'suspended' ? 'Restore' : 'Suspend'}
                          >
                            {user.status === 'suspended' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmAction({ action: 'reset_onboarding', userId: user.id });
                              setShowConfirm(true);
                            }}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors tooltip"
                            title="Reset Onboarding"
                          >
                            <RefreshCcw className="w-4 h-4 text-white/80" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
            <span className="text-sm text-white/60">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-50 hover:bg-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-50 hover:bg-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#062B3D] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2">Confirm Action</h3>
            <p className="text-white/60 mb-6">
              Are you sure you want to {confirmAction?.action.replace('_', ' ')} this user?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                className="px-4 py-2 rounded-xl bg-[#5CE1E6] text-[#062B3D] font-bold hover:bg-[#5CE1E6]/90 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#062B3D] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Change User Role</h3>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none mb-6"
            >
              <option value="student">Student</option>
              <option value="moderator">Moderator</option>
              <option value="content_editor">Content Editor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setConfirmAction({ action: 'change_role', userId: selectedUserId!, role: selectedRole });
                  handleAction();
                }}
                className="px-4 py-2 rounded-xl bg-[#5CE1E6] text-[#062B3D] font-bold hover:bg-[#5CE1E6]/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
