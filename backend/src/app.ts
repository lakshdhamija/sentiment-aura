import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { aiRouter } from "./routes/index.js";
import { setupSwagger } from "./utils/swagger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import deepgramRoutes from "./routes/deepgram.routes.js";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Sentiment Aura backend is running");
});

// Swagger docs
setupSwagger(app);

// Sentiment analysis API
app.use("/api/v1/ai", aiRouter);

// Deepgram token minting
app.use("/api/v1/deepgram", deepgramRoutes);

// Error handler (keep last)
app.use(errorHandler);

export default app;
