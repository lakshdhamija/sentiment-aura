import React from "react";

interface SentimentMeterProps {
  sentiment: number; // expected range: -1 (negative) → 1 (positive)
}

const SentimentMeter: React.FC<SentimentMeterProps> = ({ sentiment }) => {
  // normalize to 0–100 scale
  const percent = Math.round(((sentiment + 1) / 2) * 100);
  const color =
    sentiment > 0.3 ? "bg-green-500"
    : sentiment < -0.3 ? "bg-red-500"
    : "bg-yellow-400";

  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
        <span>Sentiment</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SentimentMeter;
