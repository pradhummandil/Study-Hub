import { useState, useEffect, Fragment } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, Search, Filter, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface AuditLog {
  id: string;
  actor_id: string;
  actor_role: string;
  action_type: string;
  target_type: string;
  target_label: string;
  target_id: string;
  before_state: any;
  after_state: any;
  reason: string;
  created_at: string;
  actor_email?: string;
}

const AdminAuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const logsPerPage = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, search, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_audit_log')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`action_type.ilike.%${search}%,target_label.ilike.%${search}%`);
      }
      
      if (actionFilter !== 'ALL') {
        query = query.eq('action_type', actionFilter);
      }

      const from = (page - 1) * logsPerPage;
      const to = from + logsPerPage - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'bg-green-500/20 text-green-400';
      case 'UPDATE': return 'bg-blue-500/20 text-blue-400';
      case 'DELETE': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN': return 'bg-purple-500/20 text-purple-400';
      case 'SUPERADMIN': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#04202E] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              Audit Log
            </h1>
            <p className="text-gray-400 flex items-center gap-2 mt-1">
              <AlertCircle size={16} className="text-[#5CE1E6]" />
              Audit logs are immutable. No entries can be edited or deleted.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors whitespace-nowrap"
          >
            <Download size={18} />
            Export JSON
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by action or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none appearance-none"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-300">
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 font-medium">Actor</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Target Type</th>
                  <th className="p-4 font-medium">Target Label</th>
                  <th className="p-4 font-medium">Reason</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">Loading audit logs...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">No logs found matching criteria.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <Fragment key={log.id}>
                      <tr className="hover:bg-white/5 transition-colors group">
                        <td className="p-4 text-sm text-gray-300">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm truncate max-w-[150px]" title={log.actor_id}>
                              {log.actor_id.substring(0, 8)}...
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${getRoleColor(log.actor_role)}`}>
                              {log.actor_role}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-md font-medium ${getActionColor(log.action_type)}`}>
                            {log.action_type}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{log.target_type}</td>
                        <td className="p-4 text-sm font-medium">{log.target_label}</td>
                        <td className="p-4 text-sm text-gray-400 truncate max-w-[200px]" title={log.reason}>
                          {log.reason || '-'}
                        </td>
                        <td className="p-4 text-right">
                          {(log.before_state || log.after_state) && (
                            <button
                              onClick={() => toggleRow(log.id)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              {expandedRows.has(log.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedRows.has(log.id) && (
                        <tr className="bg-black/20 border-b border-white/10">
                          <td colSpan={7} className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-400">Before State</h4>
                                <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-white/5">
                                  {log.before_state ? JSON.stringify(log.before_state, null, 2) : 'null'}
                                </pre>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-400">After State</h4>
                                <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-white/5">
                                  {log.after_state ? JSON.stringify(log.after_state, null, 2) : 'null'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-gray-400">
            <div>
              Showing {Math.min((page - 1) * logsPerPage + 1, totalCount)} to {Math.min(page * logsPerPage, totalCount)} of {totalCount} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * logsPerPage >= totalCount}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAuditLog;
