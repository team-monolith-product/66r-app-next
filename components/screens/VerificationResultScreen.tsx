"use client";

import { useApp } from "@/components/AppContext";
import { SparkleBurst } from "@/components/ui/SparkleEffect";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import GameButton from "@/components/ui/GameButton";

export default function VerificationResultScreen() {
  const { state, dispatch } = useApp();
  const { verificationSuccess, verificationCharacterMessage, character, streak, dayCount, unlockedStories } = state;

  const isSuccess = verificationSuccess === true;

  const storyId = Math.floor(dayCount / 10);
  const hasNewStory = storyId > 0 && unlockedStories.includes(storyId) && dayCount % 10 === 0;

  const successMessages = ["…오늘도 해냈네. 잘했어.", "역시 믿었어! 대단해!", "꾸준함이 가장 큰 힘이야."];
  const failMessages    = ["…뭐, 내일 다시 하면 돼.", "실망이야. 내일은 꼭 해.", "포기하지는 마. 다시 시작해."];
  const fallbackMessages = isSuccess ? successMessages : failMessages;
  const message = verificationCharacterMessage
    ?? fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

  const successColor = "#4cca7a";
  const failColor    = "#f87171";
  const resultColor  = isSuccess ? successColor : failColor;

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #aad8f0 0%, #caeaf8 22%, #dff2fb 55%, #caeaf8 100%)" }}
    >
      {isSuccess && <SparkleBurst />}

      <div className="flex flex-col items-center gap-6 px-8 z-10 animate-slide-up">
        {/* 결과 아이콘 */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{
            background: `${resultColor}22`,
            border: `2px solid ${resultColor}66`,
            boxShadow: `0 0 40px ${resultColor}33`,
          }}
        >
          {isSuccess ? "✓" : "✗"}
        </div>

        {/* 제목 */}
        <div className="text-center">
          <h2 className="text-2xl font-black" style={{ color: resultColor }}>
            {isSuccess ? "인증 성공!" : "인증 실패"}
          </h2>
          {isSuccess && streak > 1 && (
            <p className="text-sm mt-1" style={{ color: "#7a9bb5" }}>🔥 {streak}일 연속 달성!</p>
          )}
        </div>

        {/* 캐릭터 + 말풍선 */}
        {character && (
          <div className="flex flex-col items-center gap-3">
            <CharacterDisplay character={character} size="md" mood={isSuccess ? "happy" : "sad"} />
            <div
              className="px-4 py-3 max-w-[260px] text-center rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(160,210,240,0.55)",
                boxShadow: "0 2px 12px rgba(90,150,200,0.10)",
              }}
            >
              <p className="text-sm leading-relaxed italic" style={{ color: "#1a3a5c" }}>"{message}"</p>
            </div>
          </div>
        )}

        {/* 획득 보상 */}
        {isSuccess && (
          <div
            className="px-6 py-3 flex gap-6 text-center rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(160,210,240,0.55)",
              boxShadow: "0 2px 12px rgba(90,150,200,0.10)",
            }}
          >
            <div>
              <div className="font-black text-lg" style={{ color: successColor }}>+10</div>
              <div className="text-[10px]" style={{ color: "#7a9bb5" }}>호감도</div>
            </div>
            <div className="w-px" style={{ background: "rgba(160,210,240,0.5)" }} />
            <div>
              <div className="font-black text-lg" style={{ color: "#f0c040" }}>+10</div>
              <div className="text-[10px]" style={{ color: "#7a9bb5" }}>코인</div>
            </div>
            {hasNewStory && (
              <>
                <div className="w-px" style={{ background: "rgba(160,210,240,0.5)" }} />
                <div>
                  <div className="font-black text-lg" style={{ color: "#a78bfa" }}>✦</div>
                  <div className="text-[10px]" style={{ color: "#7a9bb5" }}>스토리</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 w-full">
          <GameButton fullWidth onClick={() => dispatch({ type: "SET_SCREEN", screen: "home" })}>
            홈으로
          </GameButton>
          {isSuccess && (
            <GameButton variant="secondary" fullWidth onClick={() => dispatch({ type: "SET_SCREEN", screen: "chat" })}>
              ♡ 대화하기
            </GameButton>
          )}
        </div>
      </div>
    </div>
  );
}
