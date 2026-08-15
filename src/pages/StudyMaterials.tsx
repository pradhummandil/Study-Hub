import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useStudentContext } from '../context/StudentContext';
import {
  getStudyMaterials,
  type StudyMaterial,
  saveStudyMaterial,
  unsaveStudyMaterial,
  getSavedMaterialIds
} from '../lib/studyMaterialsApi';
import { PdfViewerModal } from '../components/study-materials/PdfViewerModal';
import {
  Search,
  BookOpen,
  Bookmark,
  FileText,
  Sparkles,
  Globe
} from 'lucide-react';

export default function StudyMaterials() {
  const { targetExam } = useStudentContext();

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedExam, setSelectedExam] = useState<string>(() => {
    if (targetExam === 'GATE') return 'GATE_CSE';
    if (targetExam === 'JEE Advanced') return 'JEE_ADVANCED';
    if (targetExam === 'NEET') return 'NEET_UG';
    return 'JEE_MAIN';
  });

  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDownloadable, setSelectedDownloadable] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedMaterialIds());

  // PDF Viewer Modal
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);

  useEffect(() => {
    setLoading(true);
    getStudyMaterials({
      exam_code: selectedExam,
      subject: selectedSubject,
      material_type: selectedType,
      is_downloadable: selectedDownloadable === 'YES' ? true : (selectedDownloadable === 'NO' ? false : undefined),
      search: searchQuery
    }).then(res => {
      setMaterials(res);
      setLoading(false);
    });
  }, [selectedExam, selectedSubject, selectedType, selectedDownloadable, searchQuery]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedIds.includes(id)) {
      unsaveStudyMaterial(id);
      setSavedIds(prev => prev.filter(x => x !== id));
    } else {
      saveStudyMaterial(id);
      setSavedIds(prev => [...prev, id]);
    }
  };

  // Available subjects for dropdown
  const subjectsList = useMemo(() => {
    const set = new Set<string>();
    materials.forEach(m => {
      if (m.subject) set.add(m.subject);
    });
    return Array.from(set);
  }, [materials]);

  const getSourceBadgeStyle = (status: string) => {
    switch (status) {
      case 'OFFICIAL':
        return 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]';
      case 'LICENSED':
        return 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]';
      case 'COMMUNITY_NOTES':
      case 'COMMUNITY':
        return 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]';
      case 'PUBLIC_REFERENCE_ONLY':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      default:
        return 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      <Helmet>
        <title>Study Materials & Revision Notes — Study Hub</title>
        <meta
          name="description"
          content="Central hub for Revision Notes, Short Notes, Formula Sheets, Chapter Notes, GATE Notes and Curated Resources."
        />
      </Helmet>

      {/* Hero Header */}
      <section className="bg-[#FFFFFF] border-b border-[#E5E7EB] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066CC]/10 text-[#0066CC] text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Study Materials Engine 1.0</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#111827] tracking-tight">
              Everything you need to revise.
            </h1>
            <p className="text-base md:text-lg text-[#4B5563] mt-3 leading-relaxed">
              Curated revision notes, short notes, formula handbooks, GATE CS topics, and open community resources — verified and structured for your exam target.
            </p>
          </div>

          {/* Exam Switcher Tabs */}
          <div className="flex flex-wrap gap-2 mt-8">
            {[
              { label: 'JEE Main Notes', code: 'JEE_MAIN' },
              { label: 'JEE Advanced Physics', code: 'JEE_ADVANCED' },
              { label: 'GATE CSE Notes', code: 'GATE_CSE' },
              { label: 'NEET Notes', code: 'NEET_UG' }
            ].map(tab => {
              const active = selectedExam === tab.code;
              return (
                <button
                  key={tab.code}
                  onClick={() => setSelectedExam(tab.code)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#111827] text-white shadow-md'
                      : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] hover:text-[#111827]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar & Filters Rail */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-6">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes, chapters, formulas, TCP/IP, Kinematics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-xs font-semibold rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 transition-all shadow-xs"
              />
            </div>

            {/* Subject Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full py-3 px-3 text-xs font-semibold rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#374151] focus:outline-none focus:border-[#0066CC] shadow-xs cursor-pointer"
              >
                <option value="ALL">All Subjects</option>
                {subjectsList.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full py-3 px-3 text-xs font-semibold rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#374151] focus:outline-none focus:border-[#0066CC] shadow-xs cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="REVISION_NOTES">Revision Notes</option>
                <option value="SHORT_NOTES">Short Notes</option>
                <option value="FORMULA_SHEET">Formula Sheets</option>
                <option value="CHAPTER_NOTES">Chapter Notes</option>
                <option value="GATE_NOTES">GATE Notes</option>
                <option value="COMMUNITY_NOTES">Community Notes</option>
              </select>
            </div>

            {/* Downloadable Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedDownloadable}
                onChange={e => setSelectedDownloadable(e.target.value)}
                className="w-full py-3 px-3 text-xs font-semibold rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#374151] focus:outline-none focus:border-[#0066CC] shadow-xs cursor-pointer"
              >
                <option value="ALL">All Access</option>
                <option value="YES">Direct Download</option>
                <option value="NO">External Reference</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-bold text-[#6B7280]">
            Showing <span className="text-[#111827] font-mono">{materials.length}</span> study resources
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-48 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] animate-pulse p-6" />
            ))}
          </div>
        ) : materials.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
            <BookOpen className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#111827]">No study materials found</h3>
            <p className="text-xs text-[#6B7280] mt-1">Try clearing your search term or adjusting filter options.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('ALL');
                setSelectedType('ALL');
                setSelectedDownloadable('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-full bg-[#111827] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map(item => {
              const isSaved = savedIds.includes(item.id);
              const badgeStyle = getSourceBadgeStyle(item.license_status);

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveMaterial(item)}
                  className="group bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#0066CC]/40 rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top Meta Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#0066CC]/10 text-[#0066CC] text-[10px] font-extrabold uppercase tracking-wide">
                        {item.material_type.replace('_', ' ')}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeStyle}`}>
                          {item.license_status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={e => toggleSave(item.id, e)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isSaved
                              ? 'bg-[#0066CC] text-white border-[#0066CC]'
                              : 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:text-[#111827]'
                          }`}
                          title={isSaved ? 'Unsave' : 'Save note'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#0066CC] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Footer Info & Action */}
                  <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
                    <div className="truncate pr-2">
                      <p className="text-[11px] font-bold text-[#374151] truncate">{item.subject}</p>
                      <p className="text-[10px] text-[#9CA3AF] truncate">Source: {item.source_name}</p>
                    </div>

                    {item.is_downloadable ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0066CC] shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Read Note</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] shrink-0">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Open Source</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PDF Viewer Modal */}
      <PdfViewerModal material={activeMaterial} onClose={() => setActiveMaterial(null)} />
    </div>
  );
}
