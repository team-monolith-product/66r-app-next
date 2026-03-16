"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore, CHARACTERS } from "@/store/useAppStore";

const ALL_STORY_IDS = [1, 2, 3, 4, 5, 6];

const SCREEN_ROUTES: Record<string, string> = {
  home: "/home",
  chat: "/chat",
  story: "/story",
  dashboard: "/dashboard",
  verification: "/verification",
  verificationResult: "/verification/result",
  characterSelect: "/setup/character",
  ending: "/ending",
};

export default function DebugPanel() {
  const router = useRouter();
  const pathname = usePathname();

  const dayCount = useAppStore((s) => s.dayCount);
  const todayVerified = useAppStore((s) => s.todayVerified);
  const affection = useAppStore((s) => s.affection);
  const streak = useAppStore((s) => s.streak);
  const currency = useAppStore((s) => s.currency);
  const character = useAppStore((s) => s.character);
  const completedDays = useAppStore((s) => s.completedDays);
  const habits = useAppStore((s) => s.habits);

  const setCharacter = useAppStore((s) => s.setCharacter);
  const setHabits = useAppStore((s) => s.setHabits);
  const addAffection = useAppStore((s) => s.addAffection);
  const reset = useAppStore((s) => s.reset);
  const debugPatch = useAppStore((s) => s.debugPatch);

  const [open, setOpen] = useState(false);

  // 캐릭터+습관이 없으면 기본값 세팅
  const ensureSetup = () => {
    if (!character) setCharacter(CHARACTERS[0]);
    if (!habits || habits.length === 0) {
      setHabits(["매일 운동하기"]);
    }
  };

  const goHome = () => {
    ensureSetup();
    router.push("/home");
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
            <div>📅 Day {dayCount}/66 &nbsp; {todayVerified ? "✓인증완료" : "미인증"}</div>
            <div>♡ 호감도 {affection}/660 &nbsp; 🔥{streak}연속</div>
            <div>✦ {currency}코인 &nbsp; 화면: {pathname}</div>
            <div>캐릭터: {character?.name ?? "없음"}</div>
          </div>

          {/* 빠른 설정 */}
          {section("빠른 설정", <>
            {btn("🏠 홈으로 이동", goHome, "#4aacef")}
            {btn("기본값으로 초기화", () => { reset(); router.push("/"); }, "#aaaaaa")}
          </>)}

          {/* 화면 이동 */}
          {section("화면 이동", <>
            {Object.entries(SCREEN_ROUTES).map(([name, path]) =>
              btn(name, () => { ensureSetup(); router.push(path); }, "#6bbef5")
            )}
          </>)}

          {/* 호감도 */}
          {section("호감도", <>
            {btn("+50", () => addAffection(50), "#4cca7a")}
            {btn("+200", () => addAffection(200), "#4cca7a")}
            {btn("MAX (660)", () => debugPatch({ affection: 660 }), "#2da85a")}
            {btn("0으로 초기화", () => debugPatch({ affection: 0 }), "#aaaaaa")}
          </>)}

          {/* 진행도 */}
          {section("진행도 / 일수", <>
            {btn("+1일", () => debugPatch({ dayCount: Math.min(66, dayCount + 1), todayVerified: false }), "#ff9d56")}
            {btn("+10일", () => debugPatch({ dayCount: Math.min(66, dayCount + 10), todayVerified: false }), "#ff9d56")}
            {btn("Day 33", () => debugPatch({ dayCount: 33, todayVerified: false }), "#ff8040")}
            {btn("Day 60", () => debugPatch({ dayCount: 60, todayVerified: false }), "#ff8040")}
            {btn("Day 66", () => debugPatch({ dayCount: 66, todayVerified: false }), "#e06020")}
          </>)}

          {/* 스트릭 / 인증 */}
          {section("인증 / 스트릭", <>
            {btn("오늘 인증 처리", () => debugPatch({
              todayVerified: true, verificationSuccess: true,
              completedDays: completedDays.includes(dayCount) ? completedDays : [...completedDays, dayCount],
            }), "#4cca7a")}
            {btn("인증 취소", () => debugPatch({ todayVerified: false, verificationSuccess: null }), "#aaaaaa")}
            {btn("스트릭 +5", () => debugPatch({ streak: streak + 5 }), "#ff8040")}
          </>)}

          {/* 스토리 */}
          {section("스토리", <>
            {btn("전부 해금", () => debugPatch({ unlockedStories: ALL_STORY_IDS }), "#a78bfa")}
          </>)}

          {/* 엔딩 */}
          {section("엔딩 바로 보기", <>
            {btn("⭐ 베스트 엔딩", () => { ensureSetup(); debugPatch({ endingType: "best", affection: 600 }); router.push("/ending"); }, "#f0a020")}
            {btn("✦ 노멀 엔딩",   () => { ensureSetup(); debugPatch({ endingType: "normal", affection: 350 }); router.push("/ending"); }, "#4aacef")}
            {btn("✧ 배드 엔딩",   () => { ensureSetup(); debugPatch({ endingType: "bad", affection: 50 }); router.push("/ending"); }, "#f472b6")}
          </>)}

          {/* 캐릭터 변경 */}
          {section("캐릭터 변경", <>
            {CHARACTERS.map((c) =>
              btn(c.name, () => setCharacter(c), c.color)
            )}
          </>)}
        </div>
      )}
    </>
  );
}
