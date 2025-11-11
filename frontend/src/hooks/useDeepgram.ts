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

  // Helper: safely close everything
  const cleanup = () => {
    mediaRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    wsRef.current?.close();
    mediaRef.current = null;
    streamRef.current = null;
    wsRef.current = null;
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      // Get a temporary Deepgram token from backend
      const tokenRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/deepgram/token`
      );
      if (!tokenRes.ok) throw new Error("Token request failed");
      const { key } = await tokenRes.json();
      if (!key) throw new Error("Invalid token response");

      // Ask for mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create WebSocket using the short-lived token
      const socket = new WebSocket(
        "wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true",
        ["token", key]
      );
      wsRef.current = socket;

      // When connected
      socket.onopen = () => {
        console.log("🎧 Deepgram connected (secure token)");
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
          const text = data.channel?.alternatives?.[0]?.transcript?.trim();
          if (!text || !data.is_final) return;

          setTranscript((prev) => prev + " " + text + " ");
          onFinalSentence?.(text);
        } catch {
          onError?.("Speech stream parsing failed. Please retry.");
        }
      };

      // Handle network errors
      socket.onerror = (e) => {
        console.error("Deepgram socket error:", e);
        onError?.("🎙️ Connection error. Check your network.");
        cleanup();
      };

      // Handle socket close or expiry
      socket.onclose = (event) => {
        console.warn("Deepgram socket closed:", event.code, event.reason);
        if (event.code !== 1000) {
          onError?.(
            "Lost connection to speech service. Please tap Start again."
          );
        }
        cleanup();
      };
    } catch (err: any) {
      console.error("Error starting recording:", err);
      if (err.name === "NotAllowedError") {
        onError?.("Microphone access denied. Please allow mic permissions.");
      } else if (err.message?.includes("Token")) {
        onError?.("Failed to obtain Deepgram token from backend.");
      } else {
        onError?.("Unexpected error. Please try again.");
      }
      cleanup();
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording...");
    cleanup();
  };

  return { transcript, isRecording, startRecording, stopRecording };
}
