import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAdminStudyMaterialStats, getStudyMaterials, type StudyMaterial } from '../../lib/studyMaterialsApi';
import {
  CheckCircle,
  ExternalLink,
  Search,
  RefreshCw
} from 'lucide-react';

export default function AdminStudyMaterials() {
  const [stats, setStats] = useState<any>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    'ALL' | 'DISCOVERED' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPORTED' | 'EXTERNAL_ONLY'
  >('NEEDS_REVIEW');

  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    const s = await getAdminStudyMaterialStats();
    setStats(s);
    const m = await getStudyMaterials({ search: searchQuery });
    setMaterials(m);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const filteredMaterials = materials.filter(item => {
    if (activeTab === 'IMPORTED') return item.is_downloadable;
    if (activeTab === 'EXTERNAL_ONLY') return !item.is_downloadable && item.license_status === 'PUBLIC_REFERENCE_ONLY';
    if (activeTab === 'NEEDS_REVIEW') return item.license_status === 'UNKNOWN_LICENSE' || !item.is_verified;
    if (activeTab === 'APPROVED') return item.is_verified;
    if (activeTab === 'DISCOVERED') return true;
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <Helmet>
        <title>Admin Study Materials Queue — Study Hub</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827]">Study Materials License & Ingestion Queue</h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Review discovered study resources, evaluate copyright rights, manage local caching, and assign taxonomy.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-[#111827] text-white text-xs font-bold flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider block">Total Resources</span>
            <span className="text-2xl font-extrabold text-[#111827] mt-1 block font-mono">{stats.totalResources}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#059669] tracking-wider block">Imported (Local)</span>
            <span className="text-2xl font-extrabold text-[#059669] mt-1 block font-mono">{stats.imported}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#D97706] tracking-wider block">External Only</span>
            <span className="text-2xl font-extrabold text-[#D97706] mt-1 block font-mono">{stats.externalOnly}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#DC2626] tracking-wider block">Needs Review</span>
            <span className="text-2xl font-extrabold text-[#DC2626] mt-1 block font-mono">{stats.needsReview}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#0066CC] tracking-wider block">Stored Bytes</span>
            <span className="text-lg font-extrabold text-[#0066CC] mt-1 block font-mono">{stats.storedBytes} B</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider block">Duplicates</span>
            <span className="text-2xl font-extrabold text-[#111827] mt-1 block font-mono">{stats.duplicates}</span>
          </div>
        </div>
      )}

      {/* Tabs & Search Rail */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-3">
          {[
            { label: 'Needs License Review', key: 'NEEDS_REVIEW' },
            { label: 'Discovered', key: 'DISCOVERED' },
            { label: 'Imported (Local)', key: 'IMPORTED' },
            { label: 'External Only', key: 'EXTERNAL_ONLY' },
            { label: 'Approved', key: 'APPROVED' },
            { label: 'All Resources', key: 'ALL' }
          ].map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0066CC] text-white shadow-xs'
                    : 'bg-[#F9FAFB] text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources by title, exam, subject, chapter, or license..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0066CC]"
          />
        </div>
      </div>

      {/* Resource Queue Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Resource & Title</th>
                <th className="py-3.5 px-4">Taxonomy (Exam / Subj / Topic)</th>
                <th className="py-3.5 px-4">Type & Format</th>
                <th className="py-3.5 px-4">License Status</th>
                <th className="py-3.5 px-4">Local Storage</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9CA3AF]">
                    Loading queue data...
                  </td>
                </tr>
              ) : filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9CA3AF]">
                    No study materials found for this queue section.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map(item => (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-[#111827] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#9CA3AF] truncate">Source: {item.source_name}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[#0066CC] font-bold block">{item.exam_code}</span>
                      <span className="text-[11px] text-[#4B5563] block">{item.subject} • {item.chapter || 'General'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#F3F4F6] text-[#374151] font-mono text-[10px] font-bold block w-max">
                        {item.material_type}
                      </span>
                      <span className="text-[10px] text-[#9CA3AF] mt-0.5 block">{item.format}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.license_status === 'OFFICIAL'
                            ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                            : item.license_status === 'PUBLIC_REFERENCE_ONLY'
                            ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                            : 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]'
                        }`}
                      >
                        {item.license_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.is_downloadable ? (
                        <span className="text-[#059669] font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Permitted ({item.file_size} B)</span>
                        </span>
                      ) : (
                        <span className="text-[#D97706] text-[11px] flex items-center gap-1 font-semibold">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>External Only</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="px-2.5 py-1 rounded-lg bg-[#059669] text-white text-[11px] font-bold hover:bg-[#047857] transition-colors"
                          title="Approve & Import"
                        >
                          Approve
                        </button>
                        <button
                          className="px-2.5 py-1 rounded-lg bg-[#D97706] text-white text-[11px] font-bold hover:bg-[#B45309] transition-colors"
                          title="Mark External Link Only"
                        >
                          External
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
