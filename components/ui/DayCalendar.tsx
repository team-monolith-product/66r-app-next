"use client";

import { useAppStore } from "@/store/useAppStore";

export default function DayCalendar() {
  const completedDays = useAppStore((s) => s.completedDays);
  const dayCount = useAppStore((s) => s.dayCount);
  const character = useAppStore((s) => s.character);

  const accentColor = character?.color ?? "#3a90d4";

  return (
    <div className="glass-panel p-4">
      <h3 className="text-xs tracking-widest uppercase mb-3" style={{ color: "#7a9bb5" }}>
        66일 달력
      </h3>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 66 }, (_, i) => {
          const day       = i + 1;
          const isCompleted = completedDays.includes(day);
          const isCurrent   = day === dayCount;
          const isFuture    = day > dayCount;

          return (
            <div
              key={day}
              className="aspect-square rounded-sm flex items-center justify-center text-[8px] font-bold"
              style={{
                background: isCompleted
                  ? `${accentColor}44`
                  : isCurrent
                  ? `${accentColor}18`
                  : "rgba(160,210,240,0.12)",
                color: isCompleted
                  ? accentColor
                  : isCurrent
                  ? accentColor
                  : isFuture
                  ? "rgba(120,170,210,0.4)"
                  : "rgba(120,170,210,0.6)",
                border: isCurrent ? `1px solid ${accentColor}66` : "none",
              }}
              title={`Day ${day}`}
            >
              {isCompleted ? "✓" : day}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-3 text-[10px]" style={{ color: "#7a9bb5" }}>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ background: `${accentColor}44` }} />
          완료 ({completedDays.length})
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(160,210,240,0.12)" }} />
          미완료
        </div>
      </div>
    </div>
  );
}
