"use client";

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
  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Glow effect behind canvas */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: character.color }}
      />
      {/* Live2D canvas */}
      <div style={{ filter: `drop-shadow(0 0 12px ${character.color}66)` }}>
        <Live2DViewer size={size} mood={mood} />
      </div>
      {/* Character name */}
      <div className="mt-2 text-xs font-bold tracking-widest" style={{ color: character.color }}>
        {character.name}
      </div>
    </div>
  );
}
