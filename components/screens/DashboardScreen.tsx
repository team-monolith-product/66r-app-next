"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import BottomNav from "@/components/ui/BottomNav";
import AffectionBar from "@/components/ui/AffectionBar";
import DayCalendar from "@/components/ui/DayCalendar";
import {
  Dumbbell, BookOpen, Wind, Droplets, Sunrise, PenLine, Palette, Leaf,
  Calendar, CheckCircle, Flame, TrendingUp, Sparkles, Heart,
  Check, X,
} from "lucide-react";
import type { ReactNode } from "react";

const PRESETS = [
  { icon: <Dumbbell size={13} />, label: "운동하기" },
  { icon: <BookOpen size={13} />, label: "독서하기" },
  { icon: <Wind size={13} />, label: "명상하기" },
  { icon: <Droplets size={13} />, label: "물 2L 마시기" },
  { icon: <Sunrise size={13} />, label: "일찍 일어나기" },
  { icon: <PenLine size={13} />, label: "일기 쓰기" },
  { icon: <Palette size={13} />, label: "그림 그리기" },
  { icon: <Leaf size={13} />, label: "산책하기" },
];

const MAX_HABITS = 5;

export default function DashboardScreen() {
  useRouteGuard("setup-complete");

  const dayCount = useAppStore((s) => s.dayCount);
  const streak = useAppStore((s) => s.streak);
  const completedDays = useAppStore((s) => s.completedDays);
  const habits = useAppStore((s) => s.habits);
  const todayHabitChecks = useAppStore((s) => s.todayHabitChecks);
  const character = useAppStore((s) => s.character);
  const currency = useAppStore((s) => s.currency);
  const affection = useAppStore((s) => s.affection);
  const setHabits = useAppStore((s) => s.setHabits);

  const [addOpen, setAddOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const completionRate = Math.round((completedDays.length / Math.max(dayCount - 1, 1)) * 100);
  const level = Math.floor(affection / 66) + 1;

  const stats: { label: string; value: string; icon: ReactNode }[] = [
    { label: "진행 일수",   value: `${dayCount}/66`,            icon: <Calendar size={18} /> },
    { label: "완료 일수",   value: `${completedDays.length}일`, icon: <CheckCircle size={18} /> },
    { label: "현재 스트릭", value: `${streak}일`,               icon: <Flame size={18} /> },
    { label: "달성률",      value: `${completionRate}%`,        icon: <TrendingUp size={18} /> },
    { label: "보유 코인",   value: `${currency}`,               icon: <Sparkles size={18} /> },
    { label: "호감도 레벨", value: `Lv.${level}`,               icon: <Heart size={18} /> },
  ];

  const removeHabit = (habit: string) => {
    const next = habits.filter((h) => h !== habit);
    setHabits(next);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(habits[index]);
  };

  const confirmEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editValue.trim();
    if (!trimmed) { cancelEdit(); return; }
    if (habits.includes(trimmed) && habits[editingIndex] !== trimmed) { cancelEdit(); return; }
    const next = [...habits];
    next[editingIndex] = trimmed;
    setHabits(next);
    setEditingIndex(null);
  };

  const cancelEdit = () => setEditingIndex(null);

  const addHabit = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed || habits.includes(trimmed) || habits.length >= MAX_HABITS) return;
    setHabits([...habits, trimmed]);
    setCustomInput("");
  };

  const handleCustomAdd = () => {
    addHabit(customInput);
  };

  const availablePresets = PRESETS.filter((p) => !habits.includes(p.label));
  const canAdd = habits.length < MAX_HABITS;

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col overflow-hidden">

      {/* 헤더 */}
      <div className="px-5 pt-12 pb-3 z-10">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">기록</h2>
      </div>

      {/* 호감도 바 */}
      <div className="z-10">
        <AffectionBar />
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-24 z-10 flex flex-col gap-4">

        {/* ── 내 습관 ── */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">내 습관</h3>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {habits.length}/{MAX_HABITS}개 · 오늘 {todayHabitChecks.filter(Boolean).length}/{habits.length} 완료
              </p>
            </div>
            {canAdd && (
              <button
                onClick={() => setAddOpen((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{
                  background: addOpen
                    ? `${character?.color ?? "#4aacef"}22`
                    : `${character?.color ?? "#4aacef"}14`,
                  color: character?.color ?? "#4aacef",
                  border: `1px solid ${character?.color ?? "#4aacef"}44`,
                }}
              >
                {addOpen ? <><X size={11} strokeWidth={2.5} /> 닫기</> : "+ 추가"}
              </button>
            )}
          </div>

          {/* 습관 목록 */}
          {habits.length === 0 ? (
            <div className="px-4 pb-4 text-center">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                아직 습관이 없어요. 추가해보세요!
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "rgba(160,210,240,0.2)" }}>
              {habits.map((habit, i) => {
                const checked = todayHabitChecks[i] ?? false;
                const isEditing = editingIndex === i;
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    {/* 체크 상태 */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={
                        checked
                          ? {
                              background: `${character?.color ?? "#4aacef"}22`,
                              border: `1.5px solid ${character?.color ?? "#4aacef"}`,
                              color: character?.color ?? "#4aacef",
                            }
                          : {
                              background: "rgba(0,0,0,0.04)",
                              border: "1.5px solid rgba(160,210,240,0.4)",
                              color: "transparent",
                            }
                      }
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>

                    {/* 습관 이름 or 편집 인풋 */}
                    {isEditing ? (
                      <input
                        autoFocus
                        maxLength={20}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.nativeEvent.isComposing) confirmEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        onBlur={confirmEdit}
                        className="flex-1 text-sm font-medium bg-transparent outline-none border-b"
                        style={{
                          color: "var(--text-primary)",
                          borderColor: character?.color ?? "#4aacef",
                        }}
                      />
                    ) : (
                      <button
                        className="flex-1 text-left text-sm font-medium"
                        style={{
                          color: checked ? "var(--text-secondary)" : "var(--text-primary)",
                          textDecoration: checked ? "line-through" : "none",
                          opacity: checked ? 0.6 : 1,
                        }}
                        onClick={() => startEdit(i)}
                      >
                        {habit}
                      </button>
                    )}

                    {/* 편집 중 확인/취소, 평소엔 삭제 */}
                    {isEditing ? (
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onMouseDown={(e) => { e.preventDefault(); confirmEdit(); }}
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: `${character?.color ?? "#4aacef"}22`, color: character?.color ?? "#4aacef" }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>
                        <button
                          onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }}
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(0,0,0,0.06)", color: "var(--text-secondary)" }}
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => removeHabit(habit)}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                        style={{
                          background: "rgba(239,100,100,0.08)",
                          color: "#f87171",
                          border: "1px solid rgba(239,100,100,0.2)",
                        }}
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 습관 추가 패널 */}
          {addOpen && (
            <div
              className="px-4 pb-4 pt-3 flex flex-col gap-3"
              style={{ borderTop: "1px solid rgba(160,210,240,0.25)" }}
            >
              {/* 직접 입력 */}
              <div
                className="flex gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(160,210,240,0.35)" }}
              >
                <input
                  type="text"
                  placeholder="습관 직접 입력..."
                  maxLength={20}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleCustomAdd()}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
                <button
                  onClick={handleCustomAdd}
                  disabled={!customInput.trim()}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    background: customInput.trim()
                      ? character?.color ?? "#4aacef"
                      : "rgba(0,0,0,0.08)",
                    color: customInput.trim() ? "#fff" : "var(--text-secondary)",
                  }}
                >
                  추가
                </button>
              </div>

              {/* 프리셋 추천 */}
              {availablePresets.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {availablePresets.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => addHabit(p.label)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95"
                      style={{
                        background: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(160,210,240,0.5)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 스탯 그리드 ── */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="glass-panel p-3 rounded-2xl text-center">
              <div className="flex justify-center mb-1" style={{ color: character?.color ?? "var(--gold)" }}>
                {s.icon}
              </div>
              <div className="font-bold text-base text-[var(--text-primary)]">{s.value}</div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── 달력 ── */}
        <DayCalendar />

        {/* ── 주간 요약 ── */}
        <div className="glass-panel p-4 rounded-2xl">
          <h3 className="text-xs text-[var(--text-secondary)] tracking-widest uppercase mb-3">
            최근 7일
          </h3>
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }, (_, i) => {
              const d = dayCount - 6 + i;
              const done = d > 0 && completedDays.includes(d);
              const past = d > 0 && d < dayCount;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full aspect-square rounded-lg flex items-center justify-center"
                    style={{
                      background: done
                        ? `${character?.color ?? "#3a90d4"}44`
                        : past
                        ? "rgba(239,100,100,0.18)"
                        : "rgba(160,210,240,0.12)",
                      border: done ? `1px solid ${character?.color ?? "#3a90d4"}66` : "none",
                    }}
                  >
                    {done
                      ? <Check size={12} strokeWidth={3} style={{ color: character?.color ?? "#3a90d4" }} />
                      : past
                      ? <X size={12} strokeWidth={2.5} style={{ color: "#f87171" }} />
                      : <span className="text-[10px]" style={{ color: "rgba(160,210,240,0.5)" }}>·</span>
                    }
                  </div>
                  <span className="text-[9px] text-[var(--text-secondary)]">
                    {d > 0 ? `D${d}` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
