"use client";

import { useState } from "react";
import { useApp } from "@/components/AppContext";
import GameButton from "@/components/ui/GameButton";
import SparkleEffect from "@/components/ui/SparkleEffect";

const SLIDES = [
  {
    icon: "✦",
    title: "66일의 기적",
    desc: "과학적으로 증명된 66일 법칙.\n매일 작은 행동이 쌓여 당신을 바꿉니다.",
  },
  {
    icon: "♡",
    title: "함께하는 동반자",
    desc: "당신만의 캐릭터가 곁에서 응원합니다.\n매일 인증하며 더 가까워지세요.",
  },
  {
    icon: "★",
    title: "66일 후의 엔딩",
    desc: "꾸준히 습관을 지킬수록\n더 특별한 결말이 기다립니다.",
  },
];

export default function OnboardingScreen() {
  const { dispatch } = useApp();
  const [page, setPage] = useState(0);
  const slide = SLIDES[page];

  const next = () => {
    if (page < SLIDES.length - 1) {
      setPage(page + 1);
    } else {
      dispatch({ type: "SET_SCREEN", screen: "habitSetup" });
    }
  };

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col overflow-hidden">
      <SparkleEffect count={10} />

      {/* 건너뛰기 */}
      <button
        className="absolute top-4 right-4 text-[var(--text-secondary)] text-sm z-10"
        onClick={() => dispatch({ type: "SET_SCREEN", screen: "habitSetup" })}
      >
        건너뛰기
      </button>

      {/* 슬라이드 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8 z-10">
        <div
          key={page}
          className="flex flex-col items-center gap-6 animate-slide-up"
        >
          {/* 아이콘 */}
          <div
            className="w-24 h-24 rounded-full glass-panel flex items-center justify-center"
            style={{ boxShadow: "0 0 40px rgba(74,172,239,0.25)" }}
          >
            <span className="text-5xl">
              {slide.icon}
            </span>
          </div>

          {/* 텍스트 */}
          <div className="text-center">
            <h2 className="font-cinzel text-2xl font-bold text-shimmer mb-3">
              {slide.title}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm leading-7 whitespace-pre-line">
              {slide.desc}
            </p>
          </div>
        </div>
      </div>

      {/* 페이지 인디케이터 */}
      <div className="flex justify-center gap-2 mb-6 z-10">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === page ? "20px" : "6px",
              height: "6px",
              background: i === page ? "#4aacef" : "rgba(160,210,240,0.4)",
            }}
          />
        ))}
      </div>

      {/* 버튼 */}
      <div className="px-8 pb-12 z-10">
        <GameButton fullWidth size="lg" onClick={next}>
          {page < SLIDES.length - 1 ? "다음" : "시작하기"}
        </GameButton>
      </div>
    </div>
  );
}
