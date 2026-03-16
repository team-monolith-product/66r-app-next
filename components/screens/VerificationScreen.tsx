"use client";

import { useState } from "react";
import { useApp } from "@/components/AppContext";
import GameButton from "@/components/ui/GameButton";
import SparkleEffect from "@/components/ui/SparkleEffect";

export default function VerificationScreen() {
  const { state, dispatch } = useApp();
  const { habits, todayHabitChecks, character, dayCount } = state;

  const [checking, setChecking] = useState(false);

  const allChecked = habits.length > 0 && todayHabitChecks.slice(0, habits.length).every(Boolean);
  const checkedCount = todayHabitChecks.slice(0, habits.length).filter(Boolean).length;

  const handleSubmit = (success: boolean) => {
    setChecking(true);
    setTimeout(() => {
      if (success) {
        dispatch({ type: "VERIFY_SUCCESS" });
      } else {
        dispatch({ type: "VERIFY_FAIL" });
      }
      dispatch({ type: "SET_SCREEN", screen: "verificationResult" });
    }, 800);
  };

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col overflow-hidden">
      <SparkleEffect count={6} />

      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 z-10">
        <button
          className="text-[var(--text-secondary)]"
          onClick={() => dispatch({ type: "SET_SCREEN", screen: "home" })}
        >
          ←
        </button>
        <div>
          <p className="text-xs text-[var(--text-secondary)] tracking-widest uppercase">Day {dayCount}</p>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">오늘의 인증</h2>
        </div>
        <div className="ml-auto text-sm font-bold" style={{ color: character?.color ?? "#4aacef" }}>
          {checkedCount}/{habits.length}
        </div>
      </div>

      {/* 진행 바 */}
      <div className="mx-5 mb-4 z-10">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: habits.length > 0 ? `${(checkedCount / habits.length) * 100}%` : "0%",
              background: `linear-gradient(90deg, ${character?.color ?? "#4aacef"}, ${character?.accentColor ?? "#2563eb"})`,
            }}
          />
        </div>
      </div>

      {/* 습관 체크리스트 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 z-10 flex flex-col gap-3 pb-4">
        {habits.map((habit, i) => {
          const done = todayHabitChecks[i] ?? false;
          return (
            <button
              key={i}
              onClick={() => !checking && dispatch({ type: "TOGGLE_HABIT_CHECK", index: i })}
              className="w-full glass-panel p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98]"
              style={
                done
                  ? {
                      border: `1px solid ${character?.color ?? "#4aacef"}88`,
                      background: `${character?.color ?? "#4aacef"}12`,
                      boxShadow: `0 0 16px ${character?.color ?? "#4aacef"}22`,
                    }
                  : {}
              }
            >
              {/* 체크 원 */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={
                  done
                    ? {
                        background: character?.color ?? "#4aacef",
                        boxShadow: `0 0 12px ${character?.color ?? "#4aacef"}55`,
                      }
                    : {
                        border: `2px solid ${character?.color ?? "#4aacef"}44`,
                        background: "rgba(255,255,255,0.5)",
                      }
                }
              >
                {done ? (
                  <span className="text-white font-black text-lg">✓</span>
                ) : (
                  <span className="text-lg" style={{ color: `${character?.color ?? "#4aacef"}66` }}>○</span>
                )}
              </div>

              {/* 습관 텍스트 */}
              <div className="flex-1 text-left">
                <p
                  className="font-bold text-sm leading-tight"
                  style={{
                    color: done ? (character?.color ?? "#4aacef") : "var(--text-primary)",
                    textDecoration: done ? "line-through" : "none",
                    opacity: done ? 0.8 : 1,
                  }}
                >
                  {habit}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {done ? "완료!" : "탭해서 완료 처리"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      <div className="px-5 pb-10 pt-3 z-10 flex flex-col gap-2">
        <GameButton
          fullWidth
          size="lg"
          disabled={!allChecked || checking}
          onClick={() => handleSubmit(true)}
          style={{ opacity: allChecked ? 1 : 0.4 }}
        >
          {allChecked ? "✓ 모든 습관 인증 완료!" : `${habits.length - checkedCount}개 남았어요`}
        </GameButton>
        <button
          onClick={() => !checking && handleSubmit(false)}
          className="text-xs text-center py-2"
          style={{ color: "var(--text-secondary)", opacity: 0.6 }}
        >
          오늘은 못 했어요
        </button>
      </div>
    </div>
  );
}
