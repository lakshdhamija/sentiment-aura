import request from "supertest";
import app from "../app.js";
import { describe, it, expect } from "@jest/globals";

describe("POST /api/v1/ai/process-text", () => {
  it("should return 200 for valid text", async () => {
    const res = await request(app)
      .post("/api/v1/ai/process-text")
      .send({ text: "TypeScript is amazing!" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });

  it("should return 400 for missing text", async () => {
    const res = await request(app).post("/api/v1/ai/process-text").send({});
    expect(res.status).toBe(400);
  });
});
