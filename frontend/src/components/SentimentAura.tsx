import Sketch from "react-p5";
import { useRef, useEffect } from "react";

type Pattern = "flow" | "warp" | "swarm" | "aurora";
interface Props {
  sentiment: number | null;
  pattern: Pattern;
  theme?: "light" | "dark";
}

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Hue: -1 → red, 0 → yellow, +1 → green */
function hueFromSentiment(p5: any, s: number) {
  if (s <= -1) return 0;
  if (s < -0.3) return p5.map(s, -1, -0.3, 0, 25);
  if (s < 0.3) return p5.map(s, -0.3, 0.3, 25, 60);
  return p5.map(s, 0.3, 1, 60, 120);
}

/* Curl noise (true Perlin flow) */
function curlNoise(p5: any, x: number, y: number, t: number, scale: number) {
  const eps = 1e-3;
  const n1 = p5.noise((x + eps) * scale, y * scale, t);
  const n2 = p5.noise((x - eps) * scale, y * scale, t);
  const n3 = p5.noise(x * scale, (y + eps) * scale, t);
  const n4 = p5.noise(x * scale, (y - eps) * scale, t);
  const dx = (n1 - n2) / (2 * eps);
  const dy = (n3 - n4) / (2 * eps);
  return { x: dy, y: -dx };
}

