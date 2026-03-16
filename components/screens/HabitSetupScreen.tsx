"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
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

const MAX_HABITS = 5;

export default function HabitSetupScreen() {
  const router = useRouter();
  const setHabits = useAppStore((s) => s.setHabits);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [mode, setMode] = useState<"preset" | "custom">("preset");

  const togglePreset = (label: string) => {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((h) => h !== label)
        : prev.length < MAX_HABITS
        ? [...prev, label]
        : prev
    );
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed || selected.includes(trimmed) || selected.length >= MAX_HABITS) return;
    setSelected((prev) => [...prev, trimmed]);
    setCustom("");
  };

  const removeHabit = (habit: string) => {
    setSelected((prev) => prev.filter((h) => h !== habit));
  };

  const handleConfirm = () => {
    if (selected.length === 0) return;
    setHabits(selected);
    router.push("/setup/character");
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
          66일 동안 매일 실천할 습관을 골라보세요 (최대 {MAX_HABITS}개)
        </p>
      </div>

      {/* 선택된 습관 칩 */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6 pb-3 z-10">
          {selected.map((habit) => (
            <div
              key={habit}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
              style={{
                background: "rgba(74,172,239,0.15)",
                border: "1px solid rgba(74,172,239,0.6)",
                color: "#1a6fa8",
              }}
            >
              <span>{habit}</span>
              <button
                onClick={() => removeHabit(habit)}
                className="text-xs opacity-60 hover:opacity-100 leading-none"
                style={{ lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2 px-6 mb-4 z-10">
        {(["preset", "custom"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMode(t)}
            className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
            style={
              mode === t
                ? { background: "#4aacef", color: "#fff", boxShadow: "0 2px 10px rgba(74,172,239,0.35)" }
                : { background: "rgba(255,255,255,0.70)", color: "var(--text-secondary)", border: "1px solid rgba(160,210,240,0.5)" }
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
            {PRESETS.map((p) => {
              const isSelected = selected.includes(p.label);
              const isDisabled = !isSelected && selected.length >= MAX_HABITS;
              return (
                <button
                  key={p.label}
                  onClick={() => !isDisabled && togglePreset(p.label)}
                  className="glass-panel p-4 text-left rounded-2xl transition-all"
                  style={
                    isSelected
                      ? {
                          border: "1px solid rgba(74,172,239,0.8)",
                          background: "rgba(74,172,239,0.12)",
                          boxShadow: "0 0 16px rgba(74,172,239,0.25)",
                        }
                      : isDisabled
                      ? { opacity: 0.4 }
                      : {}
                  }
                >
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">{p.label}</div>
                  {isSelected && (
                    <div className="text-xs mt-1 font-bold" style={{ color: "#4aacef" }}>✓ 선택됨</div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="pb-4">
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="예: 매일 팔굽혀펴기 20개"
                  maxLength={30}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                  className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-base outline-none"
                />
                <button
                  onClick={addCustom}
                  disabled={!custom.trim() || selected.length >= MAX_HABITS}
                  className="text-sm font-bold px-3 py-1 rounded-xl transition-all"
                  style={{
                    background: custom.trim() && selected.length < MAX_HABITS ? "#4aacef" : "rgba(0,0,0,0.08)",
                    color: custom.trim() && selected.length < MAX_HABITS ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  추가
                </button>
              </div>
              <div className="text-right text-xs text-[var(--text-secondary)] mt-2">
                {custom.length}/30
              </div>
            </div>
            {selected.length >= MAX_HABITS && (
              <p className="text-xs text-center mt-3" style={{ color: "#cc6600" }}>
                최대 {MAX_HABITS}개까지 추가할 수 있어요
              </p>
            )}
          </div>
        )}
      </div>

      {/* 확인 버튼 */}
      <div className="px-6 pb-10 pt-4 z-10">
        <GameButton
          fullWidth
          size="lg"
          disabled={selected.length === 0}
          onClick={handleConfirm}
          style={{ opacity: selected.length > 0 ? 1 : 0.4 }}
        >
          {selected.length > 0
            ? `${selected.length}개 습관 시작하기`
            : "습관을 선택하세요"}
        </GameButton>
      </div>
    </div>
  );
}
