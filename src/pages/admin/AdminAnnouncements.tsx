import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Plus, Edit2, Trash2, X, Clock, AlertTriangle, Eye, EyeOff, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  audience: 'all' | 'gate' | 'jee' | 'neet' | 'cuet' | 'circle';
  start_time: string;
  end_time: string;
  cta_text: string | null;
  cta_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Announcement> | null>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .upsert({
          id: editingItem.id, // Will be undefined for new items, which is handled by Postgres if UUID is default
          title: editingItem.title,
          content: editingItem.content,
          priority: editingItem.priority || 'normal',
          audience: editingItem.audience || 'all',
          start_time: editingItem.start_time,
          end_time: editingItem.end_time,
          cta_text: editingItem.cta_text || null,
          cta_url: editingItem.cta_url || null,
          is_active: editingItem.is_active ?? true,
        });

      if (error) throw error;
      
      setIsModalOpen(false);
      setEditingItem(null);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error saving announcement:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setDeleteConfirm(null);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      fetchAnnouncements();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'normal': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#062B3D] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-white/60 mt-1">Manage system-wide and targeted announcements</p>
          </div>
          <button
            onClick={() => {
              setEditingItem({
                priority: 'normal',
                audience: 'all',
                is_active: true,
                start_time: new Date().toISOString().slice(0,16),
                end_time: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,16)
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#5CE1E6] text-[#062B3D] px-4 py-2.5 rounded-xl font-bold hover:bg-[#5CE1E6]/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Announcement
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#5CE1E6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className={`p-6 rounded-2xl border border-white/10 bg-white/5 relative ${!announcement.is_active ? 'opacity-70' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{announcement.title}</h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full border border-[#5CE1E6]/30 bg-[#5CE1E6]/10 text-[#5CE1E6]">
                      {announcement.audience.toUpperCase()}
                    </span>
                    {!announcement.is_active && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full border border-white/20 bg-white/10 text-white/60">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(announcement.id, announcement.is_active)}
                      className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                      title={announcement.is_active ? "Deactivate" : "Activate"}
                    >
                      {announcement.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem({
                          ...announcement,
                          start_time: announcement.start_time ? new Date(announcement.start_time).toISOString().slice(0,16) : '',
                          end_time: announcement.end_time ? new Date(announcement.end_time).toISOString().slice(0,16) : ''
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(announcement.id)}
                      className="p-2 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-white/80 mb-6 line-clamp-2">{announcement.content}</p>
                
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-6 text-sm text-white/50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Starts: {new Date(announcement.start_time).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Ends: {new Date(announcement.end_time).toLocaleString()}
                    </div>
                  </div>
                  
                  {announcement.cta_text && (
                    <button disabled className="px-4 py-2 bg-[#5CE1E6]/20 text-[#5CE1E6] rounded-xl text-sm font-semibold border border-[#5CE1E6]/30">
                      Preview: {announcement.cta_text}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {announcements.length === 0 && (
              <div className="text-center py-12 text-white/50 bg-white/5 rounded-2xl border border-white/10">
                No announcements found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#062B3D] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-2xl font-bold">{editingItem.id ? 'Edit Announcement' : 'Create Announcement'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                    placeholder="Announcement Title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Content</label>
                  <textarea
                    required
                    rows={4}
                    value={editingItem.content || ''}
                    onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none resize-none"
                    placeholder="Rich text content here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Priority</label>
                    <select
                      value={editingItem.priority}
                      onChange={(e) => setEditingItem({...editingItem, priority: e.target.value as any})}
                      className="w-full bg-[#04202E] border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none appearance-none"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Audience</label>
                    <select
                      value={editingItem.audience}
                      onChange={(e) => setEditingItem({...editingItem, audience: e.target.value as any})}
                      className="w-full bg-[#04202E] border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none appearance-none"
                    >
                      <option value="all">All Users</option>
                      <option value="gate">GATE Students</option>
                      <option value="jee">JEE Students</option>
                      <option value="neet">NEET Students</option>
                      <option value="cuet">CUET Students</option>
                      <option value="circle">Study Circle Members</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={editingItem.start_time || ''}
                      onChange={(e) => setEditingItem({...editingItem, start_time: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={editingItem.end_time || ''}
                      onChange={(e) => setEditingItem({...editingItem, end_time: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">CTA Text (Optional)</label>
                    <input
                      type="text"
                      value={editingItem.cta_text || ''}
                      onChange={(e) => setEditingItem({...editingItem, cta_text: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                      placeholder="e.g. Register Now"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">CTA URL (Optional)</label>
                    <input
                      type="text"
                      value={editingItem.cta_url || ''}
                      onChange={(e) => setEditingItem({...editingItem, cta_url: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingItem.is_active || false}
                    onChange={(e) => setEditingItem({...editingItem, is_active: e.target.checked})}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#5CE1E6] focus:ring-[#5CE1E6]"
                  />
                  <label htmlFor="isActive" className="text-white font-semibold">Active (Visible to users)</label>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-[#5CE1E6] text-[#062B3D] hover:bg-[#5CE1E6]/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#062B3D] border border-white/10 rounded-2xl w-full max-w-md p-6 text-center shadow-2xl shadow-red-500/10">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Delete Announcement?</h3>
            <p className="text-white/60 mb-6">This action cannot be undone. Are you sure you want to proceed?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2.5 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-6 py-2.5 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
