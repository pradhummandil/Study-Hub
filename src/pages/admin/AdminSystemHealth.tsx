import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Database, HardDrive, Lock, Brain, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'CHECKING';
  lastChecked: string;
  icon: any;
}

interface FeatureFlag {
  id: string;
  key: string;
  value: string;
  description: string;
  created_at: string;
}

interface ErrorLog {
  id: string;
  error_message: string;
  created_at: string;
}

const AdminSystemHealth = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Supabase DB', status: 'CHECKING', lastChecked: '-', icon: Database },
    { name: 'Gemini AI', status: 'CHECKING', lastChecked: '-', icon: Brain },
    { name: 'Authentication', status: 'CHECKING', lastChecked: '-', icon: Lock },
    { name: 'Storage', status: 'CHECKING', lastChecked: '-', icon: HardDrive },
  ]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    runAllChecks();
    fetchConfig();
    
    const interval = setInterval(() => {
      runAllChecks();
    }, 60000); // Auto-refresh every 60s
    
    return () => clearInterval(interval);
  }, []);

  const fetchConfig = async () => {
    try {
      const { data: flags } = await supabase.from('feature_flags').select('*').order('key');
      if (flags) {
        setFeatureFlags(flags);
        const maint = flags.find(f => f.key === 'maintenance_mode');
        if (maint) setMaintenanceMode(maint.value === 'true');
      }

      // Mock recent errors
      setRecentErrors([
        { id: '1', error_message: 'AI Rate limit exceeded', created_at: new Date(Date.now() - 300000).toISOString() },
        { id: '2', error_message: 'Failed to generate summary: token limit', created_at: new Date(Date.now() - 3600000).toISOString() }
      ]);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const updateServiceStatus = (index: number, status: 'HEALTHY' | 'DEGRADED' | 'DOWN') => {
    setServices(prev => {
      const newServices = [...prev];
      newServices[index] = {
        ...newServices[index],
        status,
        lastChecked: new Date().toLocaleTimeString(),
      };
      return newServices;
    });
  };

  const runAllChecks = async () => {
    setIsRefreshing(true);
    
    // Reset to checking
    setServices(prev => prev.map(s => ({ ...s, status: 'CHECKING' })));

    // 1. Check DB
    try {
      const { error } = await supabase.from('feature_flags').select('count').limit(1);
      updateServiceStatus(0, error ? 'DOWN' : 'HEALTHY');
    } catch {
      updateServiceStatus(0, 'DOWN');
    }

    // 2. Check AI (Mocked endpoint for now)
    try {
      // In a real app: await fetch('/api/study-ai/health')
      await new Promise(r => setTimeout(r, 800));
      updateServiceStatus(1, 'HEALTHY');
    } catch {
      updateServiceStatus(1, 'DOWN');
    }

    // 3. Check Auth
    try {
      const { error } = await supabase.auth.getSession();
      updateServiceStatus(2, error ? 'DEGRADED' : 'HEALTHY');
    } catch {
      updateServiceStatus(2, 'DOWN');
    }

    // 4. Check Storage
    try {
      const { error } = await supabase.storage.listBuckets();
      updateServiceStatus(3, error ? 'DOWN' : 'HEALTHY');
    } catch {
      updateServiceStatus(3, 'DOWN');
    }

    setIsRefreshing(false);
  };

  const toggleFeatureFlag = async (flag: FeatureFlag) => {
    const newValue = flag.value === 'true' ? 'false' : 'true';
    try {
      await supabase
        .from('feature_flags')
        .update({ value: newValue })
        .eq('id', flag.id);
      
      setFeatureFlags(prev => prev.map(f => 
        f.id === flag.id ? { ...f, value: newValue } : f
      ));
      
      if (flag.key === 'maintenance_mode') {
        setMaintenanceMode(newValue === 'true');
      }
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-400';
      case 'DEGRADED': return 'text-yellow-400';
      case 'DOWN': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'bg-green-400';
      case 'DEGRADED': return 'bg-yellow-400';
      case 'DOWN': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#04202E] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-[#5CE1E6]" size={32} />
            System Health
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Auto-refreshes every 60s</span>
            <button
              onClick={runAllChecks}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              Run All Checks
            </button>
          </div>
        </div>

        {/* Maintenance Mode Warning */}
        {maintenanceMode && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-bold">Maintenance Mode is Active</h3>
              <p className="text-red-200/80 text-sm mt-1">Student access is currently blocked. Ensure this is turned off when maintenance is complete.</p>
            </div>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-black/20 rounded-xl">
                  <service.icon size={24} className="text-[#5CE1E6]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                  {service.status !== 'CHECKING' && (
                    <span className="relative flex h-3 w-3">
                      {service.status === 'HEALTHY' && (
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusBg(service.status)}`}></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusBg(service.status)}`}></span>
                    </span>
                  )}
                  {service.status === 'CHECKING' && (
                    <RefreshCw size={14} className="text-gray-400 animate-spin" />
                  )}
                </div>
              </div>
              <h3 className="text-lg font-bold">{service.name}</h3>
              <div className="text-xs text-gray-400 mt-2">
                Last checked: {service.lastChecked}
              </div>
              
              {/* Background Glow */}
              <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-3xl opacity-20 rounded-full transition-colors ${getStatusBg(service.status)} pointer-events-none`}></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Feature Flags */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="text-[#5CE1E6]" />
              System Toggles & Flags
            </h2>
            <div className="space-y-3">
              {featureFlags.length === 0 ? (
                <div className="text-center text-gray-400 py-4">No flags configured.</div>
              ) : (
                featureFlags.map(flag => (
                  <div key={flag.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${flag.key === 'maintenance_mode' ? 'bg-red-500/5 border-red-500/20' : 'bg-black/20 border-white/5'}`}>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {flag.key}
                        {flag.key === 'maintenance_mode' && <AlertTriangle size={14} className="text-red-400" />}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{flag.description || 'System configuration flag'}</div>
                    </div>
                    <button
                      onClick={() => toggleFeatureFlag(flag)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${flag.value === 'true' ? (flag.key === 'maintenance_mode' ? 'bg-red-500' : 'bg-[#5CE1E6]') : 'bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.value === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Errors */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" />
              Recent System Errors
            </h2>
            <div className="space-y-3">
              {recentErrors.length === 0 ? (
                <div className="text-center text-gray-400 py-8 flex flex-col items-center">
                  <CheckCircle size={32} className="text-green-400/50 mb-2" />
                  No recent errors detected. Systems operating normally.
                </div>
              ) : (
                recentErrors.map(err => (
                  <div key={err.id} className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start gap-3">
                    <XCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                    <div>
                      <div className="text-sm font-medium text-gray-200">{err.error_message}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(err.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

// Extracted Settings icon since it was missing in imports
const Settings = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export default AdminSystemHealth;
