import type { Request, Response } from "express";
import { analyzeText } from "../services/ai.service.js";
import { analyzeTextSchema } from "../validators/ai.validator.js";

export const processTextHandler = async (req: Request, res: Response) => {
  try {
    const parsed = analyzeTextSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((issue) => issue.message),
      });
    }

    const result = await analyzeText(parsed.data.text);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("processTextHandler error:", err);
    res.status(500).json({ success: false, error: "Failed to process text" });
  }
};
