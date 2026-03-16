"use client";

import { LockOpen } from "lucide-react";
import GameButton from "@/components/ui/GameButton";

interface Props {
  episodeId: number;
  onRead: () => void;
  onDismiss: () => void;
}

export default function StoryUnlockModal({ episodeId, onRead, onDismiss }: Props) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.60)" }}
      onClick={onDismiss}
    >
      <div
        className="w-72 rounded-2xl px-6 py-8 flex flex-col items-center gap-4 animate-slide-up"
        style={{ background: "#1a1a2e", border: "1px solid rgba(167,139,250,0.30)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 자물쇠 아이콘 */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(167,139,250,0.20)", border: "2px solid rgba(167,139,250,0.50)" }}
        >
          <LockOpen size={28} color="#a78bfa" />
        </div>

        {/* 제목 */}
        <div className="text-center">
          <h3 className="text-lg font-black" style={{ color: "#a78bfa" }}>
            에피소드 {episodeId} 해금!
          </h3>
          <p className="text-sm mt-2 leading-relaxed whitespace-pre-line" style={{ color: "rgba(255,255,255,0.65)" }}>
            {"호감도 목표 달성으로\n새 스토리가 열렸어요."}
          </p>
        </div>

        {/* 버튼 */}
        <div className="w-full mt-1">
          <GameButton fullWidth onClick={onRead}>
            스토리 보기
          </GameButton>
        </div>
      </div>
    </div>
  );
}
