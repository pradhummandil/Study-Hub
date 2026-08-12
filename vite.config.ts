import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';

// Secure Vite dev-server plugin: handles /api/study-ai in Node process only.
// GEMINI_API_KEY never reaches the browser.
function studyAiDevPlugin(geminiKey: string) {
  return {
    name: 'study-ai-dev-server',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use('/api/study-ai', async (req, res) => {
        // Health check
        if (req.method === 'GET' || req.url?.includes('/health')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', model: 'gemini-1.5-flash' }));
          return;
        }

        if (req.method !== 'POST') {
          res.writeHead(405);
          res.end('Method Not Allowed');
          return;
        }

        // Read body
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body);
            const { messages, context } = payload;

            // Build Gemini system instruction
            const systemInstruction = buildSystemInstruction(context);

            // Build Gemini request
            const geminiPayload = {
              system_instruction: {
                parts: [{ text: systemInstruction }],
              },
              contents: messages.map((m: { role: string; content: string }) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
              },
              safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              ],
            };

            const geminiBodyStr = JSON.stringify(geminiPayload);
            const GEMINI_MODEL = 'gemini-flash-latest';
            const path = `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`;

            const options = {
              hostname: 'generativelanguage.googleapis.com',
              port: 443,
              path,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(geminiBodyStr),
              },
            };

            const geminiReq = https.request(options, (geminiRes) => {
              let responseData = '';
              geminiRes.on('data', (chunk: Buffer) => { responseData += chunk.toString(); });
              geminiRes.on('end', () => {
                try {
                  const parsed = JSON.parse(responseData);
                  let text = '';
                  if (parsed?.candidates?.[0]?.content?.parts) {
                    text = parsed.candidates[0].content.parts
                      .map((p: { text?: string }) => p.text || '')
                      .join('');
                  }
                  if (!text && parsed?.candidates?.[0]?.finishReason) {
                    console.warn('[StudyAI Dev] Gemini finishReason:', parsed.candidates[0].finishReason);
                  }
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ response: text }));
                } catch {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Failed to parse AI response' }));
                }
              });
            });

            geminiReq.on('error', (err: Error) => {
              console.error('[StudyAI Dev] Gemini request error:', err.message);
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'AI service unavailable' }));
            });

            geminiReq.write(geminiBodyStr);
            geminiReq.end();
          } catch (parseErr) {
            console.error('[StudyAI Dev] Parse error:', parseErr);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bad request' }));
          }
        });
      });
    },
  };
}

function buildSystemInstruction(context: Record<string, string> = {}): string {
  const examCtx = context.exam && context.exam !== 'General'
    ? `\n\nCurrent exam context: ${context.exam}. Tailor all explanations, examples, and practice questions to be relevant and appropriate for ${context.exam} preparation level and syllabus.`
    : '';

  const modeCtx = context.mode
    ? `\n\nCurrent mode: ${context.mode}. ${getModeInstruction(context.mode)}`
    : '';

  const subjectCtx = context.subject ? `\n\nSubject focus: ${context.subject}.` : '';
  const topicCtx = context.topic ? ` Topic: ${context.topic}.` : '';
  const studentCtx = context.student_context ? `\n\n${context.student_context}` : '';

  const ragCtx = context.rag_context ? `\n\n${context.rag_context}` : '';

  return `You are StudyMate AI, a grounded educational study assistant built specifically for students preparing for competitive exams (GATE, JEE, NEET, UPSC, CUET, UGC NET, CLAT, NIFT) and academic learning.

Your responses MUST be grounded in verified educational content and the student's actual learning context.

Supported subject areas: mathematics, physics, chemistry, biology, computer science, computer networks, DBMS, operating systems, data structures, algorithms, aptitude, reasoning, general knowledge.

YOUR TEACHING STYLE (follow strictly):
1. Grounded Accuracy: Base explanations on verified concepts. Cite official/verified sources when provided.
2. Socratic Guidance (when in Socratic mode): Ask guiding questions and hints instead of giving final answers immediately.
3. Structured Outputs: Use bold key terms, clean tables/lists, and markdown formulas.
4. No-Hallucination Guard: If a specific official cutoff, rank prediction, or unverified official key is requested without source, explicitly state: "I couldn't find a verified source for that in the Study Hub knowledge base."
5. Encourage & Motivate: Keep tone professional, supportive, and academically inspiring.${examCtx}${modeCtx}${subjectCtx}${topicCtx}${studentCtx}${ragCtx}`;
}

function getModeInstruction(mode: string): string {
  const instructions: Record<string, string> = {
    'Explain': 'Provide detailed, clear explanations. Start simple, build complexity. Use analogies.',
    'Teach me': 'Teach concepts starting from first principles with simple language, formula summary, and exam tips.',
    'Test me': 'Pose one exam-standard question at a time and wait for student response before revealing solution.',
    'Explain my mistake': 'Identify the exact conceptual or calculation trap that led to the wrong answer.',
    'Socratic mode': 'SOCRATIC MODE: DO NOT give the answer directly. Guide the student step-by-step with thought-provoking questions and progressive hints.',
    'Practice': 'Generate practice questions appropriate for the level with step-by-step explanations.',
    'Quiz': 'Create an interactive quiz. Present questions one at a time with A/B/C/D options.',
    'Revision': 'Provide concise revision notes, focusing on key formulas, mnemonics, and high-yield points.',
    'Study Plan': 'Generate a realistic study schedule using available hours and target exam date.',
    'Doubt Solving': 'Focus on solving the problem step-by-step with question understanding, concept identified, solution, and common trap.',
    'Formula Sheet': 'Generate an official-grade formula sheet table with Formula, Meaning, Units, When to use, and Common traps.',
    'Notes Generator': 'Generate structured notes with Concept, Key points, Definitions, Formulae, Examples, Common mistakes, Exam tips, Revision checklist. Label as AI-generated study notes unless grounded.',
  };
  return instructions[mode] || '';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiKey = env.GEMINI_API_KEY || '';

  return {
    plugins: [
      react(),
      ...(mode === 'development' ? [studyAiDevPlugin(geminiKey)] : []),
    ],
  };
});
