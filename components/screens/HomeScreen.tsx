"use client";

import { useApp } from "@/components/AppContext";
import TopStatusBar from "@/components/ui/TopStatusBar";
import AffectionBar from "@/components/ui/AffectionBar";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import BottomNav from "@/components/ui/BottomNav";
import GameButton from "@/components/ui/GameButton";
import SparkleEffect from "@/components/ui/SparkleEffect";

export default function HomeScreen() {
  const { state, dispatch } = useApp();
  const { character, habit, todayVerified, dayCount, affection } = state;

  if (!character) return null;

  const progressPct = Math.round((dayCount / 66) * 100);

  // 캐릭터 대사 (상태별)
  const getMessage = () => {
    if (todayVerified) {
      return affection >= 300
        ? "오늘도 해냈네. …잘했어, 정말로."
        : "인증 완료. 내일도 이 정도면 돼.";
    }
    if (dayCount === 1) return character.greeting;
    if (state.streak >= 7) return "7일 연속이네. 솔직히 조금 놀랐어.";
    return "오늘 인증 아직 안 했잖아. 빨리 해.";
  };

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col overflow-hidden">
      <SparkleEffect count={6} />

      {/* 배경 캐릭터 — UI 뒤에 깔림 */}
      <div className="absolute inset-0 flex items-end justify-center" style={{ zIndex: 1 }}>
        <CharacterDisplay
          character={character}
          size="hero"
          mood={todayVerified ? "happy" : "neutral"}
        />
      </div>

      {/* 상단 HUD */}
      <TopStatusBar />

      {/* 호감도 */}
      <AffectionBar />

      {/* 말풍선 */}
      <div className="flex-1 flex flex-col items-center justify-end pb-4 px-6 z-10 pointer-events-none">
        <div className="glass-panel px-5 py-3 max-w-[280px] text-center relative">
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 glass-panel"
            style={{ borderRight: "none", borderBottom: "none" }}
          />
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {getMessage()}
          </p>
        </div>
      </div>

      {/* 하단 행동 영역 */}
      <div className="px-6 pb-24 z-10 flex flex-col gap-3">
        {/* 오늘의 습관 */}
        <div className="glass-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-secondary)] tracking-widest uppercase">오늘의 습관</span>
            {todayVerified && (
              <span className="text-xs text-green-400 font-bold">✓ 완료</span>
            )}
          </div>
          <p className="font-bold text-[var(--text-primary)]">{habit}</p>

          {/* 전체 진행률 바 */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mb-1">
              <span>전체 진행률</span>
              <span>{progressPct}%</span>
            </div>
            <div className="affection-track h-2">
              <div
                className="affection-fill"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${character.color} 0%, var(--gold) 100%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 버튼들 */}
        {!todayVerified ? (
          <GameButton
            fullWidth
            size="lg"
            onClick={() => dispatch({ type: "SET_SCREEN", screen: "verification" })}
          >
            ✦ 오늘의 인증하기
          </GameButton>
        ) : (
          <div className="flex gap-3">
            <GameButton
              variant="secondary"
              fullWidth
              onClick={() => dispatch({ type: "SET_SCREEN", screen: "chat" })}
            >
              ♡ 대화하기
            </GameButton>
            <GameButton
              variant="ghost"
              fullWidth
              onClick={() => dispatch({ type: "NEXT_DAY" })}
            >
              다음 날 →
            </GameButton>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