export default function SentimentAura({
  sentiment,
  pattern,
  theme = "dark",
}: Props) {
  const sTarget = useRef(0);
  const sSmooth = useRef(0);
  const spdSmooth = useRef(1);
  const animTime = useRef(0);
  const particlesRef = useRef<
    { x: number; y: number; px: number; py: number; speed: number }[]
  >([]);
  const ready = useRef(false);
  const warpLayerRef = useRef<any>(null);

  useEffect(() => {
    if (sentiment != null) sTarget.current = clamp(sentiment, -1, 1);
  }, [sentiment]);

  return (
    <div className="fixed inset-0 z-10">
      <Sketch
        setup={(p5: any, parent: any) => {
          p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.P2D).parent(
            parent
          );
          p5.colorMode(p5.HSL, 360, 100, 100, 100);
          p5.noiseDetail(4, 0.5);
          p5.background(0, 0, theme === "dark" ? 5 : 95);

          const parts = [];
          for (let i = 0; i < 1400; i++) {
            const x = p5.random(p5.width);
            const y = p5.random(p5.height);
            parts.push({ x, y, px: x, py: y, speed: p5.random(0.8, 1.4) });
          }
          particlesRef.current = parts;
          ready.current = true;
        }}
        draw={(p5: any) => {
          if (!ready.current) return;

          const dt = Math.min(Math.max(p5.deltaTime / 1000, 0), 0.05);

          sSmooth.current = lerp(
            sSmooth.current,
            sTarget.current,
            1 - Math.exp(-4 * dt)
          );
          const s = sSmooth.current;
          const absS = Math.abs(s);
          const hue = hueFromSentiment(p5, s);

          const spdTarget = p5.map(s, -1, 1, 0.35, 2.2);
          spdSmooth.current = lerp(
            spdSmooth.current,
            spdTarget,
            1 - Math.exp(-3 * dt)
          );
          const spd = spdSmooth.current;

          animTime.current += dt * spd;
          const tShared = animTime.current;

          p5.blendMode(p5.BLEND);
          p5.noStroke();
          p5.fill(0, 0, 0, 20);
          p5.rect(0, 0, p5.width, p5.height);

          if (pattern === "flow") drawFlow(p5, hue, absS, spd, tShared);
          else if (pattern === "warp")
            drawPerlinWarp(p5, hue, absS, spd, tShared);
          else if (pattern === "swarm") drawSwarm(p5, hue, absS, spd, tShared);
          else drawAurora(p5, hue, absS, spd, tShared);

          function drawFlow(
            p5: any,
            hue: number,
            absS: number,
            spd: number,
            tShared: number
          ) {
            const parts = particlesRef.current;
            const t = tShared * 0.18;
            const scale = 0.0014;
            const stepLen = 2.4;
            const baseDrift = 0.15;

            p5.stroke(hue, 92, 52 + absS * 30, 72);
            p5.strokeWeight(2.1 + absS * 1.2);

            for (const p of parts) {
              p.px = p.x;
              p.py = p.y;

              let v1 = curlNoise(p5, p.x, p.y, t, scale);
              const m1 = Math.hypot(v1.x, v1.y) || 1;
              v1.x =
                v1.x / m1 +
                baseDrift * (p5.noise(p.x * 0.0007, p.y * 0.0007) - 0.5);
              v1.y =
                v1.y / m1 +
                baseDrift * (p5.noise(p.y * 0.0007, p.x * 0.0007) - 0.5);

              const midx = p.x + v1.x * (stepLen * 0.5);
              const midy = p.y + v1.y * (stepLen * 0.5);
              let v2 = curlNoise(p5, midx, midy, t, scale);
              const m2 = Math.hypot(v2.x, v2.y) || 1;
              v2.x = v2.x / m2;
              v2.y = v2.y / m2;

              p.x += v2.x * stepLen * spd * p.speed;
              p.y += v2.y * stepLen * spd * p.speed;

              if (p.x < 0 || p.x > p5.width || p.y < 0 || p.y > p5.height) {
                p.x = p5.random(p5.width);
                p.y = p5.random(p5.height);
                p.px = p.x;
                p.py = p.y;
              }
              p5.line(p.px, p.py, p.x, p.y);
            }
          }

          /* ───────────── OPTIMIZED PERLIN WARP ───────────── */
          function drawPerlinWarp(
            p5: any,
            hue: number,
            absS: number,
            spd: number,
            tShared: number
          ) {
            let warpLayer = warpLayerRef.current;
            if (
              !warpLayer ||
              warpLayer.width !== p5.width ||
              warpLayer.height !== p5.height
            ) {
              warpLayer = p5.createGraphics(p5.width, p5.height, p5.P2D);
              warpLayer.colorMode(p5.HSL, 360, 100, 100, 100);
              warpLayerRef.current = warpLayer;
            }

            const scale = 0.0015; // noise scale
            const t = tShared * 0.4;
            const fade = 18; // lower = more trails

            // Fade over previous frame
            warpLayer.noStroke();
            warpLayer.fill(0, 0, 0, fade);
            warpLayer.rect(0, 0, warpLayer.width, warpLayer.height);

            const cols = 80;
            const rows = 60;
            const xStep = p5.width / cols;
            const yStep = p5.height / rows;

            warpLayer.noStroke();

            for (let y = 0; y < p5.height; y += yStep) {
              for (let x = 0; x < p5.width; x += xStep) {
                const n = p5.noise(x * scale, y * scale, t);
                const ang = n * p5.TWO_PI * 2.0;
                const r = 35 + absS * 45;
                const dx = Math.cos(ang) * r * 0.4 * spd;
                const dy = Math.sin(ang) * r * 0.4 * spd;

                const h = hue + (n - 0.5) * 80;
                const s = 85;
                const l = 30 + n * 40;
                const a = 35 + absS * 40;

                warpLayer.fill(h, s, l, a);
                warpLayer.ellipse(x + dx, y + dy, 10 + absS * 4);
              }
            }

            // Draw buffer on canvas
            p5.image(warpLayer, 0, 0);
          }

          function drawSwarm(
            p5: any,
            hue: number,
            absS: number,
            _spd: number,
            tShared: number
          ) {
            const count = 260;
            const time = tShared;
            p5.noFill();
            p5.stroke(hue, 85, 55 + absS * 25, 60);
            p5.strokeWeight(1.6 + absS);
            for (let i = 0; i < count; i++) {
              const x = p5.noise(i, time * 0.6) * p5.width;
              const y = p5.noise(i + 999, time * 0.7) * p5.height;
              const size = 9 + absS * 12;
              p5.ellipse(x, y, size, size * 0.72);
            }
          }

          function drawAurora(
            p5: any,
            hue: number,
            absS: number,
            _spd: number,
            tShared: number
          ) {
            const layers = 5;
            const t = tShared * 0.1;
            p5.noFill();
            for (let i = 0; i < layers; i++) {
              p5.beginShape();
              for (let x = 0; x <= p5.width; x += 10) {
                const y =
                  p5.height * (0.3 + i * 0.12) +
                  (p5.noise(x * 0.002, i, t) - 0.5) * 300;
                p5.stroke(hue, 80, 55 + i * 5, 40);
                p5.vertex(x, y);
              }
              p5.endShape();
            }
          }
        }}
        windowResized={(p5: any) => {
          p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
          p5.background(0, 0, theme === "dark" ? 5 : 95);
        }}
      />
    </div>
  );
}
