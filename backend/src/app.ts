import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { aiRouter } from "./routes/index.js";
import { setupSwagger } from "./utils/swagger.js";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Sentiment Aura backend is running");
});

setupSwagger(app);

app.use("/api/v1/ai", aiRouter);

export default app;
