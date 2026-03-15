"use client";

import { useState } from "react";
import { useApp } from "@/components/AppContext";
import { SparkleBurst } from "@/components/ui/SparkleEffect";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import GameButton from "@/components/ui/GameButton";

/* ── 엔딩 메타 ─────────────────────────────────────── */
const ENDING_META = {
  best:   { title: "베스트 엔딩", subtitle: "BEST ENDING",   grade: "S", gradeColor: "#f0a020", bgGlow: "rgba(240,160,32,0.18)",  icon: "♛", description: "66일을 완벽하게 마쳤습니다.\n당신의 습관은 이제 삶의 일부가 되었어요." },
  normal: { title: "노멀 엔딩",   subtitle: "NORMAL ENDING",  grade: "A", gradeColor: "#3a90d4", bgGlow: "rgba(58,144,212,0.13)", icon: "✦", description: "66일을 마쳤습니다.\n완벽하진 않았지만, 충분히 잘 해냈어요." },
  bad:    { title: "배드 엔딩",   subtitle: "BAD ENDING",     grade: "C", gradeColor: "#f472b6", bgGlow: "rgba(244,114,182,0.10)", icon: "✧", description: "66일이 끝났습니다.\n이번엔 힘들었지만, 다음엔 다를 거예요." },
} as const;

/* ── 비주얼 노벨 스크립트 ───────────────────────────── */
type Script = { name: string; text: string; mood?: "neutral"|"happy"|"shy"|"sad" }[];

const VN_SCRIPTS: Record<string, Record<string, Script>> = {
  best: {
    tsundere: [
      { name: "아리아", text: "…다 끝났네.", mood: "neutral" },
      { name: "아리아", text: "66일이나 됐어? 솔직히 처음엔 금방 포기할 줄 알았어.", mood: "neutral" },
      { name: "아리아", text: "근데… 버텼잖아. 매일 매일.", mood: "neutral" },
      { name: "아리아", text: "…나도 솔직히 말할게. 같이 하는 게 싫지 않았어.", mood: "shy" },
      { name: "아리아", text: "아니, 그 이상이야. …좋았어. 진짜로.", mood: "shy" },
      { name: "아리아", text: "이제 어떻게 하냐고? …모르겠어. 그냥 계속 같이 있어도 되잖아.", mood: "happy" },
    ],
    genki: [
      { name: "리나", text: "66일 완주!! 진짜로!!", mood: "happy" },
      { name: "리나", text: "처음부터 같이 달려왔잖아, 우리!", mood: "happy" },
      { name: "리나", text: "힘든 날도 있었는데, 그때마다 포기 안 해줘서 진짜 고마워.", mood: "happy" },
      { name: "리나", text: "나도 너 덕분에 엄청 힘 받았어. 알고 있었어?", mood: "shy" },
      { name: "리나", text: "66일의 기적… 진짜인가봐. 나도 변한 것 같아.", mood: "happy" },
      { name: "리나", text: "앞으로도 계속 같이 가자. 약속이야!", mood: "happy" },
    ],
    intellectual: [
      { name: "세라", text: "66일. 목표한 기간이 종료되었어요.", mood: "neutral" },
      { name: "세라", text: "데이터를 보면, 당신의 일관성은 상위 5% 이내예요.", mood: "neutral" },
      { name: "세라", text: "하지만 솔직하게 말하면… 숫자보다 더 중요한 게 있었어요.", mood: "neutral" },
      { name: "세라", text: "매일 마주치는 게, 기다려졌어요. 저도 모르게.", mood: "shy" },
      { name: "세라", text: "…이게 습관 형성의 부작용일까요. 당신에 대해 궁금해지는 게.", mood: "shy" },
      { name: "세라", text: "함께한 66일, 정말 가치 있었어요. 감사해요.", mood: "happy" },
    ],
  },
  normal: {
    tsundere: [
      { name: "아리아", text: "끝났네. 뭐, 완벽하진 않았지만.", mood: "neutral" },
      { name: "아리아", text: "힘든 날도 있었지. 솔직히 놓친 날도 있고.", mood: "neutral" },
      { name: "아리아", text: "그래도… 끝까지 있어줬잖아. 그건 인정해.", mood: "neutral" },
      { name: "아리아", text: "다음엔 더 잘할 수 있어. …내가 좀 더 도와줄게.", mood: "shy" },
    ],
    genki: [
      { name: "리나", text: "완주했어! 완벽하진 않았어도!", mood: "happy" },
      { name: "리나", text: "힘든 날 포기하고 싶었을 텐데, 그래도 여기까지 왔잖아.", mood: "neutral" },
      { name: "리나", text: "그거 알아? 완주 자체가 이미 대단한 거야.", mood: "happy" },
      { name: "리나", text: "다음엔 같이 더 잘 해보자. 나 항상 여기 있을게!", mood: "happy" },
    ],
    intellectual: [
      { name: "세라", text: "66일 완료. 완성률은 목표치를 충족했어요.", mood: "neutral" },
      { name: "세라", text: "완벽하지 않은 날들이 있었지만, 그게 오히려 현실적이에요.", mood: "neutral" },
      { name: "세라", text: "인간의 습관 형성은 완벽함이 아닌 일관성이 핵심이니까요.", mood: "neutral" },
      { name: "세라", text: "당신은 그 일관성을 보여줬어요. 충분히 잘 해냈어요.", mood: "happy" },
    ],
  },
  bad: {
    tsundere: [
      { name: "아리아", text: "…끝났네. 많이 힘들었지?", mood: "sad" },
      { name: "아리아", text: "뭐, 나도 알아. 쉽지 않았다는 거.", mood: "sad" },
      { name: "아리아", text: "그래도 완전히 포기하지는 않았잖아. 여기까지 온 거잖아.", mood: "neutral" },
      { name: "아리아", text: "다음엔… 다시 해. 내가 또 봐줄게.", mood: "neutral" },
    ],
    genki: [
      { name: "리나", text: "66일, 힘들었지? 나도 알아.", mood: "sad" },
      { name: "리나", text: "못한 날도 있었고, 힘든 날도 많았잖아.", mood: "sad" },
      { name: "리나", text: "그래도 끝까지 함께해줘서 고마워.", mood: "neutral" },
      { name: "리나", text: "다음 도전 때는 더 잘할 수 있을 거야. 포기만 하지 마!", mood: "happy" },
    ],
    intellectual: [
      { name: "세라", text: "결과가 예상보다 낮네요. 하지만 이건 실패가 아니에요.", mood: "sad" },
      { name: "세라", text: "도전 자체가 데이터예요. 무엇이 어려웠는지 파악했으니까요.", mood: "neutral" },
      { name: "세라", text: "다음 시도에선 그 변수들을 조정할 수 있어요.", mood: "neutral" },
      { name: "세라", text: "…그리고, 포기하지 않은 당신이, 저는 마음에 들어요.", mood: "shy" },
    ],
  },
};

