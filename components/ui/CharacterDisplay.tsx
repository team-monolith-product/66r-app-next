"use client";

import { useState } from "react";
import { type CharacterData } from "@/components/AppContext";
import Live2DViewer from "./Live2DViewer";

interface CharacterDisplayProps {
  character: CharacterData;
  size?: "sm" | "md" | "lg";
  mood?: "neutral" | "happy" | "shy" | "sad";
}

export default function CharacterDisplay({
  character,
  size = "md",
  mood = "neutral",
}: CharacterDisplayProps) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: character.color }}
      />

      {/* Character wrapper — CSS zoom */}
      <div
        style={{
          transform: zoomed ? "scale(1.7)" : "scale(1)",
          transformOrigin: "50% 28%",
          transition: "transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1)",
          position: "relative",
          zIndex: zoomed ? 50 : "auto",
          filter: `drop-shadow(0 0 ${zoomed ? "28px" : "12px"} ${character.color}${zoomed ? "aa" : "66"})`,
          cursor: "pointer",
        }}
        onClick={() => setZoomed((v) => !v)}
      >
        <Live2DViewer size={size} mood={mood} focus={zoomed ? "full" : "upper"} />
      </div>

      <div
        className="mt-2 text-xs font-bold tracking-widest"
        style={{ color: character.color }}
      >
        {character.name}
      </div>
    </div>
  );
}
