"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import GameButton from "@/components/ui/GameButton";
import { ArrowLeft, X, Plus } from "lucide-react";

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

const BG = "linear-gradient(180deg, #aad8f0 0%, #caeaf8 22%, #dff2fb 55%, #caeaf8 100%)";
const PANEL = {
  background: "rgba(255,255,255,0.90)",
  border: "1px solid rgba(160,210,240,0.55)",
  boxShadow: "0 2px 12px rgba(90,150,200,0.10)",
};

export default function HabitsScreen() {
  const router = useRouter();
  useRouteGuard("setup-complete");

  const habits = useAppStore((s) => s.habits);
  const todayHabitChecks = useAppStore((s) => s.todayHabitChecks);
  const character = useAppStore((s) => s.character);
  const debugPatch = useAppStore((s) => s.debugPatch);

  const [custom, setCustom] = useState("");
  const color = character?.color ?? "#4aacef";

  const removeHabit = (index: number) => {
    const newHabits = habits.filter((_, i) => i !== index);
    const newChecks = todayHabitChecks.filter((_, i) => i !== index);
    debugPatch({ habits: newHabits, todayHabitChecks: newChecks });
  };

  const addHabit = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed || habits.includes(trimmed) || habits.length >= MAX_HABITS) return;
    debugPatch({
      habits: [...habits, trimmed],
      todayHabitChecks: [...todayHabitChecks, false],
    });
    setCustom("");
  };

  const availablePresets = PRESETS.filter((p) => !habits.includes(p.label));

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: BG }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-4 z-10">
        <button
          onClick={() => router.push("/home")}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(160,210,240,0.5)" }}
        >
          <ArrowLeft size={18} color="#5a8fa8" />
        </button>
        <div>
          <h1 className="text-lg font-black" style={{ color: "#1a3a5c" }}>습관 목록</h1>
          <p className="text-[11px]" style={{ color: "#7a9bb5" }}>{habits.length}/{MAX_HABITS}개 설정됨</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6 flex flex-col gap-4 z-10">

        {/* 현재 습관 목록 */}
        <div className="rounded-2xl overflow-hidden" style={PANEL}>
          {habits.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2">
              <span className="text-3xl">🌱</span>
              <p className="text-sm" style={{ color: "#7a9bb5" }}>아직 습관이 없어요</p>
            </div>
          ) : (
            habits.map((habit, i) => (
              <div
                key={habit}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < habits.length - 1 ? "1px solid rgba(160,210,240,0.35)" : undefined }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
                >
                  {i + 1}
                </div>
                <span className="flex-1 text-sm font-bold" style={{ color: "#1a3a5c" }}>{habit}</span>
                <button
                  onClick={() => removeHabit(i)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: "rgba(248,113,113,0.10)", color: "#f87171" }}
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* 추가 섹션 */}
        {habits.length < MAX_HABITS && (
          <>
            {/* 직접 입력 */}
            <div>
              <p className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: "#7a9bb5" }}>직접 입력</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="새 습관 입력..."
                  maxLength={30}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHabit(custom)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.90)",
                    border: "1px solid rgba(160,210,240,0.55)",
                    color: "#1a3a5c",
                  }}
                />
                <button
                  onClick={() => addHabit(custom)}
                  disabled={!custom.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: custom.trim() ? color : "rgba(160,210,240,0.25)",
                    color: "#fff",
                  }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* 추천 습관 */}
            {availablePresets.length > 0 && (
              <div>
                <p className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: "#7a9bb5" }}>추천 습관</p>
                <div className="flex flex-wrap gap-2">
                  {availablePresets.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => addHabit(p.label)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                      style={PANEL}
                    >
                      <span>{p.icon}</span>
                      <span style={{ color: "#1a3a5c" }}>{p.label}</span>
                      <Plus size={13} style={{ color: "#7a9bb5" }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {habits.length >= MAX_HABITS && (
          <p className="text-xs text-center py-2" style={{ color: "#aabdd0" }}>
            최대 {MAX_HABITS}개까지 설정할 수 있어요. 기존 습관을 삭제하면 추가할 수 있어요.
          </p>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-4 pb-8 pt-2 z-10">
        <GameButton fullWidth onClick={() => router.push("/home")}>
          완료
        </GameButton>
      </div>
    </div>
  );
}
