"use client";

import { useAppStore } from "@/store/useAppStore";

interface AffectionBarProps {
  showLabel?: boolean;
}

export default function AffectionBar({ showLabel = true }: AffectionBarProps) {
  const affection = useAppStore((s) => s.affection);
  const character = useAppStore((s) => s.character);

  const percent = Math.round((affection / 660) * 100);
  const level   = Math.floor(affection / 66) + 1; // 1~10 레벨

  const levelNames = ["낯선", "인식", "관심", "호기심", "친밀", "유대", "신뢰", "특별", "애정", "연인"];
  const levelName  = levelNames[Math.min(level - 1, 9)];

  const accentColor = character?.color ?? "var(--gold)";

  return (
    <div className="px-4 py-2">
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-secondary)]">호감도</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${accentColor}22`,
                color: accentColor,
                border: `1px solid ${accentColor}44`,
              }}
            >
              Lv.{level} {levelName}
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            {affection}
            <span className="opacity-50">/660</span>
          </span>
        </div>
      )}

      <div className="affection-track">
        <div
          className="affection-fill"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${accentColor} 0%, var(--gold) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
