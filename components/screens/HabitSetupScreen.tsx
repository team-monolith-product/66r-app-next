"use client";

import { useState } from "react";
import { useApp } from "@/components/AppContext";
import GameButton from "@/components/ui/GameButton";
import SparkleEffect from "@/components/ui/SparkleEffect";

const PRESETS = [
  { icon: "🏃", label: "운동하기" },
  { icon: "📚", label: "독서하기" },
  { icon: "🧘", label: "명상하기" },
  { icon: "💧", label: "물 2L 마시기" },
  { icon: "🌅", label: "일찍 일어나기" },
  { icon: "✍️", label: "일기 쓰기" },
  { icon: "🎨", label: "그림 그리기" },
  { icon: "🌿", label: "산책하기" },
];

export default function HabitSetupScreen() {
  const { dispatch } = useApp();
  const [selected, setSelected] = useState<string>("");
  const [custom, setCustom] = useState("");
  const [mode, setMode] = useState<"preset" | "custom">("preset");

  const habit = mode === "custom" ? custom.trim() : selected;

  const handleConfirm = () => {
    if (!habit) return;
    dispatch({ type: "SET_HABIT", habit });
    dispatch({ type: "SET_SCREEN", screen: "characterSelect" });
  };

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col overflow-hidden">
      <SparkleEffect count={8} />

      {/* 헤더 */}
      <div className="px-6 pt-12 pb-4 z-10">
        <p className="text-[var(--text-secondary)] text-xs tracking-widest uppercase mb-1">Step 1 / 2</p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          어떤 습관을<br />만들고 싶나요?
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-2">
          66일 동안 매일 실천할 습관을 선택하세요
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 px-6 mb-4 z-10">
        {(["preset", "custom"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMode(t)}
            className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
            style={
              mode === t
                ? { background: "var(--gold)", color: "#1a0e00" }
                : { background: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }
            }
          >
            {t === "preset" ? "추천 습관" : "직접 입력"}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 z-10">
        {mode === "preset" ? (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setSelected(p.label)}
                className="glass-panel p-4 text-left rounded-2xl transition-all"
                style={
                  selected === p.label
                    ? {
                        border: "1px solid var(--gold)",
                        background: "rgba(240,192,64,0.1)",
                        boxShadow: "0 0 16px rgba(240,192,64,0.2)",
                      }
                    : {}
                }
              >
                <div className="text-2xl mb-2">{p.icon}</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{p.label}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="pb-4">
            <div className="glass-panel p-4 rounded-2xl">
              <input
                type="text"
                placeholder="예: 매일 팔굽혀펴기 20개"
                maxLength={30}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-base outline-none"
              />
              <div className="text-right text-xs text-[var(--text-secondary)] mt-2">
                {custom.length}/30
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 확인 버튼 */}
      <div className="px-6 pb-10 pt-4 z-10">
        <GameButton
          fullWidth
          size="lg"
          disabled={!habit}
          onClick={handleConfirm}
          style={{ opacity: habit ? 1 : 0.4 }}
        >
          {habit ? `"${habit}" 선택` : "습관을 선택하세요"}
        </GameButton>
      </div>
    </div>
  );
}
