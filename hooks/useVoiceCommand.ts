'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const CAPTURE_PHRASES = [
  'take photo',
  'take picture',
  'capture',
  'cheese',
  'shoot',
  'click',
];

export function useVoiceCommand(
  onCapture: () => void,
  enabled: boolean
) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice recognition not supported');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.resultIndex][0].transcript
        .toLowerCase()
        .trim();
      if (CAPTURE_PHRASES.some((p) => transcript.includes(p))) {
        onCapture();
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        setError(event.error);
      }
    };

    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
    setError(null);
  }, [onCapture]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  useEffect(() => {
    if (!enabled) stopListening();
    return () => stopListening();
  }, [enabled, stopListening]);

  return { listening, error, startListening, stopListening };
}
