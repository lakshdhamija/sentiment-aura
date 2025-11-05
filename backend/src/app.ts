import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Sentiment Aura backend (TypeScript) is live!");
});

export default app;
