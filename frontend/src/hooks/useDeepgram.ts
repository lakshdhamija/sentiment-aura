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
  const tokenTimerRef = useRef<number | null>(null);

  /* ────────────────────────────────────────────────
    Cleanup helper
  ──────────────────────────────────────────────── */
  const cleanup = () => {
    if (tokenTimerRef.current) {
      clearTimeout(tokenTimerRef.current);
      tokenTimerRef.current = null;
    }
    mediaRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    wsRef.current?.close();
    wsRef.current = null;
    mediaRef.current = null;
    streamRef.current = null;
    setIsRecording(false);
  };

  /* ────────────────────────────────────────────────
    Fetch ephemeral Deepgram token
  ──────────────────────────────────────────────── */
  const getEphemeralToken = async (): Promise<string> => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/deepgram/token`);
    if (!res.ok) throw new Error("Failed to fetch Deepgram token");
    const { key } = await res.json();
    if (!key) throw new Error("Invalid token from backend");
    return key;
  };

  /* ────────────────────────────────────────────────
    Start Recording
  ──────────────────────────────────────────────── */
  const startRecording = async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Get token & connect
      const key = await getEphemeralToken();
      await connectToDeepgram(key, stream);

      // Auto-refresh token before expiry (~55s)
      scheduleTokenRefresh();
    } catch (err: any) {
      console.error("Error starting recording:", err);
      if (err.name === "NotAllowedError") {
        onError?.("Microphone access denied. Please allow mic permissions.");
      } else if (err.message?.includes("token")) {
        onError?.("Failed to obtain Deepgram token from backend.");
      } else {
        onError?.("Unexpected error starting recording. Please try again.");
      }
      cleanup();
    }
  };

  /* ────────────────────────────────────────────────
    Connect to Deepgram with token
  ──────────────────────────────────────────────── */
  const connectToDeepgram = async (token: string, stream: MediaStream) => {
    const socket = new WebSocket(
      "wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true",
      ["token", token]
    );
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("Deepgram connected securely");
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
        if (!text || !data.is_final) return;
        setTranscript((prev) => prev + " " + text + " ");
        onFinalSentence?.(text);
      } catch {
        onError?.("Speech parsing failed. Please retry.");
      }
    };

    socket.onerror = (e) => {
      console.error("Deepgram WebSocket error:", e);
      onError?.("🎙️ Deepgram connection error. Retrying...");
      cleanup();
    };

    socket.onclose = async (event) => {
      console.warn("Deepgram socket closed:", event.code, event.reason);
      if (isRecording && event.code !== 1000) {
        onError?.("Lost connection. Reconnecting...");
        try {
          const newKey = await getEphemeralToken();
          await connectToDeepgram(newKey, stream);
        } catch (err) {
          onError?.("Failed to reconnect to Deepgram.");
          cleanup();
        }
      } else {
        cleanup();
      }
    };
  };

  /* ────────────────────────────────────────────────
    Token refresh every ~55 seconds
  ──────────────────────────────────────────────── */
  const scheduleTokenRefresh = () => {
    if (tokenTimerRef.current) clearTimeout(tokenTimerRef.current);
    tokenTimerRef.current = window.setTimeout(async () => {
      if (!isRecording || !streamRef.current) return;
      console.log("🔁 Refreshing Deepgram token...");
      try {
        const newKey = await getEphemeralToken();
        await connectToDeepgram(newKey, streamRef.current);
      } catch {
        onError?.("Token refresh failed. Please restart recording.");
        cleanup();
      }
    }, 55_000); // refresh every 55 seconds
  };

  /* ────────────────────────────────────────────────
    Stop Recording
  ──────────────────────────────────────────────── */
  const stopRecording = () => {
    console.log("Stopping recording...");
    cleanup();
  };

  return { transcript, isRecording, startRecording, stopRecording };
}
