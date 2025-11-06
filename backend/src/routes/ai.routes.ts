import { Router } from "express";
import { processTextHandler } from "../handlers/ai.handler.js";

export const aiRouter = Router();

aiRouter.post("/process-text", processTextHandler);
