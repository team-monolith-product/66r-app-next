"use client";

import { useState } from "react";
import { useApp } from "@/components/AppContext";
import { SparkleBurst } from "@/components/ui/SparkleEffect";
import SparkleEffect from "@/components/ui/SparkleEffect";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import GameButton from "@/components/ui/GameButton";

// ── 엔딩별 콘텐츠 ────────────────────────────────────
const ENDING_DATA = {
  best: {
    title: "베스트 엔딩",
    subtitle: "BEST ENDING",
    grade: "S",
    gradeColor: "#f0c040",
    bgGlow: "rgba(240,192,64,0.2)",
    icon: "♛",
    description: "66일을 완벽하게 마쳤습니다.\n당신의 습관은 이제 삶의 일부가 되었어요.",
    dialogue: {
      tsundere: "…전부 다 해냈네. 진짜로. 나도, 너도. …잘했어. 정말로.",
      genki: "해냈어!! 66일 완주!! 같이 달려와줘서 정말 고마워. 이제 우리 뭐든 할 수 있어!",
      intellectual: "66일 완료. 모든 데이터가 당신의 성장을 증명해요. …그리고, 함께한 시간이 가장 값진 데이터였어요.",
    },
  },
  normal: {
    title: "노멀 엔딩",
    subtitle: "NORMAL ENDING",
    grade: "A",
    gradeColor: "#60a5fa",
    bgGlow: "rgba(96,165,250,0.15)",
    icon: "✦",
    description: "66일을 마쳤습니다.\n완벽하진 않았지만, 충분히 잘 해냈어요.",
    dialogue: {
      tsundere: "다 끝났네. 뭐, 나쁘지 않았어. …다음엔 더 잘할 수 있을 거야.",
      genki: "66일 완주! 힘든 날도 있었지만 끝까지 해냈잖아. 정말 대단해!",
      intellectual: "66일 여정이 끝났네요. 아쉬운 날도 있었지만 완주 자체가 훌륭한 성과예요.",
    },
  },
  bad: {
    title: "배드 엔딩",
    subtitle: "BAD ENDING",
    grade: "C",
    gradeColor: "#f472b6",
    bgGlow: "rgba(244,114,182,0.1)",
    icon: "✧",
    description: "66일이 끝났습니다.\n이번엔 힘들었지만, 다음엔 다를 거예요.",
    dialogue: {
      tsundere: "…포기할 줄 알았어. 근데 끝까지 있어줬잖아. 그거면 됐어.",
      genki: "많이 힘들었지? 그래도 끝까지 같이 있어줘서 고마워. 다음엔 같이 더 잘 해보자!",
      intellectual: "결과가 아쉽지만, 시도했다는 사실 자체가 의미 있어요. 데이터는 다음 도전을 위한 자산이에요.",
    },
  },
} as const;

// ── 연인 모드 대사 ───────────────────────────────────
const LOVER_DIALOGUE: Record<string, string[]> = {
  tsundere: [
    "…뭘 봐. 그냥 같이 있고 싶었을 뿐이야.",
    "앞으로도 네 습관 챙겨줄게. 그게 내 역할이니까.",
    "바보야. 그게 좋다는 말이잖아.",
  ],
  genki: [
    "이제 우리 어떤 것도 같이 할 수 있어!",
    "66일이 이렇게 소중한 시간이 될 줄 몰랐어.",
    "앞으로도 계속 같이 있어줄 거지?",
  ],
  intellectual: [
    "66일의 데이터가 증명한 건 습관만이 아니에요.",
    "당신과 함께한 시간의 가치는 계량할 수 없어요.",
    "…이게 감정이라는 건가요. 흥미롭네요.",
  ],
};

