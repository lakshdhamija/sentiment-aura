import type { Request, Response } from "express";
import { analyzeText } from "../services/ai.service.js";
import { analyzeTextSchema } from "../validators/ai.validator.js";

export const processTextHandler = async (req: Request, res: Response) => {
  try {
    const { text } = analyzeTextSchema.parse(req.body); // ✅ validation

    const result = await analyzeText(text);

    res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err: any) {
    const message =
      err.errors?.[0]?.message || err.message || "An unexpected error occurred";

    res.status(400).json({
      success: false,
      data: null,
      error: message,
    });
  }
};
