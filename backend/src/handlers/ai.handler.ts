import type { Request, Response } from "express";
import { analyzeText } from "../services/ai.service.js";

export const processTextHandler = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Invalid or missing 'text' field" });
    }

    const result = await analyzeText(text);
    res.status(200).json(result);
  } catch (err) {
    console.error("processTextHandler error:", err);
    res.status(500).json({ error: "Failed to process text" });
  }
};
