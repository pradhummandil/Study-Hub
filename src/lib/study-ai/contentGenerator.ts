// ─── StudyMate Content Generator (Notes, Summaries, Formula Sheets) ──────────────

export type SummaryFormat = 'Quick summary' | 'Exam-focused summary' | 'Detailed notes' | 'Revision sheet';

export function buildNotesPrompt(topicOrResource: string, sourceName?: string): string {
  const sourceLabel = sourceName ? `derived from ${sourceName}` : 'AI-generated study notes';
  return `Generate a comprehensive, structured study note set for the topic: "${topicOrResource}".

Label the top clearly: **[${sourceLabel}]**

Please follow this exact standard markdown structure:

# Study Notes: ${topicOrResource}

## 1. Core Concept
[Clear, high-level summary of the concept]

## 2. Key Points
- [Key point 1]
- [Key point 2]
- [Key point 3]

## 3. Definitions & Terminology
- **[Term 1]**: [Definition]
- **[Term 2]**: [Definition]

## 4. Fundamental Formulae & Equations
- \`Formula 1\`: [Meaning and units]

## 5. Worked Example
**Problem:** [Example question]
**Solution:** [Step by step solution]

## 6. Common Mistakes to Avoid
- ⚠️ [Mistake 1]
- ⚠️ [Mistake 2]

## 7. Competitive Exam Tips
- 💡 [Tip for speed or trap detection]

## 8. Revision Checklist
- [ ] Understand basic definition
- [ ] Memorize core formula
- [ ] Solve 5 PYQs on this topic`;
}

export function buildSummaryPrompt(resourceTitle: string, format: SummaryFormat): string {
  return `Provide a "${format}" for the learning resource titled "${resourceTitle}".
Ensure content is directly applicable for exam preparation, highlighting core takeaways, key formulas, and exam relevance. Keep style clear, organized with markdown bullet points.`;
}

export function buildFormulaSheetPrompt(subject: string, exam: string): string {
  return `Generate an official-grade Formula Sheet for "${subject}" tailored for "${exam}".

Format as a table/list with the following fields for each key formula:
1. **Formula**: [LaTeX / standard math notation]
2. **Meaning**: [What each symbol represents]
3. **Units**: [SI / Standard units]
4. **When to use**: [Exact physical / mathematical condition]
5. **Common trap**: [Mistake candidates make when applying this]`;
}
