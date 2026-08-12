import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  Plus, 
  Edit2, 
  X, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  exam: string;
  year: number;
  subject: string;
  category: string;
  type: string;
  source_url: string;
  thumbnail_url: string;
  difficulty: string;
  tags: string[];
  is_official: boolean;
  status: string;
  source_state: string;
  created_at: string;
}

export default function AdminResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, review: 0, archived: 0 });

  useEffect(() => {
    fetchResources();
  }, [page, searchTerm]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      let query = supabase.from('resources').select('*', { count: 'exact' });
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
        
      if (error) throw error;
      setResources(data || []);
      
      // Compute stats
      const { data: allData } = await supabase.from('resources').select('status');
      if (allData) {
        const newStats = { total: allData.length, published: 0, draft: 0, review: 0, archived: 0 };
        allData.forEach(r => {
          if (r.status === 'published') newStats.published++;
          else if (r.status === 'draft') newStats.draft++;
          else if (r.status === 'review') newStats.review++;
          else if (r.status === 'archived') newStats.archived++;
        });
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingResource) return;
    
    try {
      const isNew = !editingResource.id;
      let error;
      
      if (isNew) {
        const { error: insertError } = await supabase.from('resources').insert([editingResource]);
        error = insertError;
      } else {
        const { error: updateError } = await supabase.from('resources')
          .update(editingResource)
          .eq('id', editingResource.id);
        error = updateError;
      }
      
      if (error) throw error;
      
      setDrawerOpen(false);
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkAction = async (action: 'publish' | 'archive') => {
    if (selectedIds.length === 0) return;
    try {
      const { error } = await supabase.from('resources')
        .update({ status: action === 'publish' ? 'published' : 'archived' })
        .in('id', selectedIds);
        
      if (error) throw error;
      setSelectedIds([]);
      fetchResources();
    } catch (error) {
      console.error('Error in bulk action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'archived': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-white/10 text-white/80 border-white/20';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'official': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'verified_external': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'community': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'ai_generated': return 'bg-pink-500/20 text-pink-400 border-pink-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#04202E] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Resource CMS</h1>
            <p className="text-white/60 mt-2">Manage study materials, PDFs, links, and tools</p>
          </div>
          <button 
            onClick={() => {
              setEditingResource({ 
                status: 'draft', 
                source_state: 'unknown',
                category: 'Notes',
                type: 'pdf',
                difficulty: 'Medium'
              });
              setDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5CE1E6] text-[#062B3D] font-bold rounded-xl hover:bg-[#5CE1E6]/90 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Resource
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Published', value: stats.published, color: 'text-green-400' },
            { label: 'Draft', value: stats.draft, color: 'text-gray-400' },
            { label: 'Review', value: stats.review, color: 'text-yellow-400' },
            { label: 'Archived', value: stats.archived, color: 'text-orange-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col">
              <span className="text-white/60 text-sm font-medium">{stat.label}</span>
              <span className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Filters & Bulk Actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 items-center">
            {selectedIds.length > 0 && (
              <>
                <span className="text-sm text-[#5CE1E6] mr-2">{selectedIds.length} selected</span>
                <button 
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1.5 text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/50 rounded-xl hover:bg-green-500/30"
                >
                  Bulk Publish
                </button>
                <button 
                  onClick={() => handleBulkAction('archive')}
                  className="px-3 py-1.5 text-sm font-medium bg-orange-500/20 text-orange-400 border border-orange-500/50 rounded-xl hover:bg-orange-500/30"
                >
                  Bulk Archive
                </button>
              </>
            )}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search resources..."
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
                  <th className="p-4 w-12">
                    <button onClick={() => setSelectedIds(selectedIds.length === resources.length ? [] : resources.map(r => r.id))}>
                      {selectedIds.length === resources.length && resources.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-[#5CE1E6]" />
                      ) : (
                        <Square className="w-5 h-5 text-white/40 hover:text-white" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 font-medium text-white/60">Resource</th>
                  <th className="p-4 font-medium text-white/60">Exam / Year</th>
                  <th className="p-4 font-medium text-white/60">Subject / Category</th>
                  <th className="p-4 font-medium text-white/60">Status</th>
                  <th className="p-4 font-medium text-white/60">Source</th>
                  <th className="p-4 font-medium text-white/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-white/60">Loading...</td></tr>
                ) : resources.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-white/60">No resources found.</td></tr>
                ) : (
                  resources.map(resource => (
                    <tr key={resource.id} className="hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => {
                      setEditingResource(resource);
                      setDrawerOpen(true);
                    }}>
                      <td className="p-4" onClick={e => e.stopPropagation()}>
                        <button onClick={() => toggleSelection(resource.id)}>
                          {selectedIds.includes(resource.id) ? (
                            <CheckSquare className="w-5 h-5 text-[#5CE1E6]" />
                          ) : (
                            <Square className="w-5 h-5 text-white/40 hover:text-white" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {resource.thumbnail_url ? (
                            <img src={resource.thumbnail_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-black/50" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-white/40" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium line-clamp-1">{resource.title}</div>
                            <div className="text-sm text-white/60 uppercase">{resource.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{resource.exam || '-'}</div>
                        <div className="text-sm text-white/60">{resource.year || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{resource.subject || '-'}</div>
                        <div className="text-sm text-white/60">{resource.category || '-'}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs border whitespace-nowrap ${getStatusColor(resource.status)}`}>
                          {resource.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs border whitespace-nowrap ${getSourceColor(resource.source_state)}`}>
                          {resource.source_state?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                          <Edit2 className="w-4 h-4 text-white/80" />
                        </button>
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
              Page {page}
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
                onClick={() => setPage(p => p + 1)}
                disabled={resources.length < itemsPerPage}
                className="p-2 bg-white/5 border border-white/10 rounded-xl disabled:opacity-50 hover:bg-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-in Drawer */}
      {drawerOpen && editingResource && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#062B3D] border-l border-white/10 shadow-2xl z-50 flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">{editingResource.id ? 'Edit Resource' : 'Add Resource'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Title</label>
                <input 
                  type="text" 
                  value={editingResource.title || ''} 
                  onChange={e => setEditingResource({...editingResource, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Description</label>
                <textarea 
                  rows={3}
                  value={editingResource.description || ''} 
                  onChange={e => setEditingResource({...editingResource, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Exam</label>
                  <select 
                    value={editingResource.exam || ''} 
                    onChange={e => setEditingResource({...editingResource, exam: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                  >
                    <option value="">Select</option>
                    <option value="JEE">JEE</option>
                    <option value="NEET">NEET</option>
                    <option value="UPSC">UPSC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Year</label>
                  <input 
                    type="number" 
                    value={editingResource.year || ''} 
                    onChange={e => setEditingResource({...editingResource, year: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Category</label>
                  <select 
                    value={editingResource.category || ''} 
                    onChange={e => setEditingResource({...editingResource, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                  >
                    <option value="PYQ">PYQ</option>
                    <option value="Notes">Notes</option>
                    <option value="Video">Video</option>
                    <option value="Tool">Tool</option>
                    <option value="Reference">Reference</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Type</label>
                  <select 
                    value={editingResource.type || ''} 
                    onChange={e => setEditingResource({...editingResource, type: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                    <option value="tool">Tool</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={editingResource.subject || ''} 
                  onChange={e => setEditingResource({...editingResource, subject: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Source URL</label>
                <input 
                  type="text" 
                  value={editingResource.source_url || ''} 
                  onChange={e => setEditingResource({...editingResource, source_url: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Thumbnail URL</label>
                <input 
                  type="text" 
                  value={editingResource.thumbnail_url || ''} 
                  onChange={e => setEditingResource({...editingResource, thumbnail_url: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Status</label>
                  <select 
                    value={editingResource.status || ''} 
                    onChange={e => setEditingResource({...editingResource, status: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Source State</label>
                  <select 
                    value={editingResource.source_state || ''} 
                    onChange={e => setEditingResource({...editingResource, source_state: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                  >
                    <option value="official">Official</option>
                    <option value="verified_external">Verified External</option>
                    <option value="community">Community</option>
                    <option value="ai_generated">AI Generated</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Tags (comma-separated)</label>
                <input 
                  type="text" 
                  value={editingResource.tags?.join(', ') || ''} 
                  onChange={e => setEditingResource({...editingResource, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:border-[#5CE1E6]/50 outline-none"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="is_official"
                  checked={editingResource.is_official || false} 
                  onChange={e => setEditingResource({...editingResource, is_official: e.target.checked})}
                  className="w-5 h-5 accent-[#5CE1E6] bg-white/5 border-white/10 rounded"
                />
                <label htmlFor="is_official" className="text-sm font-medium">Mark as Official Material</label>
              </div>

            </div>

            <div className="p-6 border-t border-white/10 bg-black/20">
              <button 
                onClick={handleSave}
                className="w-full py-3 bg-[#5CE1E6] text-[#062B3D] font-bold rounded-xl hover:bg-[#5CE1E6]/90 transition-colors"
              >
                Save Resource
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
