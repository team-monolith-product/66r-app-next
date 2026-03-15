"use client";

import { useEffect } from "react";
import { useApp } from "@/components/AppContext";
import { SparkleBurst } from "@/components/ui/SparkleEffect";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import GameButton from "@/components/ui/GameButton";

export default function VerificationResultScreen() {
  const { state, dispatch } = useApp();
  const { verificationSuccess, character, streak, dayCount, unlockedStories } = state;

  const isSuccess = verificationSuccess === true;

  // 새로 언락된 스토리 확인
  const storyId = Math.floor(dayCount / 10);
  const hasNewStory = storyId > 0 && unlockedStories.includes(storyId) &&
    dayCount % 10 === 0;

  const successMessages = [
    "…오늘도 해냈네. 잘했어.",
    "역시 믿었어! 대단해!",
    "꾸준함이 가장 큰 힘이야.",
  ];

  const failMessages = [
    "…뭐, 내일 다시 하면 돼.",
    "실망이야. 내일은 꼭 해.",
    "포기하지는 마. 다시 시작해.",
  ];

  const messages = isSuccess ? successMessages : failMessages;
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col items-center justify-center overflow-hidden">
      {isSuccess && <SparkleBurst />}

      <div className="flex flex-col items-center gap-6 px-8 z-10 animate-slide-up">
        {/* 결과 아이콘 */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{
            background: isSuccess
              ? "linear-gradient(135deg, rgba(240,192,64,0.2) 0%, rgba(167,139,250,0.2) 100%)"
              : "rgba(239,68,68,0.15)",
            border: `2px solid ${isSuccess ? "var(--gold)" : "#ef4444"}44`,
            boxShadow: `0 0 40px ${isSuccess ? "rgba(240,192,64,0.3)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          {isSuccess ? "✓" : "✗"}
        </div>

        {/* 제목 */}
        <div className="text-center">
          <h2
            className="font-cinzel text-2xl font-bold"
            style={{ color: isSuccess ? "var(--gold)" : "#ef4444" }}
          >
            {isSuccess ? "인증 성공!" : "인증 실패"}
          </h2>
          {isSuccess && streak > 1 && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              🔥 {streak}일 연속 달성!
            </p>
          )}
        </div>

        {/* 캐릭터 + 말풍선 */}
        {character && (
          <div className="flex flex-col items-center gap-3">
            <CharacterDisplay
              character={character}
              size="md"
              mood={isSuccess ? "happy" : "sad"}
            />
            <div className="glass-panel px-4 py-3 max-w-[260px] text-center">
              <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
                "{message}"
              </p>
            </div>
          </div>
        )}

        {/* 획득 보상 */}
        {isSuccess && (
          <div className="glass-panel px-6 py-3 flex gap-6 text-center">
            <div>
              <div className="text-[var(--gold)] font-bold text-lg">+10</div>
              <div className="text-[10px] text-[var(--text-secondary)]">호감도</div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="text-[var(--gold)] font-bold text-lg">+10</div>
              <div className="text-[10px] text-[var(--text-secondary)]">코인</div>
            </div>
            {hasNewStory && (
              <>
                <div className="w-px bg-white/10" />
                <div>
                  <div className="text-[var(--gold)] font-bold text-lg">✦</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">스토리</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 w-full">
          <GameButton
            fullWidth
            onClick={() => dispatch({ type: "SET_SCREEN", screen: "home" })}
          >
            홈으로
          </GameButton>
          {isSuccess && (
            <GameButton
              variant="secondary"
              fullWidth
              onClick={() => dispatch({ type: "SET_SCREEN", screen: "chat" })}
            >
              ♡ 대화하기
            </GameButton>
          )}
        </div>
      </div>
    </div>
  );
}
