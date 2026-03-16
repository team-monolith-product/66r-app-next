"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function SplashScreen() {
  const router = useRouter();
  const habits = useAppStore((s) => s.habits);
  const character = useAppStore((s) => s.character);

  useEffect(() => {
    const t = setTimeout(() => {
      if (habits.length > 0 && character) {
        router.replace("/home");
      } else {
        router.replace("/onboarding");
      }
    }, 2600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #7ec8e8 0%, #aad8f0 30%, #caeaf8 60%, #dff2fb 100%)" }}
    >
      {/* 구름 장식 */}
      <div className="absolute top-16 left-6 w-20 h-8 rounded-full opacity-60" style={{ background: "rgba(255,255,255,0.7)", filter: "blur(6px)" }} />
      <div className="absolute top-10 right-10 w-14 h-6 rounded-full opacity-50" style={{ background: "rgba(255,255,255,0.7)", filter: "blur(5px)" }} />
      <div className="absolute top-28 right-4 w-24 h-8 rounded-full opacity-40" style={{ background: "rgba(255,255,255,0.7)", filter: "blur(6px)" }} />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in">
        {/* 왕관 아이콘 */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{
            background: "rgba(255,255,255,0.80)",
            border: "2px solid rgba(74,172,239,0.4)",
            boxShadow: "0 4px 24px rgba(74,172,239,0.25)",
          }}
        >
          ♛
        </div>

        {/* 타이틀 */}
        <div className="text-center">
          <h1 className="font-cinzel text-5xl font-bold text-shimmer tracking-widest">66r</h1>
          <p className="text-sm mt-2 tracking-[0.3em]" style={{ color: "#5a90b8" }}>HABIT × ROMANCE</p>
        </div>

        <p className="text-xs text-center leading-relaxed mt-2" style={{ color: "#7a9bb5" }}>
          66일이 당신을 바꿉니다
        </p>

        {/* 로딩 도트 */}
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: "#4aacef",
                animation: `sparkle-twinkle 1.2s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 text-[10px] tracking-widest opacity-40" style={{ color: "#5a90b8" }}>
        TEAM 66R
      </div>
    </div>
  );
}
