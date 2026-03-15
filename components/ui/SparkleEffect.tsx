"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  symbol: string;
}

const SYMBOLS = ["✦", "✧", "⋆", "★", "·", "✨"];

interface SparkleEffectProps {
  count?: number;
  active?: boolean;
}

export default function SparkleEffect({
  count = 12,
  active = true,
}: SparkleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const list: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 8,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    }));
    setParticles(list);
  }, [count, active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            color: Math.random() > 0.5 ? "var(--gold)" : "rgba(167,139,250,0.8)",
            animation: `sparkle-twinkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}

/* 버스트 — 인증 성공 시 사용 */
interface SparkleBurstProps {
  onEnd?: () => void;
}

export function SparkleBurst({ onEnd }: SparkleBurstProps) {
  const [visible, setVisible] = useState(true);
  const particles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,
    y: 20 + Math.random() * 60,
    size: Math.random() * 14 + 10,
    delay: Math.random() * 0.5,
    duration: Math.random() * 0.8 + 0.6,
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  }));

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onEnd?.();
    }, 1800);
    return () => clearTimeout(t);
  }, [onEnd]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top:  `${p.y}%`,
            fontSize: `${p.size}px`,
            color: Math.random() > 0.5 ? "var(--gold)" : "#f472b6",
            animation: `sparkle-float ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
