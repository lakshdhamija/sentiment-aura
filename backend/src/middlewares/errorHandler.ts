import type { Request, Response, NextFunction } from "express";

// Centralized error handler
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("❌  Error:", err);

  // Handle Zod validation errors
  if (err?.errors && Array.isArray(err.errors)) {
    const message = err.errors[0]?.message || "Invalid input data";
    return res.status(400).json({
      success: false,
      data: null,
      error: message,
    });
  }

  // Handle known app errors
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: err.message,
    });
  }

  // Fallback – unexpected errors
  return res.status(500).json({
    success: false,
    data: null,
    error: "Internal Server Error",
  });
};
