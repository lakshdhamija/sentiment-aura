import { z } from "zod";

export const analyzeTextSchema = z.object({
  text: z
    .string()
    .min(3, "Text must be at least 3 characters long")
    .refine((val) => val.trim().length > 0, {
      message: "'text' field is required",
    }),
});

export type AnalyzeTextInput = z.infer<typeof analyzeTextSchema>;
