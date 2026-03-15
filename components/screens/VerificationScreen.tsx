"use client";

import { useState } from "react";
import { useApp } from "@/components/AppContext";
import GameButton from "@/components/ui/GameButton";
import SparkleEffect from "@/components/ui/SparkleEffect";

type VerifyMethod = "photo" | "text" | "check";

export default function VerificationScreen() {
  const { state, dispatch } = useApp();
  const { habit, character, dayCount } = state;

  const [method, setMethod] = useState<VerifyMethod>("check");
  const [textInput, setTextInput] = useState("");
  const [checking, setChecking] = useState(false);

  const handleVerify = (success: boolean) => {
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
      <div className="flex items-center gap-3 px-5 pt-12 pb-2 z-10">
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
      </div>

      {/* 습관 카드 */}
      <div className="mx-5 glass-panel p-4 z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ background: `${character?.color ?? "var(--gold)"}22` }}
          >
            ✦
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">오늘의 습관</p>
            <p className="font-bold text-[var(--text-primary)]">{habit}</p>
          </div>
        </div>
      </div>

      {/* 인증 방법 탭 */}
      <div className="flex gap-2 px-5 mt-4 z-10">
        {(["check", "text", "photo"] as VerifyMethod[]).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={
              method === m
                ? { background: `${character?.color ?? "#4aacef"}22`, color: character?.color ?? "#4aacef", border: `1px solid ${character?.color ?? "#4aacef"}55` }
                : { background: "rgba(255,255,255,0.70)", color: "var(--text-secondary)", border: "1px solid rgba(160,210,240,0.4)" }
            }
          >
            {m === "check" ? "✓ 완료 체크" : m === "text" ? "✏ 텍스트" : "📷 사진"}
          </button>
        ))}
      </div>

      {/* 인증 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6 z-10">
        {method === "check" && (
          <div className="flex flex-col items-center gap-6 animate-slide-up">
            <button
              onClick={() => !checking && handleVerify(true)}
              className="w-36 h-36 rounded-full glass-panel flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                border: `2px solid ${character?.color ?? "#4aacef"}66`,
                boxShadow: `0 0 40px ${character?.color ?? "#4aacef"}33`,
              }}
            >
              <span className="text-5xl">✓</span>
              <span className="text-sm text-[var(--text-secondary)]">완료했어요</span>
            </button>
            <button
              onClick={() => !checking && handleVerify(false)}
              className="text-xs text-[var(--text-secondary)] underline opacity-60"
            >
              오늘은 못 했어요
            </button>
          </div>
        )}

        {method === "text" && (
          <div className="w-full animate-slide-up">
            <div className="glass-panel p-4 rounded-2xl">
              <textarea
                rows={4}
                placeholder="오늘 습관을 어떻게 실천했는지 적어주세요..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm outline-none resize-none"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <GameButton
                variant="secondary"
                fullWidth
                disabled={!textInput.trim() || checking}
                onClick={() => handleVerify(true)}
                style={{ opacity: textInput.trim() ? 1 : 0.4 }}
              >
                인증 제출
              </GameButton>
              <GameButton
                variant="ghost"
                onClick={() => handleVerify(false)}
                disabled={checking}
              >
                실패
              </GameButton>
            </div>
          </div>
        )}

        {method === "photo" && (
          <div className="flex flex-col items-center gap-4 animate-slide-up">
            <div
              className="w-56 h-56 glass-panel rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-dashed"
              style={{ borderColor: `${character?.color ?? "var(--gold)"}44` }}
            >
              <span className="text-4xl opacity-50">📷</span>
              <span className="text-sm text-[var(--text-secondary)]">사진을 업로드하세요</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] text-center opacity-60">
              MVP 데모에서는 버튼으로 결과를 선택합니다
            </p>
            <div className="flex gap-3">
              <GameButton onClick={() => handleVerify(true)} disabled={checking}>
                ✓ 성공
              </GameButton>
              <GameButton variant="ghost" onClick={() => handleVerify(false)} disabled={checking}>
                실패
              </GameButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
