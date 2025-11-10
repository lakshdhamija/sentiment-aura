import { useState } from "react";
import SentimentMeter from "./components/SentimentMeter";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:8000/api/v1/ai/process-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setResult(data.data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          Sentiment Aura
        </h1>

        <textarea
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something to analyze sentiment..."
        />

        <button
          onClick={analyze}
          disabled={!text || loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {result && (
          <div className="mt-6">
            <SentimentMeter sentiment={result.sentiment} />

            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              Keywords:
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.keywords.map((kw: string, i: number) => (
                <span
                  key={i}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
