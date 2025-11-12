import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

// Centralized error handler
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("❌  Error:", err);

  // ✅ Handle Zod validation errors safely
  if (err instanceof ZodError) {
    const message =
      err.issues?.[0]?.message || "Invalid input data"; // ✅ use `issues` instead of `errors`
    return res.status(400).json({
      success: false,
      data: null,
      error: message,
    });
  }

  // ✅ Handle known app errors (custom status codes)
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: err.message,
    });
  }

  // ✅ Optional: handle legacy shape (if thrown manually with `errors`)
  if (Array.isArray(err.errors)) {
    const message = err.errors[0]?.message || "Invalid input data";
    return res.status(400).json({
      success: false,
      data: null,
      error: message,
    });
  }

  // ✅ Fallback for unexpected errors
  return res.status(500).json({
    success: false,
    data: null,
    error: "Internal Server Error",
  });
};
