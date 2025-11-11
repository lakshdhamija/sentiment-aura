import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/deepgram/token", async (req, res) => {
  try {
    const DG_KEY = process.env.DEEPGRAM_API_KEY;
    if (!DG_KEY) return res.status(500).json({ error: "Missing Deepgram key" });

    const dgRes = await fetch("https://api.deepgram.com/v1/listen", {
      method: "POST",
      headers: {
        Authorization: `Token ${DG_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl: 60 }), // 1 minute token
    });

    const data = await dgRes.json();
    if (!dgRes.ok) throw new Error(data.error || "Failed to get token");

    res.json({ key: data.key });
  } catch (err: any) {
    console.error("Deepgram token error:", err);
    res.status(500).json({ error: err.message || "Token generation failed" });
  }
});

export default router;
