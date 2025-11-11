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
      // Ask for mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create WebSocket using the short-lived token
      const socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true`,
        ["token", import.meta.env.VITE_DEEPGRAM_API_KEY]
      );
      wsRef.current = socket;

      // --- Socket OPEN ---
      socket.onopen = () => {
        console.log("Deepgram connected (secure token)");
        const recorder = new MediaRecorder(stream);
        mediaRef.current = recorder;

        recorder.start(250);
        recorder.ondataavailable = (e) => {
          if (socket.readyState === WebSocket.OPEN) socket.send(e.data);
        };

        setIsRecording(true);
      };

      // Handle incoming transcripts
      socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          const transcriptText =
            data.channel?.alternatives?.[0]?.transcript?.trim();
          if (!transcriptText) return;
          if (!data.is_final) return;

          setTranscript((prev) => prev + " " + transcriptText + " ");
          onFinalSentence?.(transcriptText);
        } catch (err) {
          console.error("Error parsing Deepgram message:", err);
          onError?.("Speech stream parsing failed. Please retry.");
        }
      };

      // Handle network errors
      socket.onerror = (e) => {
        console.error("Deepgram WebSocket error:", e);
        onError?.("🎙️ Deepgram connection error. Check network or API key.");
        stopRecording();
      };

      // Handle socket close or expiry
      socket.onclose = (event) => {
        if (mediaRef.current && mediaRef.current.state !== "inactive") {
          mediaRef.current.stop();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (isRecording) {
          onError?.("Lost connection to speech service. Tap Start again.");
        }
        setIsRecording(false);
      };
    } catch (err: any) {
      console.error("Error starting recording:", err);
      onError?.("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording…");
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close();
    mediaRef.current?.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  return { transcript, isRecording, startRecording, stopRecording };
}
