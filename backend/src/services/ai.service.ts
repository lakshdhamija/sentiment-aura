import { groq as groqClient } from "../utils/groqClient.js";

export interface AIResponse {
  sentiment: number;
  keywords: string[];
}

type GroqLike = {
  chat: {
    completions: {
      create: (
        args: any
      ) => Promise<{ choices: { message: { content: string } }[] }>;
    };
  };
};

export const analyzeText = async (text: string): Promise<AIResponse> => {
  const prompt = `
  You are a precise JSON generator.

  Analyze the following text and respond ONLY with valid JSON.
  DO NOT include explanations, text, or code fences.

  The JSON must have this exact structure:
  {
    "sentiment": number between -1 and 1,
    "keywords": ["keyword1", "keyword2", ...]
  }

  Text to analyze:
  "${text}"
  `;

  const response = await groqClient.chat.completions.create({
    model: "llama-3.1-8b-instant",
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
