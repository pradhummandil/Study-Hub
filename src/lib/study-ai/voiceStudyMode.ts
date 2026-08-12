// ─── StudyMate AI Voice Study Mode Utility ─────────────────────────────────────

export function speakText(text: string, onEnd?: () => void): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown formatting for clear speech
  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 1000); // Limit utterance chunk

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function initSpeechRecognition(
  onResult: (transcript: string) => void,
  onError?: (err: any) => void
): { start: () => void; stop: () => void; isSupported: boolean } {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      start: () => {},
      stop: () => {},
      isSupported: false,
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  if (onError) {
    recognition.onerror = onError;
  }

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    isSupported: true,
  };
}
