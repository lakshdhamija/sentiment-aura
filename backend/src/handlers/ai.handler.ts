import type { Request, Response } from "express";
import { analyzeText } from "../services/ai.service.js";
import { analyzeTextSchema } from "../validators/ai.validator.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const processTextHandler = async (req: Request, res: Response) => {
  try {
    const { text } = analyzeTextSchema.parse(req.body); // ✅ validation

    const result = await analyzeText(text);

    res.status(200).json(successResponse(result));
  } catch (err: any) {
    const message =
      err.errors?.[0]?.message || err.message || "An unexpected error occurred";

    res.status(400).json(errorResponse(message));
  }
};
