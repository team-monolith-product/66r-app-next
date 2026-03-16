"use client";

import { useAppStore } from "@/store/useAppStore";

export default function TopStatusBar() {
  const dayCount = useAppStore((s) => s.dayCount);
  const streak = useAppStore((s) => s.streak);
  const currency = useAppStore((s) => s.currency);

  return (
    <div className="flex items-center justify-between px-4 py-2 glass-panel rounded-xl mx-3 mt-3">
      {/* DAY 카운터 */}
      <div className="flex flex-col items-center min-w-[56px]">
        <span className="text-[10px] text-[var(--text-secondary)] tracking-widest uppercase">Day</span>
        <span className="font-cinzel text-[var(--gold)] font-bold text-base leading-tight">
          {dayCount}
          <span className="text-[10px] text-[var(--text-secondary)] font-normal">/66</span>
        </span>
      </div>

      {/* 구분선 */}
      <div className="w-px h-8 bg-white/10" />

      {/* 스트릭 */}
      <div className="flex flex-col items-center min-w-[56px]">
        <span className="text-[10px] text-[var(--text-secondary)] tracking-widest uppercase">Streak</span>
        <div className="flex items-center gap-1">
          <span className="text-base">🔥</span>
          <span className="font-bold text-[var(--gold-light)] text-base leading-tight">{streak}</span>
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-px h-8 bg-white/10" />

      {/* 재화 */}
      <div className="flex flex-col items-center min-w-[56px]">
        <span className="text-[10px] text-[var(--text-secondary)] tracking-widest uppercase">Coins</span>
        <div className="flex items-center gap-1">
          <span className="text-sm">✦</span>
          <span className="font-bold text-[var(--gold)] text-base leading-tight">{currency}</span>
        </div>
      </div>
    </div>
  );
}
