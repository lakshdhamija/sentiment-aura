import { useRef, useState } from "react";

interface UseDeepgramProps {
  onFinalSentence?: (sentence: string) => void;
  onError?: (message: string) => void;
}

export function useDeepgram({ onFinalSentence, onError }: UseDeepgramProps) {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true`,
        ["token", import.meta.env.VITE_DEEPGRAM_API_KEY]
      );
      wsRef.current = socket;

      socket.onopen = () => {
        const recorder = new MediaRecorder(stream);
        mediaRef.current = recorder;

        recorder.start(250);
        recorder.ondataavailable = (e) => {
          if (socket.readyState === WebSocket.OPEN) socket.send(e.data);
        };
        setIsRecording(true);
      };

      socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          const text = data.channel?.alternatives?.[0]?.transcript?.trim();
          if (text && data.is_final) {
            setTranscript((prev) => `${prev}\n${text}`);
            onFinalSentence?.(text);
          }
        } catch {
          onError?.("Speech parsing failed. Please retry.");
        }
      };

      socket.onerror = () => {
        onError?.("Deepgram connection error. Check network or API key.");
        stopRecording();
      };

      socket.onclose = () => {
        if (mediaRef.current && mediaRef.current.state !== "inactive") {
          mediaRef.current.stop();
        }
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (isRecording) onError?.("Connection closed. Tap Start again.");
        setIsRecording(false);
      };
    } catch {
      onError?.("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close();
    mediaRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsRecording(false);
  };

  return { transcript, isRecording, startRecording, stopRecording };
}
