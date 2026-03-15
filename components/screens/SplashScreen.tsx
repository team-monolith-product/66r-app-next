"use client";

import { useEffect } from "react";
import { useApp } from "@/components/AppContext";
import SparkleEffect from "@/components/ui/SparkleEffect";

export default function SplashScreen() {
  const { dispatch } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch({ type: "SET_SCREEN", screen: "onboarding" });
    }, 2600);
    return () => clearTimeout(t);
  }, [dispatch]);

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col items-center justify-center overflow-hidden">
      <SparkleEffect count={18} />

      {/* 로고 */}
      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in">
        {/* 왕관 아이콘 */}
        <div className="text-6xl" style={{ textShadow: "0 0 30px var(--gold)" }}>
          ♛
        </div>

        {/* 타이틀 */}
        <div className="text-center">
          <h1
            className="font-cinzel text-5xl font-bold text-shimmer tracking-widest"
          >
            66r
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2 tracking-[0.3em]">
            HABIT × ROMANCE
          </p>
        </div>

        {/* 태그라인 */}
        <p className="text-[var(--text-secondary)] text-xs text-center leading-relaxed mt-2">
          66일이 당신을 바꿉니다
        </p>

        {/* 로딩 도트 */}
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: "var(--gold)",
                animation: `sparkle-twinkle 1.2s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 하단 회사명 */}
      <div className="absolute bottom-8 text-[var(--text-secondary)] text-[10px] tracking-widest opacity-50">
        TEAM 66R
      </div>
    </div>
  );
}
