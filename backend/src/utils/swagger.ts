import fs from "fs";
import path from "path";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";
import type { Application } from "express";

export function setupSwagger(app: Application) {
  const filePath = path.join(process.cwd(), "src", "docs", "swagger.yaml");
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const swaggerDocument = yaml.parse(fileContents);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Optional: allow raw JSON/YAML export
  app.get("/api-docs.json", (_req, res) => res.json(swaggerDocument));
}
