# 🎧 Sentiment Aura  
**Real-time Speech Sentiment Visualization Powered by Perlin Noise**

[🌐 Live Demo](https://sentiment-aura-five.vercel.app) • [🧠 Backend API](https://sentiment-aura-vc6b.onrender.com)

---

## 🚀 Overview  
**Sentiment Aura** transforms spoken emotion into generative art.  
It listens to your voice, analyzes sentiment using AI, and visualizes it through animated Perlin noise patterns that shift in color, speed, and form based on emotional tone.

---

## ✨ Key Features  
- 🎙️ **Real-time transcription** via Deepgram WebSocket streaming  
- 🎨 **Perlin-based generative visuals** (Flow Field, Warp, Swarm, Aurora)  
- 💡 **Emotion-driven color transitions** (red → orange → yellow → green)  
- ⚙️ **Robust async & error handling** (network, API, mic, offline)  
- 🔒 **Secure groq proxy backend** for sentiment + keyword extraction  
- 🌈 **Minimal, modern, borderless UI** built with React + TailwindCSS  
- 🧩 **Full TypeScript stack** (Vite + Express + OpenAPI Docs)

---

## 🧠 Architecture  

**Frontend (Vite + React)**  
- WebSocket → Deepgram (real-time speech-to-text)  
- REST → Backend `/api/v1/ai` (sentiment & keywords)  

**Backend (Node + Express)**  
- `/api/v1/ai/process-text` → groq for sentiment + keyword analysis  
- `/docs` → Swagger API documentation  

---

## 🛠️ Quick Start  

### 1️⃣ Clone the Repo  
```
git clone https://github.com/lakshdhamija/sentiment-aura
cd sentiment-aura
```

### 2️⃣ Backend Setup  
```
cd backend
cp .env.example .env
npm install
npm run build
npm start
```

### 3️⃣ Frontend Setup  
```
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4️⃣ Access Locally  
- Frontend → http://localhost:5173  
- Backend → http://localhost:8000  

---

## 🧩 Tech Stack  
**Frontend:** React, TypeScript, Vite, TailwindCSS, p5.js  
**Backend:** Node.js, Express, TypeScript, groq API, Swagger  
**Speech Engine:** Deepgram  
**Deployment:** Vercel (Frontend + Backend)  
**CI/CD:** GitHub Actions  

---

## 📈 Future Improvements  
- ✅ Ephemeral token flow for Deepgram (production-grade security)  
- 🎨 Smoother Perlin transitions between sentiment shifts  
- 🔊 Ambient visualizer overlay for continuous audio input  
- 🧵 Voice-to-text journaling mode  

---

## 📜 License  
MIT © [Laksh Dhamija](https://github.com/lakshdhamija)