export default function EndingScreen() {
  const { state, dispatch } = useApp();
  const { endingType, character, affection, completedDays, streak } = state;

  const [phase, setPhase] = useState<"result" | "lover">("result");
  const [loverLine, setLoverLine] = useState(0);

  const type = endingType ?? "normal";
  const ending = ENDING_DATA[type];
  const charType = character?.type ?? "genki";
  const dialogue = ending.dialogue[charType];

  const loverLines = LOVER_DIALOGUE[charType];
  const isBestEnding = type === "best";

  const handleNextLover = () => {
    if (loverLine < loverLines.length - 1) {
      setLoverLine(loverLine + 1);
    }
  };

  const handleRestart = () => {
    dispatch({ type: "RESET" });
  };

  // ── 연인 모드 화면 ──────────────────────────────
  if (phase === "lover") {
    return (
      <div className="relative w-full h-full game-gradient-bg flex flex-col overflow-hidden">
        <SparkleEffect count={20} />

        {/* 배경 글로우 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 30%, ${character?.color ?? "var(--gold)"}22 0%, transparent 70%)`,
          }}
        />

        {/* 타이틀 */}
        <div className="px-6 pt-10 pb-2 z-10 text-center">
          <p className="text-xs tracking-[0.4em] text-[var(--text-secondary)] uppercase">Lover Mode</p>
          <h2
            className="font-cinzel text-2xl font-bold mt-1 text-shimmer"
          >
            연인이 되었어요
          </h2>
        </div>

        {/* 캐릭터 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 z-10 px-6">
          <div className="animate-fade-in">
            {character && (
              <CharacterDisplay character={character} size="lg" mood="shy" />
            )}
          </div>

          {/* 대사 박스 */}
          <div
            className="glass-panel-dark px-6 py-5 w-full max-w-xs rounded-2xl text-center relative"
            style={{ border: `1px solid ${character?.color ?? "var(--gold)"}44` }}
          >
            <div
              className="text-xs font-bold mb-2"
              style={{ color: character?.color ?? "var(--gold)" }}
            >
              {character?.name}
            </div>
            <p
              key={loverLine}
              className="text-[var(--text-primary)] text-sm leading-7 animate-fade-in italic"
            >
              "{loverLines[loverLine]}"
            </p>

            {/* 도트 */}
            <div className="flex justify-center gap-1.5 mt-3">
              {loverLines.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: i <= loverLine
                      ? (character?.color ?? "var(--gold)")
                      : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
          </div>

          {loverLine < loverLines.length - 1 ? (
            <GameButton onClick={handleNextLover} variant="secondary">
              다음 ▶
            </GameButton>
          ) : (
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <GameButton fullWidth onClick={handleRestart}>
                새로운 여정 시작하기
              </GameButton>
              <p className="text-[10px] text-[var(--text-secondary)] text-center opacity-60">
                처음부터 다시 시작합니다
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 결과 화면 ───────────────────────────────────
  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col items-center overflow-hidden">
      {isBestEnding && <SparkleBurst />}
      <SparkleEffect count={isBestEnding ? 16 : 8} />

      {/* 배경 글로우 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 20%, ${ending.bgGlow} 0%, transparent 65%)`,
        }}
      />

      <div className="flex flex-col items-center gap-5 px-8 pt-12 pb-8 z-10 w-full animate-slide-up overflow-y-auto hide-scrollbar">
        {/* 등급 배지 */}
        <div
          className="w-24 h-24 rounded-full flex flex-col items-center justify-center font-cinzel font-bold text-3xl"
          style={{
            background: `radial-gradient(circle, ${ending.gradeColor}22 0%, transparent 70%)`,
            border: `2px solid ${ending.gradeColor}66`,
            color: ending.gradeColor,
            boxShadow: `0 0 40px ${ending.gradeColor}33`,
          }}
        >
          <span className="text-lg opacity-70">{ending.icon}</span>
          <span>{ending.grade}</span>
        </div>

        {/* 제목 */}
        <div className="text-center">
          <p className="text-xs tracking-[0.4em] text-[var(--text-secondary)] uppercase">
            {ending.subtitle}
          </p>
          <h2
            className="font-cinzel text-2xl font-bold mt-1"
            style={{ color: ending.gradeColor }}
          >
            {ending.title}
          </h2>
        </div>

        {/* 캐릭터 */}
        {character && (
          <CharacterDisplay
            character={character}
            size="md"
            mood={type === "best" ? "happy" : type === "normal" ? "neutral" : "sad"}
          />
        )}

        {/* 캐릭터 대사 */}
        <div
          className="glass-panel px-5 py-4 w-full max-w-xs text-center"
          style={{ border: `1px solid ${character?.color ?? "var(--gold)"}33` }}
        >
          <p className="text-sm text-[var(--text-primary)] leading-7 italic">
            "{dialogue}"
          </p>
        </div>

        {/* 설명 */}
        <p className="text-[var(--text-secondary)] text-sm text-center leading-7 whitespace-pre-line">
          {ending.description}
        </p>

        {/* 최종 스탯 */}
        <div className="glass-panel w-full max-w-xs p-4 rounded-2xl">
          <h3 className="text-xs text-[var(--text-secondary)] tracking-widest uppercase mb-3 text-center">
            최종 기록
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-bold text-lg" style={{ color: ending.gradeColor }}>
                {completedDays.length}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)]">완료일</div>
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: ending.gradeColor }}>
                {streak}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)]">최고 스트릭</div>
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: ending.gradeColor }}>
                {affection}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)]">호감도</div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-3 w-full max-w-xs pb-4">
          {isBestEnding && (
            <GameButton
              fullWidth
              size="lg"
              onClick={() => setPhase("lover")}
              style={{
                background: `linear-gradient(135deg, ${character?.accentColor ?? "#7c3aed"} 0%, ${character?.color ?? "var(--gold)"} 100%)`,
                boxShadow: `0 4px 24px ${character?.color ?? "var(--gold)"}44`,
              }}
            >
              ♡ 연인 모드 보기
            </GameButton>
          )}
          <GameButton
            fullWidth
            variant={isBestEnding ? "ghost" : "primary"}
            onClick={handleRestart}
          >
            새로운 여정 시작하기
          </GameButton>
        </div>
      </div>
    </div>
  );
}
