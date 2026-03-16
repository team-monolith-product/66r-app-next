"use client";

import { useState } from "react";
import { useApp, CHARACTERS } from "@/components/AppContext";

const ALL_STORY_IDS = [1, 2, 3, 4, 5, 6];

export default function DebugPanel() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);

  // 캐릭터+습관이 없으면 기본값 세팅
  const ensureSetup = () => {
    const patch: Parameters<typeof dispatch>[0] = { type: "DEBUG_PATCH", patch: {} };
    const p: typeof patch extends { patch: infer P } ? P : never = {};
    if (!state.character) p.character = CHARACTERS[0];
    if (!state.habits || state.habits.length === 0) {
      p.habits = ["매일 운동하기"];
      p.todayHabitChecks = [false];
    }
    if (Object.keys(p).length) dispatch({ type: "DEBUG_PATCH", patch: p });
  };

  const goHome = () => {
    ensureSetup();
    dispatch({ type: "SET_SCREEN", screen: "home" });
  };

  const btn = (label: string, onClick: () => void, color = "#4aacef") => (
    <button
      key={label}
      onClick={() => { onClick(); }}
      className="text-left px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
      style={{ background: color, boxShadow: `0 2px 8px ${color}55` }}
    >
      {label}
    </button>
  );

  const section = (title: string, children: React.ReactNode) => (
    <div>
      <p className="text-[10px] font-black tracking-widest uppercase mb-1.5" style={{ color: "#7a9bb5" }}>{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );

  return (
    <>
      {/* 플로팅 토글 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute top-3 right-3 z-[100] w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all active:scale-90"
        style={{
          background: open ? "#ff6b6b" : "rgba(255,255,255,0.85)",
          border: "1px solid rgba(160,210,240,0.6)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          color: open ? "#fff" : "#5a8fa8",
        }}
        title="Debug Panel"
      >
        {open ? "✕" : "🐛"}
      </button>

      {/* 패널 */}
      {open && (
        <div
          className="absolute top-12 right-3 z-[99] w-64 rounded-2xl overflow-y-auto hide-scrollbar flex flex-col gap-3 p-4"
          style={{
            background: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(160,210,240,0.6)",
            boxShadow: "0 8px 32px rgba(90,150,200,0.20)",
            maxHeight: "calc(100% - 64px)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-black" style={{ color: "#1a3a5c" }}>🐛 Debug Panel</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "#ffeecc", color: "#cc8800" }}>MVP</span>
          </div>

          {/* 현재 상태 요약 */}
          <div className="text-[10px] rounded-xl px-3 py-2 leading-5" style={{ background: "rgba(160,210,240,0.15)", color: "#5a8fa8" }}>
            <div>📅 Day {state.dayCount}/66 &nbsp; {state.todayVerified ? "✓인증완료" : "미인증"}</div>
            <div>♡ 호감도 {state.affection}/660 &nbsp; 🔥{state.streak}연속</div>
            <div>✦ {state.currency}코인 &nbsp; 화면: {state.screen}</div>
            <div>캐릭터: {state.character?.name ?? "없음"}</div>
          </div>

          {/* 빠른 설정 */}
          {section("빠른 설정", <>
            {btn("🏠 홈으로 이동", goHome, "#4aacef")}
            {btn("기본값으로 초기화", () => dispatch({ type: "RESET" }), "#aaaaaa")}
          </>)}

          {/* 화면 이동 */}
          {section("화면 이동", <>
            {(["home","chat","story","dashboard","verification","verificationResult","characterSelect","ending"] as const).map((s) =>
              btn(s, () => { ensureSetup(); dispatch({ type: "SET_SCREEN", screen: s }); }, "#6bbef5")
            )}
          </>)}

          {/* 호감도 */}
          {section("호감도", <>
            {btn("+50", () => dispatch({ type: "ADD_AFFECTION", amount: 50 }), "#4cca7a")}
            {btn("+200", () => dispatch({ type: "ADD_AFFECTION", amount: 200 }), "#4cca7a")}
            {btn("MAX (660)", () => dispatch({ type: "DEBUG_PATCH", patch: { affection: 660 } }), "#2da85a")}
            {btn("0으로 초기화", () => dispatch({ type: "DEBUG_PATCH", patch: { affection: 0 } }), "#aaaaaa")}
          </>)}

          {/* 진행도 */}
          {section("진행도 / 일수", <>
            {btn("+1일", () => dispatch({ type: "DEBUG_PATCH", patch: { dayCount: Math.min(66, state.dayCount + 1), todayVerified: false } }), "#ff9d56")}
            {btn("+10일", () => dispatch({ type: "DEBUG_PATCH", patch: { dayCount: Math.min(66, state.dayCount + 10), todayVerified: false } }), "#ff9d56")}
            {btn("Day 33", () => dispatch({ type: "DEBUG_PATCH", patch: { dayCount: 33, todayVerified: false } }), "#ff8040")}
            {btn("Day 60", () => dispatch({ type: "DEBUG_PATCH", patch: { dayCount: 60, todayVerified: false } }), "#ff8040")}
            {btn("Day 66", () => dispatch({ type: "DEBUG_PATCH", patch: { dayCount: 66, todayVerified: false } }), "#e06020")}
          </>)}

          {/* 스트릭 / 인증 */}
          {section("인증 / 스트릭", <>
            {btn("오늘 인증 처리", () => dispatch({ type: "DEBUG_PATCH", patch: {
              todayVerified: true, verificationSuccess: true,
              completedDays: state.completedDays.includes(state.dayCount) ? state.completedDays : [...state.completedDays, state.dayCount],
            }}), "#4cca7a")}
            {btn("인증 취소", () => dispatch({ type: "DEBUG_PATCH", patch: { todayVerified: false, verificationSuccess: null } }), "#aaaaaa")}
            {btn("스트릭 +5", () => dispatch({ type: "DEBUG_PATCH", patch: { streak: state.streak + 5 } }), "#ff8040")}
          </>)}

          {/* 스토리 */}
          {section("스토리", <>
            {btn("전부 해금", () => dispatch({ type: "DEBUG_PATCH", patch: { unlockedStories: ALL_STORY_IDS } }), "#a78bfa")}
          </>)}

          {/* 엔딩 */}
          {section("엔딩 바로 보기", <>
            {btn("⭐ 베스트 엔딩", () => { ensureSetup(); dispatch({ type: "DEBUG_PATCH", patch: { endingType: "best",   screen: "ending", affection: 600 } }); }, "#f0a020")}
            {btn("✦ 노멀 엔딩",   () => { ensureSetup(); dispatch({ type: "DEBUG_PATCH", patch: { endingType: "normal", screen: "ending", affection: 350 } }); }, "#4aacef")}
            {btn("✧ 배드 엔딩",   () => { ensureSetup(); dispatch({ type: "DEBUG_PATCH", patch: { endingType: "bad",    screen: "ending", affection: 50  } }); }, "#f472b6")}
          </>)}

          {/* 캐릭터 변경 */}
          {section("캐릭터 변경", <>
            {CHARACTERS.map((c) =>
              btn(c.name, () => dispatch({ type: "SET_CHARACTER", character: c }), c.color)
            )}
          </>)}
        </div>
      )}
    </>
  );
}
