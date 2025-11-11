# 🎧 Sentiment Visualizer — “Speak Your Emotion”

A real-time, full-stack application that turns your **voice sentiment** into **Perlin-noise-based visual art**.  
Built with React, p5.js, and Deepgram for audio streaming + sentiment AI.

---

## 🧠 Overview

Your voice is streamed to Deepgram → transcribed → sent to a backend (FastAPI + OpenAI/Hugging Face) → analyzed for **sentiment (−1 to +1)** and **keywords**.  
These values drive the **color**, **motion speed**, and **pattern** of an evolving Perlin field.

| Sentiment | Color | Motion |
|------------|--------|--------|
| −1 | Red | Slow |
| 0 | Yellow | Balanced |
| +1 | Green | Fast |

---

## 🧩 Stack

- 🎙️ **Deepgram Realtime API** – speech-to-text via WebSocket  
- 🧠 **FastAPI / OpenAI** – sentiment & keyword processing  
- 🎨 **React + p5.js (TypeScript)** – data-driven visualization  
- 💅 **Tailwind CSS** – minimal responsive design  

---

## 🌀 Visualization Modes

All patterns use Perlin or curl noise:

- **Flow Field** – smooth particle trails  
- **Perlin Warp** – noise-displaced color gradients  
- **Particle Swarm** – organic movement clouds  
- **Aurora Bands** – light-wave ribbons  

Speed and hue respond dynamically to sentiment intensity.

---

## ⚙️ Async Management & Error Handling

The app handles all network and audio errors gracefully:

- **Backend down / API fail** → red toast: *“⚠️ Sentiment analysis failed”*  
- **Slow AI response** → animated *“Analyzing…”* indicator  
- **WebSocket disconnect** → auto cleanup + user retry option  
- **Mic denied** → toast: *“🎤 Microphone access denied”*  

All states (`isLoading`, `isRecording`, `errorMessage`) are React-driven and non-blocking.  
Toasts auto-dismiss within 4–5s.

---

## 💫 User Flow

1. **Start Recording** → begin live mic stream  
2. Speak naturally and pause  
3. Deepgram finalizes text → backend processes  
4. Visualization updates with color, speed, and keywords  
5. **Stop** anytime to end session

---

## 🧰 Run Locally

### Backend
```bash
uvicorn server.main:app --reload
# exposes POST /api/v1/ai/process-text
