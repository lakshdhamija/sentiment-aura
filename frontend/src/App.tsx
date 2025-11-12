import { useMemo, useState, useEffect } from "react";
import { useDeepgram } from "./hooks/useDeepgram";
import SentimentAura from "./components/SentimentAura";

type Pattern = "flow" | "warp" | "swarm" | "aurora";

const hueFromSentimentValue = (s: number) => {
  if (s <= -1) return 0;
  if (s < -0.3) return ((s + 1) / 0.7) * 25;
  if (s < 0.3) return ((s + 0.3) / 0.6) * (60 - 25) + 25;
  return ((s - 0.3) / 0.7) * (120 - 60) + 60;
};

export default function App() {
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [pattern, setPattern] = useState<Pattern>("flow");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isRecording, startRecording, stopRecording, transcript } =
    useDeepgram({
      onFinalSentence: async (sentence: string) => {
        try {
          setIsLoading(true);
          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/ai/process-text`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: sentence }),
            }
          );

          if (!res.ok) throw new Error(`Network error: ${res.status}`);

          const data = await res.json();
          if (data?.success) {
            const s = Math.max(
              -1,
              Math.min(1, Number(data.data.sentiment ?? 0))
            );
            setSentiment(s);
            setKeywords(
              Array.isArray(data.data.keywords)
                ? data.data.keywords.slice(0, 12)
                : []
            );
            setErrorMessage(null);
          } else {
            throw new Error(data?.message || "Sentiment API failed.");
          }
        } catch (err: any) {
          console.error("process-text failed:", err);
          setErrorMessage(
            err.message?.includes("Network")
              ? "⚠️ Backend unreachable. Please check your connection."
              : "⚠️ Sentiment analysis failed. Try again."
          );
          setTimeout(() => setErrorMessage(null), 4000);
        } finally {
          setIsLoading(false);
        }
      },
      onError: (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(null), 5000);
      },
    });

  // Derived Visual Styles
  const hue = useMemo(
    () => (sentiment == null ? 220 : hueFromSentimentValue(sentiment)),
    [sentiment]
  );
  const accentA = `hsla(${hue}, 90%, 60%, 0.95)`;
  const accentB = `hsla(${Math.min(hue + 20, 140)}, 85%, 45%, 0.95)`;
  const glow = `0 0 60px hsla(${hue}, 90%, 55%, 0.3)`;

  const bgStyle = useMemo(
    () => ({
      background: `
        radial-gradient(1000px 700px at 50% 50%, hsla(${hue},85%,20%,0.55), transparent 60%),
        #05060a
      `,
      transition: "background 1.2s ease",
    }),
    [hue]
  );

  // Keyword Fade-In
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    setVisibleCount(0);
    if (!keywords.length) return;
    const timers = keywords.map((_, i) =>
      window.setTimeout(
        () => setVisibleCount((c) => Math.max(c, i + 1)),
        80 * i
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [keywords]);

  useEffect(() => {
    const box = document.getElementById("transcript-box");
    if (box) box.scrollTop = box.scrollHeight;
  }, [transcript]);

  // UI Render
  return (
    <main
      className="relative min-h-screen text-white overflow-hidden font-sans"
      style={bgStyle}
    >
      {/* Background Visualization */}
      <SentimentAura sentiment={sentiment} pattern={pattern} theme="dark" />

      {/* Pattern Selector */}
      <div className="absolute top-5 right-5 z-30">
        <select
          value={pattern}
          onChange={(e) => setPattern(e.target.value as Pattern)}
          aria-label="Visualization pattern"
          className="appearance-none rounded-full bg-white/10 text-white/90 px-4 py-1.5 backdrop-blur-md cursor-pointer shadow-sm
                     transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option className="bg-slate-900" value="flow">
            Flow Field
          </option>
          <option className="bg-slate-900" value="warp">
            Perlin Warp
          </option>
          <option className="bg-slate-900" value="swarm">
            Particle Swarm
          </option>
          <option className="bg-slate-900" value="aurora">
            Aurora Bands
          </option>
        </select>
      </div>

      {/* Overlay UI */}
      <section className="absolute inset-0 z-30 grid place-items-center pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center gap-6 text-center px-4 select-none">
          <h1
            className="font-semibold tracking-wide text-balance"
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              textShadow: glow,
            }}
          >
            Speak your emotion
          </h1>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className="px-6 py-2.5 rounded-full text-white font-medium shadow-lg transition active:scale-[0.98]"
              style={{
                backgroundImage: isRecording
                  ? "linear-gradient(90deg, hsla(350,90%,60%,0.95), hsla(330,85%,50%,0.95))"
                  : `linear-gradient(90deg, ${accentA}, ${accentB})`,
                boxShadow: isRecording
                  ? "0 0 60px hsla(350,95%,55%,0.25)"
                  : isLoading
                  ? `0 0 40px hsla(${hue},95%,65%,0.4)`
                  : glow,
              }}
            >
              {isRecording ? "Stop" : "Start"}
            </button>

            <div
              className={`h-2.5 w-2.5 rounded-full ${
                isRecording ? "bg-rose-400 animate-ping-slow" : "bg-white/25"
              }`}
              title={isRecording ? "Recording…" : "Idle"}
            />

            {isLoading && (
              <span className="text-sm text-white/85 animate-pulse">
                Analyzing…
              </span>
            )}
          </div>

          {/* Transcript */}
          <div
            id="transcript-box"
            className="max-w-[80vw] md:max-w-2xl text-base md:text-lg leading-relaxed text-white/90 text-center bg-white/5 backdrop-blur-md rounded-2xl p-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent whitespace-pre-wrap"
          >
            {transcript ||
              "🎧 Say something. When you pause, it’ll analyze your tone."}
          </div>

          {/* Sentiment + Keywords */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              Sentiment:&nbsp;
              <span className="font-medium text-white/90">
                {sentiment == null ? "—" : sentiment.toFixed(2)}
              </span>
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-[80vw] md:max-w-3xl">
              {keywords.slice(0, visibleCount).map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className="px-3 py-1 rounded-full bg-white/10 text-white/95 backdrop-blur-md shadow-sm border border-white/10"
                  style={{
                    opacity: 0,
                    animation: "fadeInUp 600ms ease forwards",
                    animationDelay: `${i * 80}ms`,
                    borderColor: `hsla(${hue},80%,60%,0.25)`,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Error Toast */}
          {errorMessage && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 bg-red-500/90 text-white px-4 py-2 rounded-full shadow-lg animate-fadeInDown text-sm font-medium backdrop-blur-md transition-opacity duration-500">
              {errorMessage}
            </div>
          )}
        </div>
      </section>

      {/* Scoped Animations */}
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.4s ease forwards;
        }
        .animate-ping-slow {
          animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%,100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
    </main>
  );
}
