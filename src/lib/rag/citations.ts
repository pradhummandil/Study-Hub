// ─── StudyMate Citations & Grounding Utility ──────────────────────────────────
import type { GroundedCitation, SourceTrustLevel } from '../../types/phase5';

export const TRUST_WEIGHTS: Record<SourceTrustLevel, number> = {
  official: 1.0,
  verified: 0.85,
  community: 0.6,
  ai_generated: 0.4,
  unverified: 0.0,
};

export function formatCitationBadge(trust: SourceTrustLevel): {
  label: string;
  colorClass: string;
} {
  switch (trust) {
    case 'official':
      return { label: 'Official Exam Source', colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    case 'verified':
      return { label: 'Verified Study Hub Content', colorClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
    case 'community':
      return { label: 'Approved Community Resource', colorClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    case 'ai_generated':
      return { label: 'AI Generated Reference', colorClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    default:
      return { label: 'Unverified Content', colorClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
  }
}

export function buildCitationsMarkdown(citations: GroundedCitation[]): string {
  if (!citations || citations.length === 0) return '';

  const list = citations
    .map((c, idx) => {
      const pageStr = c.page ? ` (Page ${c.page})` : '';
      const qStr = c.question_number ? ` [Q. ${c.question_number}]` : '';
      const sourceLabel = `${c.title} — ${c.exam}${c.year ? ` ${c.year}` : ''}${pageStr}${qStr}`;
      return `${idx + 1}. **${sourceLabel}** (${c.source_type.toUpperCase()})`;
    })
    .join('\n');

  return `\n\n---\n**Verified Sources:**\n${list}`;
}

export function buildNoHallucinationDisclaimer(): string {
  return `*Note: I couldn't find a verified source for this exact question in the Study Hub knowledge base. The explanation below is provided from general educational principles — please double-check with your official exam syllabus.*`;
}
