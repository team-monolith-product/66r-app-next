"use client";

import { useApp } from "@/components/AppContext";
import BottomNav from "@/components/ui/BottomNav";
import AffectionBar from "@/components/ui/AffectionBar";
import DayCalendar from "@/components/ui/DayCalendar";

export default function DashboardScreen() {
  const { state } = useApp();
  const { dayCount, streak, completedDays, habit, character, currency, affection } = state;

  const completionRate = Math.round((completedDays.length / Math.max(dayCount - 1, 1)) * 100);
  const level = Math.floor(affection / 66) + 1;

  const stats = [
    { label: "진행 일수",   value: `${dayCount}/66`,         icon: "◈" },
    { label: "완료 일수",   value: `${completedDays.length}일`, icon: "✓" },
    { label: "현재 스트릭", value: `${streak}일`,              icon: "🔥" },
    { label: "달성률",      value: `${completionRate}%`,       icon: "★" },
    { label: "보유 코인",   value: `${currency}`,              icon: "✦" },
    { label: "호감도 레벨", value: `Lv.${level}`,              icon: "♡" },
  ];

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col overflow-hidden">

      {/* 헤더 */}
      <div className="px-5 pt-12 pb-3 z-10">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">대시보드</h2>
        {habit && (
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            목표: <span style={{ color: character?.color ?? "var(--gold)" }}>{habit}</span>
          </p>
        )}
      </div>

      {/* 호감도 바 */}
      <div className="z-10">
        <AffectionBar />
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-24 z-10 flex flex-col gap-4">

        {/* 스탯 그리드 */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="glass-panel p-3 rounded-2xl text-center">
              <div
                className="text-lg mb-1"
                style={{ color: character?.color ?? "var(--gold)" }}
              >
                {s.icon}
              </div>
              <div className="font-bold text-base text-[var(--text-primary)]">{s.value}</div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 달력 */}
        <DayCalendar />

        {/* 주간 요약 */}
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
                    className="w-full aspect-square rounded-lg flex items-center justify-center text-xs"
                    style={{
                      background: done
                        ? `${character?.color ?? "#3a90d4"}44`
                        : past
                        ? "rgba(239,100,100,0.18)"
                        : "rgba(160,210,240,0.12)",
                      border: done ? `1px solid ${character?.color ?? "#3a90d4"}66` : "none",
                    }}
                  >
                    {done ? "✓" : past ? "✗" : "·"}
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
