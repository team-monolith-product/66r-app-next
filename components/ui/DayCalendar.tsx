"use client";

import { useApp } from "@/components/AppContext";

export default function DayCalendar() {
  const { state } = useApp();
  const { completedDays, dayCount, character } = state;

  const accentColor = character?.color ?? "var(--gold)";

  return (
    <div className="glass-panel p-4">
      <h3 className="text-xs text-[var(--text-secondary)] tracking-widest uppercase mb-3">
        66일 달력
      </h3>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 66 }, (_, i) => {
          const day = i + 1;
          const isCompleted = completedDays.includes(day);
          const isCurrent = day === dayCount;
          const isFuture = day > dayCount;

          return (
            <div
              key={day}
              className="aspect-square rounded-sm flex items-center justify-center text-[8px] font-bold relative"
              style={{
                background: isCompleted
                  ? `${accentColor}55`
                  : isCurrent
                  ? `${accentColor}22`
                  : "rgba(255,255,255,0.05)",
                color: isCompleted
                  ? accentColor
                  : isCurrent
                  ? accentColor
                  : isFuture
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.4)",
                border: isCurrent ? `1px solid ${accentColor}88` : "none",
              }}
              title={`Day ${day}`}
            >
              {isCompleted ? "✓" : day}
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex gap-4 mt-3 text-[10px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ background: `${accentColor}55` }} />
          완료 ({completedDays.length})
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(255,255,255,0.05)" }} />
          미완료
        </div>
      </div>
    </div>
  );
}
