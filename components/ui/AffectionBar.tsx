"use client";

import { useAppStore, RELATIONSHIP_LEVELS, getRelationshipLevel } from "@/store/useAppStore";

interface AffectionBarProps {
  showLabel?: boolean;
}

export default function AffectionBar({ showLabel = true }: AffectionBarProps) {
  const affection = useAppStore((s) => s.affection);
  const character = useAppStore((s) => s.character);

  const level   = getRelationshipLevel(affection);
  const levelName = RELATIONSHIP_LEVELS.find((r) => r.level === level)?.name ?? "";
  const currentThreshold = RELATIONSHIP_LEVELS.find((r) => r.level === level)?.threshold ?? 0;
  const nextThreshold = RELATIONSHIP_LEVELS.find((r) => r.level === level + 1)?.threshold ?? 660;
  const percent = level >= 8
    ? 100
    : Math.round(((affection - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

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
            {affection - currentThreshold}
            <span className="opacity-50">/{nextThreshold - currentThreshold}</span>
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