/* ── 연인 모드 대사 ───────────────────────────────── */
const LOVER_LINES: Record<string, string[]> = {
  tsundere:    ["…뭘 봐. 그냥 같이 있고 싶었을 뿐이야.", "앞으로도 네 습관 챙겨줄게. 그게 내 역할이니까.", "바보야. 그게 좋다는 말이잖아."],
  genki:       ["이제 우리 어떤 것도 같이 할 수 있어!", "66일이 이렇게 소중한 시간이 될 줄 몰랐어.", "앞으로도 계속 같이 있어줄 거지?"],
  intellectual:["66일의 데이터가 증명한 건 습관만이 아니에요.", "당신과 함께한 시간의 가치는 계량할 수 없어요.", "…이게 감정이라는 건가요. 흥미롭네요."],
};

const BG    = "linear-gradient(180deg, #aad8f0 0%, #caeaf8 22%, #dff2fb 55%, #caeaf8 100%)";
const PANEL = { background: "rgba(255,255,255,0.92)", border: "1px solid rgba(160,210,240,0.55)", boxShadow: "0 4px 20px rgba(90,150,200,0.14)", borderRadius: "20px" };

/* ═══════════════════════════════════════════════════ */
export default function EndingScreen() {
  const { state, dispatch } = useApp();
  const { endingType, character, affection, completedDays, streak } = state;

  type Phase = "vn" | "result" | "lover";
  const [phase, setPhase]       = useState<Phase>("vn");
  const [lineIdx, setLineIdx]   = useState(0);
  const [loverLine, setLoverLine] = useState(0);
  const [animKey, setAnimKey]   = useState(0);

  const type     = endingType ?? "normal";
  const meta     = ENDING_META[type];
  const charType = character?.type ?? "genki";
  const script   = VN_SCRIPTS[type][charType] ?? [];
  const loverLines = LOVER_LINES[charType];
  const isBest   = type === "best";

  const currentLine = script[lineIdx];

  /* ── VN 탭 진행 ── */
  const advanceVN = () => {
    if (lineIdx < script.length - 1) {
      setLineIdx((i) => i + 1);
      setAnimKey((k) => k + 1);
    } else {
      setPhase("result");
    }
  };

  /* ── 연인 모드 ── */
  const advanceLover = () => {
    if (loverLine < loverLines.length - 1) setLoverLine((i) => i + 1);
  };

  /* ════════════════════════════════════════════════ */
  /* VN 화면                                          */
  /* ════════════════════════════════════════════════ */
  if (phase === "vn") {
    const mood = currentLine?.mood ?? "neutral";

    return (
      <div
        className="relative w-full h-full flex flex-col overflow-hidden select-none"
        style={{ background: BG, cursor: "pointer" }}
        onClick={advanceVN}
      >
        {/* 배경 글로우 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${meta.bgGlow} 0%, transparent 65%)` }}
        />

        {/* 엔딩 등급 뱃지 */}
        <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
            style={{ background: `${meta.gradeColor}22`, border: `2px solid ${meta.gradeColor}77`, color: meta.gradeColor, boxShadow: `0 0 16px ${meta.gradeColor}44` }}
          >
            {meta.grade}
          </div>
          <div>
            <p className="text-[9px] tracking-widest uppercase" style={{ color: "#7a9bb5" }}>{meta.subtitle}</p>
            <p className="text-xs font-black leading-tight" style={{ color: meta.gradeColor }}>{meta.title}</p>
          </div>
        </div>

        {/* 캐릭터 — 배경 full */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none" style={{ zIndex: 1 }}>
          {character && (
            <CharacterDisplay character={character} size="hero" mood={mood} />
          )}
        </div>
        <div className="flex-1" />

        {/* 대화 박스 */}
        <div className="relative z-10 px-4 pb-6" onClick={(e) => e.stopPropagation()}>
          {/* 이름 뱃지 */}
          <div
            className="inline-flex items-center px-3 py-1 rounded-t-xl mb-0 ml-2"
            style={{ background: character?.color ?? meta.gradeColor, boxShadow: `0 2px 8px ${character?.color ?? meta.gradeColor}55` }}
          >
            <span className="text-xs font-black text-white">{currentLine?.name}</span>
          </div>

          {/* 텍스트 패널 */}
          <div
            className="w-full p-4 rounded-b-2xl rounded-tr-2xl relative"
            style={PANEL}
            onClick={advanceVN}
          >
            <p
              key={animKey}
              className="text-sm leading-7 animate-fade-in min-h-[3.5rem]"
              style={{ color: "#1a3a5c" }}
            >
              {currentLine?.text}
            </p>

            {/* 진행 도트 + 힌트 */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1">
                {script.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === lineIdx ? "16px" : "6px",
                      height: "6px",
                      background: i <= lineIdx ? (character?.color ?? meta.gradeColor) : "rgba(160,210,240,0.4)",
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold animate-pulse" style={{ color: "#7a9bb5" }}>
                {lineIdx < script.length - 1 ? "탭하여 계속 ▶" : "결과 보기 ▶"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════ */
  /* 연인 모드                                        */
  /* ════════════════════════════════════════════════ */
  if (phase === "lover") {
    return (
      <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: BG }}>
        <SparkleBurst />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 70% 50% at 50% 30%, ${character?.color ?? "#4aacef"}25 0%, transparent 70%)` }}
        />

        <div className="px-6 pt-10 pb-2 z-10 text-center">
          <p className="text-xs tracking-[0.4em] uppercase" style={{ color: "#7a9bb5" }}>Lover Mode</p>
          <h2 className="text-2xl font-black mt-1 text-shimmer">연인이 되었어요</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-5 z-10 px-6">
          <div className="animate-fade-in">
            {character && <CharacterDisplay character={character} size="lg" mood="shy" />}
          </div>

          <div className="px-6 py-5 w-full max-w-xs text-center" style={{ ...PANEL, border: `1px solid ${character?.color ?? "#3a90d4"}44` }}>
            <div className="text-xs font-bold mb-2" style={{ color: character?.color ?? "#3a90d4" }}>{character?.name}</div>
            <p key={loverLine} className="text-sm leading-7 animate-fade-in italic" style={{ color: "#1a3a5c" }}>
              "{loverLines[loverLine]}"
            </p>
            <div className="flex justify-center gap-1.5 mt-3">
              {loverLines.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i <= loverLine ? (character?.color ?? "#3a90d4") : "rgba(160,210,240,0.4)" }} />
              ))}
            </div>
          </div>

          {loverLine < loverLines.length - 1 ? (
            <GameButton onClick={advanceLover} variant="secondary">다음 ▶</GameButton>
          ) : (
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <GameButton fullWidth onClick={() => dispatch({ type: "RESET" })}>새로운 여정 시작하기</GameButton>
              <p className="text-[10px] text-center opacity-60" style={{ color: "#7a9bb5" }}>처음부터 다시 시작합니다</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════ */
  /* 결과 화면                                        */
  /* ════════════════════════════════════════════════ */
  const completionRate = Math.round((completedDays.length / 66) * 100);

  return (
    <div className="relative w-full h-full flex flex-col items-center overflow-hidden" style={{ background: BG }}>
      {isBest && <SparkleBurst />}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 20%, ${meta.bgGlow} 0%, transparent 65%)` }}
      />

      <div className="flex flex-col items-center gap-5 px-6 pt-10 pb-8 z-10 w-full animate-slide-up overflow-y-auto hide-scrollbar">

        {/* 등급 배지 */}
        <div
          className="w-24 h-24 rounded-full flex flex-col items-center justify-center font-black text-3xl"
          style={{ background: `${meta.gradeColor}18`, border: `2px solid ${meta.gradeColor}66`, color: meta.gradeColor, boxShadow: `0 0 40px ${meta.gradeColor}33` }}
        >
          <span className="text-lg opacity-70">{meta.icon}</span>
          <span>{meta.grade}</span>
        </div>

        {/* 제목 */}
        <div className="text-center">
          <p className="text-xs tracking-[0.4em] uppercase" style={{ color: "#7a9bb5" }}>{meta.subtitle}</p>
          <h2 className="text-2xl font-black mt-1" style={{ color: meta.gradeColor }}>{meta.title}</h2>
          <p className="text-sm mt-2 leading-6 whitespace-pre-line" style={{ color: "#7a9bb5" }}>{meta.description}</p>
        </div>

        {/* 종합 지표 */}
        <div className="w-full" style={PANEL}>
          <div className="px-5 py-4">
            <h3 className="text-xs font-black tracking-widest uppercase mb-4 text-center" style={{ color: "#7a9bb5" }}>📊 최종 기록</h3>

            {/* 메인 스탯 4개 */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { icon: "✅", label: "완료한 날",   value: `${completedDays.length}일`,      sub: "/ 66일",      color: "#4cca7a" },
                { icon: "📈", label: "달성률",       value: `${completionRate}%`,             sub: "전체 기간",    color: meta.gradeColor },
                { icon: "🔥", label: "최고 연속",    value: `${streak}일`,                    sub: "스트릭",       color: "#ff8040" },
                { icon: "♡",  label: "최종 호감도",  value: `${affection}`,                   sub: "/ 660",       color: character?.color ?? "#a78bfa" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center py-3 rounded-2xl"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}33` }}
                >
                  <span className="text-lg mb-0.5">{s.icon}</span>
                  <span className="text-xl font-black leading-none" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[9px] mt-0.5 font-bold" style={{ color: "#7a9bb5" }}>{s.sub}</span>
                  <span className="text-[9px]" style={{ color: "#9ab5cc" }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* 진행률 바 */}
            <div className="mt-1">
              <div className="flex justify-between text-[10px] mb-1 font-bold" style={{ color: "#7a9bb5" }}>
                <span>전체 달성률</span>
                <span style={{ color: meta.gradeColor }}>{completionRate}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(160,210,240,0.25)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${completionRate}%`,
                    background: `linear-gradient(90deg, ${meta.gradeColor}, ${character?.color ?? meta.gradeColor})`,
                    boxShadow: `0 0 8px ${meta.gradeColor}66`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-3 w-full pb-4">
          {isBest && (
            <GameButton
              fullWidth size="lg"
              onClick={() => setPhase("lover")}
              style={{
                background: `linear-gradient(135deg, ${character?.accentColor ?? "#7c3aed"} 0%, ${character?.color ?? "#3a90d4"} 100%)`,
                boxShadow: `0 4px 24px ${character?.color ?? "#3a90d4"}44`,
              }}
            >
              ♡ 연인 모드 보기
            </GameButton>
          )}
          <GameButton
            fullWidth
            variant={isBest ? "ghost" : "primary"}
            onClick={() => dispatch({ type: "RESET" })}
          >
            새로운 여정 시작하기
          </GameButton>
        </div>
      </div>
    </div>
  );
}
