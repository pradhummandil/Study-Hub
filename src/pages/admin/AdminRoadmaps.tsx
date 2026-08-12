import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, List, Layers, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminRoadmaps() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedRoadmaps, setExpandedRoadmaps] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      // Assuming related tables: roadmaps, roadmap_sections, roadmap_topics
      const { data, error } = await supabase
        .from('roadmaps')
        .select(`
          *,
          roadmap_sections (
            *,
            roadmap_topics (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoadmaps(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (set: Set<string>, id: string, setFunc: Dispatch<SetStateAction<Set<string>>>) => {
    const newSet = new Set(set);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setFunc(newSet);
  };

  return (
    <div className="min-h-screen bg-[#062B3D] text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Roadmap Management</h1>
            <p className="text-white/60 mt-1">Configure curriculum and learning paths</p>
          </div>
          <button className="flex items-center gap-2 bg-[#5CE1E6] text-[#062B3D] px-4 py-2.5 rounded-xl font-bold hover:bg-[#5CE1E6]/90 transition-colors">
            <Plus className="w-5 h-5" />
            New Roadmap
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#5CE1E6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {roadmaps.map(roadmap => (
              <div key={roadmap.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Roadmap Header */}
                <div 
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => toggleExpanded(expandedRoadmaps, roadmap.id, setExpandedRoadmaps)}
                >
                  <div className="flex items-center gap-3">
                    {expandedRoadmaps.has(roadmap.id) ? <ChevronDown className="w-5 h-5 text-white/50" /> : <ChevronRight className="w-5 h-5 text-white/50" />}
                    <Layers className="w-5 h-5 text-[#5CE1E6]" />
                    <div>
                      <h3 className="font-bold text-lg">{roadmap.title} <span className="text-sm font-normal text-white/50 ml-2">({roadmap.exam})</span></h3>
                      <p className="text-sm text-white/50">{roadmap.roadmap_sections?.length || 0} Sections</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-2 bg-red-500/10 rounded-xl hover:bg-red-500/20 text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Sections */}
                {expandedRoadmaps.has(roadmap.id) && (
                  <div className="pl-6 pr-4 py-4 space-y-3 bg-black/20 border-t border-white/5">
                    <div className="flex justify-end mb-2">
                      <button className="text-sm text-[#5CE1E6] font-semibold hover:underline flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Section
                      </button>
                    </div>
                    
                    {roadmap.roadmap_sections?.map((section: any) => (
                      <div key={section.id} className="bg-[#04202E] border border-white/10 rounded-xl overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => toggleExpanded(expandedSections, section.id, setExpandedSections)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedSections.has(section.id) ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronRight className="w-4 h-4 text-white/50" />}
                            <List className="w-4 h-4 text-purple-400" />
                            <div>
                              <span className="font-semibold">{section.title}</span>
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-white/70 ml-3">
                                {section.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-white/50">{section.roadmap_topics?.length || 0} Topics</span>
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              <button className="p-1.5 hover:bg-white/10 rounded text-white/70"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>

                        {/* Topics */}
                        {expandedSections.has(section.id) && (
                          <div className="pl-12 pr-4 py-3 space-y-2 bg-black/30 border-t border-white/5">
                            {section.roadmap_topics?.map((topic: any) => (
                              <div key={topic.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-4 h-4 text-green-400" />
                                  <span className="text-sm font-medium">{topic.title}</span>
                                  <span className="text-xs text-white/40">{topic.subject}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-white/40">{topic.estimated_hours}h</span>
                                  <div className="flex items-center gap-1">
                                    <button className="p-1.5 hover:bg-white/10 rounded text-white/70"><Edit2 className="w-3.5 h-3.5" /></button>
                                    <button className="p-1.5 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button className="w-full text-left py-2 px-3 text-sm text-[#5CE1E6] hover:bg-white/5 rounded-lg border border-dashed border-[#5CE1E6]/30 transition-colors flex items-center justify-center gap-2">
                              <Plus className="w-4 h-4" /> Add Topic
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {roadmaps.length === 0 && (
              <div className="text-center py-12 text-white/50 bg-white/5 rounded-2xl border border-white/10">
                No roadmaps found. Create one to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
