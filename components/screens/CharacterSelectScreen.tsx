"use client";

import { useState } from "react";
import { useApp, CHARACTERS, type CharacterData } from "@/components/AppContext";
import GameButton from "@/components/ui/GameButton";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import SparkleEffect from "@/components/ui/SparkleEffect";

export default function CharacterSelectScreen() {
  const { dispatch } = useApp();
  const [selected, setSelected] = useState<CharacterData>(CHARACTERS[0]);

  const handleConfirm = () => {
    dispatch({ type: "SET_CHARACTER", character: selected });
    dispatch({ type: "SET_SCREEN", screen: "home" });
  };

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col overflow-hidden">
      <SparkleEffect count={14} />

      {/* 헤더 */}
      <div className="px-6 pt-12 pb-2 z-10">
        <p className="text-[var(--text-secondary)] text-xs tracking-widest uppercase mb-1">Step 2 / 2</p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          함께할 동반자를<br />선택하세요
        </h1>
      </div>

      {/* 캐릭터 탭 */}
      <div className="flex gap-2 px-6 mt-3 z-10">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
            style={
              selected.id === c.id
                ? { background: `${c.color}33`, color: c.color, border: `1px solid ${c.color}66` }
                : { background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* 캐릭터 디스플레이 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 z-10 px-6">
        <div
          key={selected.id}
          className="animate-slide-up flex flex-col items-center gap-4"
        >
          <CharacterDisplay character={selected} size="lg" mood="neutral" />

          {/* 캐릭터 정보 */}
          <div className="glass-panel px-5 py-4 w-full max-w-xs text-center">
            <div
              className="font-cinzel text-lg font-bold mb-0.5"
              style={{ color: selected.color }}
            >
              {selected.name}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mb-3">
              {selected.title} · {selected.personality}
            </div>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
              "{selected.greeting}"
            </p>
          </div>
        </div>
      </div>

      {/* 확인 버튼 */}
      <div className="px-6 pb-10 z-10">
        <GameButton fullWidth size="lg" onClick={handleConfirm}>
          {selected.name}와 함께 시작하기
        </GameButton>
      </div>
    </div>
  );
}
