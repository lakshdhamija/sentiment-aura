import request from "supertest";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import app from "../app.js";

// 👇 No mock import — your setup.ts already mocks Groq globally
describe("POST /api/v1/ai/process-text", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return sentiment and keywords for valid text", async () => {
    const res = await request(app)
      .post("/api/v1/ai/process-text")
      .send({ text: "I love TypeScript!" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        sentiment: 0.9,
        keywords: ["mocked", "response"],
      },
      error: null
    });
  });

  it("should return 400 for missing text field", async () => {
    const res = await request(app).post("/api/v1/ai/process-text").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      data: null,
      error: expect.stringMatching(/Invalid input|unexpected/i),
    });
  });
});
