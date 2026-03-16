"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppStore, RELATIONSHIP_LEVELS, getRelationshipLevel } from "@/store/useAppStore";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import BottomNav from "@/components/ui/BottomNav";
import StoryUnlockModal from "@/components/ui/StoryUnlockModal";
import { Flame, Sparkles, Target, BookOpen, ChevronRight } from "lucide-react";

export default function HomeScreen() {
  const router = useRouter();
  useRouteGuard("setup-complete");

  const character = useAppStore((s) => s.character);
  const habits = useAppStore((s) => s.habits);
  const todayVerified = useAppStore((s) => s.todayVerified);
  const dayCount = useAppStore((s) => s.dayCount);
  const affection = useAppStore((s) => s.affection);
  const streak = useAppStore((s) => s.streak);
  const currency = useAppStore((s) => s.currency);
  const nextDay = useAppStore((s) => s.nextDay);
  const pendingStoryRead = useAppStore((s) => s.pendingStoryRead);
  const clearPendingStory = useAppStore((s) => s.clearPendingStory);

  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    if (!pendingStoryRead) return;
    const timer = setTimeout(() => setShowUnlockModal(true), 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!character) return null;

  const progressPct   = Math.round((dayCount / 66) * 100);
  const daysLeft      = 66 - dayCount;
  const level         = getRelationshipLevel(affection);
  const levelName     = RELATIONSHIP_LEVELS.find((r) => r.level === level)?.name ?? "";
  const currentThreshold = RELATIONSHIP_LEVELS.find((r) => r.level === level)?.threshold ?? 0;
  const nextThreshold = RELATIONSHIP_LEVELS.find((r) => r.level === level + 1)?.threshold ?? 660;
  const affectionPct  = level >= 8
    ? 100
    : Math.round(((affection - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

  const staminaGradient =
    affectionPct > 60
      ? "linear-gradient(90deg, #4cca7a, #a8f0c0)"
      : affectionPct > 30
      ? "linear-gradient(90deg, #f0c040, #fde96a)"
      : "linear-gradient(90deg, #ff6b6b, #ffaaaa)";
  const staminaColor =
    affectionPct > 60 ? "#2da85a" : affectionPct > 30 ? "#c09000" : "#cc3333";

  const getMessage = () => {
    if (todayVerified)
      return affection >= 300 ? "오늘도 해냈네. …잘했어, 정말로." : "인증 완료. 내일도 이 정도면 돼.";
    if (dayCount === 1) return character.greeting;
    if (streak >= 7) return "7일 연속이네. 솔직히 조금 놀랐어.";
    return "오늘 인증 아직 안 했잖아. 빨리 해.";
  };

  const panel = {
    background: "rgba(255,255,255,0.90)",
    border: "1px solid rgba(160,210,240,0.55)",
    boxShadow: "0 2px 12px rgba(90,150,200,0.10)",
  };

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #aad8f0 0%, #caeaf8 22%, #dff2fb 50%, #caeaf8 100%)",
      }}
    >
      {showUnlockModal && pendingStoryRead && (
        <StoryUnlockModal
          episodeId={pendingStoryRead}
          onRead={() => router.push("/story")}
          onDismiss={() => { clearPendingStory(); setShowUnlockModal(false); }}
        />
      )}

      {/* ── 배경 캐릭터 ── */}
      <div className="absolute inset-0 flex items-end justify-center" style={{ zIndex: 1 }}>
        <CharacterDisplay character={character} size="hero" mood={todayVerified ? "happy" : "neutral"} />
      </div>

      {/* ── 상단 HUD ── */}
      <div className="relative z-10 px-3 pt-3 flex flex-col gap-1.5">

        {/* 제목 바 */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl" style={panel}>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-black" style={{ color: "#1a3a5c" }}>66일 도전</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#e6f9ee", color: "#2a9e5f", border: "1px solid #a8e8c0" }}
            >
              진행중
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Flame size={15} color="#e06820" />
              <span className="text-xs font-black" style={{ color: "#e06820" }}>{streak}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Sparkles size={12} color="#c8a000" />
              <span className="text-xs font-black" style={{ color: "#9a7800" }}>{currency}</span>
            </div>
          </div>
        </div>

        {/* 목표 + 남은 일수 */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-2xl" style={panel}>
          {/* 카운터 박스 */}
          <div
            className="flex flex-col items-center justify-center rounded-xl px-3 py-1.5 shrink-0"
            style={{ background: "linear-gradient(145deg, #ff9d56 0%, #f07030 100%)", boxShadow: "0 3px 10px rgba(240,112,48,0.35)" }}
          >
            <span className="text-[9px] font-bold text-white/80 leading-none">앞으로</span>
            <span className="text-[22px] font-black text-white leading-none">{daysLeft}</span>
            <span className="text-[9px] font-bold text-white/80 leading-none">일</span>
          </div>

          {/* 목표 텍스트 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-bold mb-0.5" style={{ color: "#e07820" }}>
              <Target size={11} strokeWidth={2.2} />
              목표 ({habits.length}개)
            </div>
            {habits.slice(0, 2).map((h, i) => (
              <p key={i} className="text-[12px] font-bold leading-tight truncate" style={{ color: "#1a3a5c" }}>
                {h}
              </p>
            ))}
            {habits.length > 2 && (
              <p className="text-[10px]" style={{ color: "#7a9bb5" }}>외 {habits.length - 2}개 더</p>
            )}
          </div>

          <button
            className="text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0"
            style={{ background: "#e8f4fc", color: "#4a8aaa", border: "1px solid #b8d8ee" }}
          >
            상세
          </button>
        </div>

        {/* 호감도(체력) 바 */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl" style={panel}>
          <span className="text-[11px] font-black shrink-0" style={{ color: "#1a3a5c" }}>
            호감도
          </span>
          <div
            className="flex-1 h-[18px] rounded-full overflow-hidden"
            style={{ background: "rgba(0,0,0,0.07)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${affectionPct}%`, background: staminaGradient, boxShadow: `0 0 6px ${staminaColor}55` }}
            />
          </div>
          <div
            className="shrink-0 flex items-center gap-0.5 px-2 py-0.5 rounded-lg"
            style={{ background: `${staminaColor}18`, border: `1px solid ${staminaColor}44` }}
          >
            <ChevronRight size={10} strokeWidth={2.5} />
            <span className="text-[10px] font-black" style={{ color: staminaColor }}>{levelName}</span>
          </div>
        </div>
      </div>

      {/* ── 말풍선 ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-end items-center pb-3 px-8 pointer-events-none">
        <div
          className="px-4 py-2.5 rounded-2xl max-w-[260px] text-center relative"
          style={{ background: "rgba(255,255,255,0.93)", border: "1px solid rgba(160,210,240,0.6)", boxShadow: "0 4px 20px rgba(90,150,200,0.18)" }}
        >
          <div
            className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
            style={{ background: "rgba(255,255,255,0.93)", border: "1px solid rgba(160,210,240,0.6)", borderRight: "none", borderBottom: "none" }}
          />
          <p className="text-[13px] leading-relaxed" style={{ color: "#1a3a5c" }}>{getMessage()}</p>
        </div>
      </div>

      {/* ── 하단 패널 ── */}
      <div
        className="relative z-10 mx-3 mb-[70px] rounded-3xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.93)", border: "1px solid rgba(160,210,240,0.6)", boxShadow: "0 -4px 24px rgba(90,150,200,0.14)" }}
      >
        {/* 스탯 미니 바 */}
        <div className="flex" style={{ borderBottom: "1px solid rgba(160,210,240,0.4)" }}>
          {([
            { label: "진행도", value: `${progressPct}%`, sub: `${dayCount}/66일`, color: "#4aacef" },
            { label: "연속",   value: `${streak}일`,      sub: "스트릭",           color: "#ff8040" },
            { label: "코인",   value: `${currency}`,      sub: "보유",             color: "#c8a000" },
            { label: "호감",   value: `Lv.${level}`,      sub: levelName,          color: character.color },
          ] as const).map((s, i, arr) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center py-2"
              style={{ borderRight: i < arr.length - 1 ? "1px solid rgba(160,210,240,0.4)" : undefined }}
            >
              <span className="text-[12px] font-black leading-none" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[9px] mt-0.5" style={{ color: "#7a9bb5" }}>{s.sub}</span>
            </div>
          ))}
        </div>

        {/* 액션 버튼들 */}
        <div className="px-3 py-3">
          {!todayVerified ? (
            <div className="flex gap-2">
              {/* 메인 인증 */}
              <button
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-transform active:scale-95"
                style={{
                  background: "linear-gradient(145deg, #5cd885 0%, #2daa5e 100%)",
                  boxShadow: "0 4px 16px rgba(45,170,94,0.38)",
                }}
                onClick={() => router.push("/verification")}
              >
                <Sparkles size={22} color="#fff" />
                <span className="text-[13px] font-black text-white">인증하기</span>
              </button>

              <div className="flex flex-col gap-2 w-[88px]">
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl transition-transform active:scale-95"
                  style={{ background: "linear-gradient(145deg, #b8a4f8 0%, #8b70e8 100%)", boxShadow: "0 3px 10px rgba(139,112,232,0.32)" }}
                  onClick={() => router.push("/story")}
                >
                  <BookOpen size={16} color="#fff" />
                  <span className="text-[12px] font-black text-white">스토리</span>
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl transition-transform active:scale-95"
                  style={{ background: "linear-gradient(145deg, #6bbef5 0%, #3a90d4 100%)", boxShadow: "0 3px 10px rgba(58,144,212,0.32)" }}
                  onClick={() => router.push(nextDay())}
                >
                  <ChevronRight size={18} color="#fff" />
                  <span className="text-[12px] font-black text-white">다음날</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-transform active:scale-95"
                style={{ background: "linear-gradient(145deg, #b8a4f8 0%, #8b70e8 100%)", boxShadow: "0 4px 14px rgba(139,112,232,0.35)" }}
                onClick={() => router.push("/story")}
              >
                <BookOpen size={22} color="#fff" />
                <span className="text-[13px] font-black text-white">스토리</span>
              </button>
              <button
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-transform active:scale-95"
                style={{ background: "linear-gradient(145deg, #b8a4f8 0%, #8b70e8 100%)", boxShadow: "0 4px 14px rgba(139,112,232,0.35)" }}
                onClick={() => router.push(nextDay())}
              >
                <ChevronRight size={22} color="#fff" />
                <span className="text-[13px] font-black text-white">다음 날</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 하단 내비 ── */}
      <BottomNav />
    </div>
  );
}
