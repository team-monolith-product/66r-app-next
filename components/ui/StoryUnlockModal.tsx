"use client";

import { BookOpen, CloudRain } from "lucide-react";
import GameButton from "@/components/ui/GameButton";
import { useAppStore } from "@/store/useAppStore";

interface Props {
  episodeId: number;
  onRead: () => void;
  onDismiss: () => void;
}

export default function StoryUnlockModal({ episodeId, onRead, onDismiss }: Props) {
  const character = useAppStore((s) => s.character);

  const isBadStory = episodeId === 0;
  const color = isBadStory ? "#94a3b8" : (character?.color ?? "#a78bfa");
  const Icon = isBadStory ? CloudRain : BookOpen;
  const badge = isBadStory ? "특별 에피소드" : `EPISODE ${episodeId}`;
  const title = isBadStory ? "7일의 침묵" : "새 스토리 해금!";
  const subtitle = isBadStory
    ? `${character?.name ?? "그 아이"}가 걱정하고 있어요.\n지금 이야기를 들어볼까요?`
    : `${character?.name ?? ""}와의 새로운 이야기가\n시작될 준비가 됐어요.`;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center px-8"
      style={{ background: "rgba(20, 50, 80, 0.52)" }}
      onClick={isBadStory ? undefined : onDismiss}
    >
      <div
        className="w-full max-w-[300px] rounded-3xl overflow-hidden animate-slide-up"
        style={{
          background: "rgba(255,255,255,0.98)",
          border: `1px solid ${color}44`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.16), 0 0 0 1px ${color}18`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 컬러 배너 */}
        <div
          className="relative flex flex-col items-center pt-7 pb-6"
          style={{
            background: `linear-gradient(160deg, ${color}22 0%, ${color}08 100%)`,
            borderBottom: "1px solid rgba(160,210,240,0.4)",
          }}
        >
          {/* 장식 별 */}
          <span className="absolute top-3 left-5 text-base select-none" style={{ color: `${color}55` }}>✦</span>
          <span className="absolute top-5 right-7 text-sm select-none"  style={{ color: `${color}44` }}>✧</span>
          <span className="absolute bottom-3 right-5 text-xs select-none" style={{ color: `${color}33` }}>⋆</span>
          <span className="absolute bottom-5 left-8 text-xs select-none" style={{ color: `${color}33` }}>✦</span>

          {/* 아이콘 */}
          <div
            className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: `linear-gradient(145deg, ${color}28, ${color}12)`,
              border: `1.5px solid ${color}50`,
              boxShadow: `0 6px 20px ${color}28`,
            }}
          >
            <Icon size={26} color={color} strokeWidth={1.8} />
          </div>

          {/* 뱃지 */}
          <span
            className="text-[11px] font-black tracking-widest px-3 py-[3px] rounded-full mb-2"
            style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}
          >
            {badge}
          </span>

          <h3 className="text-[19px] font-black" style={{ color: "#1a3a5c" }}>
            {title}
          </h3>
        </div>

        {/* 하단 */}
        <div className="px-6 pt-4 pb-6 flex flex-col gap-4">
          <p className="text-[13px] text-center leading-[1.8] whitespace-pre-line" style={{ color: "#7a9bb5" }}>
            {subtitle}
          </p>

          <GameButton fullWidth onClick={onRead}>
            {isBadStory ? "엔딩 보기" : "지금 읽기"}
          </GameButton>

          {!isBadStory && (
            <button
              className="text-[12px] text-center transition-opacity hover:opacity-70"
              style={{ color: "#aabdd0" }}
              onClick={onDismiss}
            >
              나중에 읽기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
