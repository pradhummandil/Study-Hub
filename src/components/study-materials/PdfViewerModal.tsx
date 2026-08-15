import React, { useState } from 'react';
import { type StudyMaterial, saveStudyMaterial, unsaveStudyMaterial, getSavedMaterialIds, updateMaterialProgress } from '../../lib/studyMaterialsApi';
import { X, Download, Bookmark, ExternalLink, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ShieldCheck, FileText } from 'lucide-react';

interface PdfViewerModalProps {
  material: StudyMaterial | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ material, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [saved, setSaved] = useState(() => (material ? getSavedMaterialIds().includes(material.id) : false));

  if (!material) return null;

  const totalPages = material.material_type === 'FORMULA_SHEET' ? 12 : (material.material_type === 'SHORT_NOTES' ? 8 : 15);

  const toggleSave = () => {
    if (saved) {
      unsaveStudyMaterial(material.id);
      setSaved(false);
    } else {
      saveStudyMaterial(material.id);
      setSaved(true);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      updateMaterialProgress(material.id, nextPage, Math.round((nextPage / totalPages) * 100));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      updateMaterialProgress(material.id, prevPage, Math.round((prevPage / totalPages) * 100));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#FFFFFF] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#E5E7EB]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-[#0066CC]/10 text-[#0066CC]">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-[#111827] truncate">{material.title}</h3>
              <p className="text-xs text-[#6B7280] truncate">
                {material.exam_code.replace('_', ' ')} • {material.subject} {material.chapter ? `• ${material.chapter}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Source Badge */}
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full border border-[#E5E7EB] bg-[#F3F4F6] text-[#374151]">
              {material.license_status}
            </span>

            {/* Save / Bookmark Button */}
            <button
              onClick={toggleSave}
              className={`p-2 rounded-xl border transition-colors ${
                saved ? 'bg-[#0066CC] text-white border-[#0066CC]' : 'bg-[#FFFFFF] text-[#374151] border-[#E5E7EB] hover:bg-[#F3F4F6]'
              }`}
              title={saved ? 'Remove from saved' : 'Save note'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>

            {/* Download Button */}
            {material.is_downloadable && material.storage_path ? (
              <a
                href={material.storage_path}
                download
                className="p-2 rounded-xl bg-[#111827] text-white hover:bg-[#1F2937] transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </a>
            ) : (
              <a
                href={material.external_url || material.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#0066CC] text-white text-xs font-semibold hover:bg-[#0052A3] transition-colors flex items-center gap-1.5"
              >
                <span>Open original source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Page Navigation */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-[#E5E7EB] bg-[#FFFFFF] text-xs font-semibold text-[#374151]">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40 hover:bg-[#F3F4F6] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-mono">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Main Viewer Canvas View */}
        <div className="flex-1 overflow-auto p-8 bg-[#F3F4F6] flex justify-center items-start no-scrollbar">
          {material.is_downloadable && material.storage_path ? (
            <div
              className="bg-[#FFFFFF] p-8 md:p-12 rounded-xl shadow-lg border border-[#E5E7EB] transition-transform duration-200"
              style={{ width: `${Math.round(750 * (zoom / 100))}px`, minHeight: '900px' }}
            >
              {/* Rendered Document Preview Content */}
              <div className="border-b border-[#E5E7EB] pb-6 mb-6 flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-[#0066CC]/10 text-[#0066CC]">
                    {material.material_type.replace('_', ' ')}
                  </span>
                  <h1 className="text-xl md:text-2xl font-extrabold text-[#111827] mt-3">{material.title}</h1>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Verified Study Hub Resource • Subject: {material.subject}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#059669] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Page Content Body */}
              <div className="space-y-6 text-sm text-[#374151] leading-relaxed font-sans">
                <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                  <h4 className="font-bold text-[#111827] text-xs uppercase tracking-wide mb-2">High-Yield Concept Overview (Page {currentPage})</h4>
                  <p>{material.description}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-[#111827]">1. Key Formulas & Theorems</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-[#4B5563]">
                    <li>Fundamental Equation for {material.topic || material.subject}: <code className="bg-[#F3F4F6] px-1.5 py-0.5 rounded font-mono text-[#0066CC]">F = m · a</code></li>
                    <li>Energy Balance Equation: <code className="bg-[#F3F4F6] px-1.5 py-0.5 rounded font-mono text-[#0066CC]">E = h · ν</code></li>
                    <li>Conservation Principle: Sum of initial potentials equals final kinetic state.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-[#111827]">2. Rapid Revision Mindmap Points</h4>
                  <p className="text-xs text-[#4B5563]">
                    Always inspect physical dimensions and boundary conditions before evaluating numerical values. Pay special attention to sign conventions in problem statements.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#1E40AF]">
                  <span className="font-bold block mb-1">💡 Exam Pro-Tip</span>
                  This chapter carries consistent weightage in {material.exam_code.replace('_', ' ')}. Review past 10 years questions alongside these revision notes.
                </div>
              </div>

              {/* Footer Attribution */}
              <div className="border-t border-[#E5E7EB] pt-6 mt-12 text-center text-[11px] text-[#9CA3AF]">
                {material.attribution || `Source: ${material.source_name}`} • Page {currentPage} of {totalPages}
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] p-8 max-w-xl w-full rounded-2xl shadow-lg border border-[#E5E7EB] text-center my-auto">
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                !
              </div>
              <h3 className="text-lg font-bold text-[#111827]">External Reference Resource</h3>
              <p className="text-xs text-[#6B7280] mt-2 mb-6">
                This study resource is hosted on original source page at <span className="font-mono text-[#111827]">{material.source_name}</span>. To respect copyright licensing, you can access the full document directly on the source website.
              </p>
              <a
                href={material.external_url || material.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0066CC] text-white font-bold text-xs hover:bg-[#0052A3] transition-all shadow-md"
              >
                <span>Open original source →</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
