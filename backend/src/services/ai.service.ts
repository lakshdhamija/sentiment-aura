import { groq as groqClient } from "../utils/grokClient.js";

export interface AIResponse {
  sentiment: number;
  keywords: string[];
}

export const analyzeText = async (text: string): Promise<AIResponse> => {
  const prompt = `
  Analyze this text and return JSON strictly in this format:
  {
    "sentiment": number between -1 and 1,
    "keywords": ["keyword1", "keyword2", ...]
  }
  Text: "${text}"
  `;

  const response = await groqClient.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: prompt }],
  });

  const choice =
    Array.isArray(response.choices) && response.choices.length > 0
      ? response.choices[0]
      : null;

  const raw = choice?.message?.content?.trim() ?? "{}";

  try {
    return JSON.parse(raw);
  } catch {
    return { sentiment: 0, keywords: ["parse_error"] };
  }
};
