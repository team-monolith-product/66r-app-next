"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppStore, getRelationshipLevel } from "@/store/useAppStore";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { SparkleBurst } from "@/components/ui/SparkleEffect";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import GameButton from "@/components/ui/GameButton";
import StoryUnlockModal from "@/components/ui/StoryUnlockModal";
import { Check, X, Flame, Sparkles } from "lucide-react";

export default function VerificationResultScreen() {
  const router = useRouter();
  useRouteGuard("verification-done");

  const verificationSuccess = useAppStore((s) => s.verificationSuccess);
  const verificationCharacterMessage = useAppStore((s) => s.verificationCharacterMessage);
  const habitVerificationResults = useAppStore((s) => s.habitVerificationResults);
  const character = useAppStore((s) => s.character);
  const streak = useAppStore((s) => s.streak);
  const affection = useAppStore((s) => s.affection);
  const unlockedStories = useAppStore((s) => s.unlockedStories);
  const pendingStoryRead = useAppStore((s) => s.pendingStoryRead);
  const clearPendingStory = useAppStore((s) => s.clearPendingStory);

  const isSuccess = verificationSuccess === true;

  const currentLevel = getRelationshipLevel(affection);
  const hasNewStory = isSuccess && currentLevel > 1 && unlockedStories.includes(currentLevel);

  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    if (!pendingStoryRead) return;
    const timer = setTimeout(() => setShowUnlockModal(true), 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg, #aad8f0 0%, #caeaf8 22%, #dff2fb 55%, #caeaf8 100%)" }}
    >
      {showUnlockModal && pendingStoryRead && (
        <StoryUnlockModal
          episodeId={pendingStoryRead}
          onRead={() => router.push("/story")}
          onDismiss={() => { clearPendingStory(); setShowUnlockModal(false); }}
        />
      )}
      {isSuccess && <SparkleBurst />}

      <div className="flex-1 flex flex-col justify-center gap-5 px-6 z-10 animate-slide-up">
        {/* 결과 아이콘 + 제목 */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{
              background: `${resultColor}22`,
              border: `2px solid ${resultColor}66`,
              boxShadow: `0 0 40px ${resultColor}33`,
            }}
          >
            {isSuccess ? <Check size={36} strokeWidth={3} /> : <X size={36} strokeWidth={3} />}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black" style={{ color: resultColor }}>
              {isSuccess ? "인증 성공!" : "인증 실패"}
            </h2>
            {isSuccess && streak > 1 && (
              <p className="flex items-center justify-center gap-1 text-sm mt-1" style={{ color: "#7a9bb5" }}><Flame size={14} color="#ff8040" /> {streak}일 연속 달성!</p>
            )}
          </div>
        </div>

        {/* 캐릭터 + 말풍선 (가로 배치) */}
        {character && (
          <div className="flex items-end gap-3">
            <CharacterDisplay character={character} size="sm" mood={isSuccess ? "happy" : "sad"} disableZoom />
            <div
              className="flex-1 px-4 py-3 rounded-2xl rounded-bl-sm"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: `1px solid ${character.color}44`,
                boxShadow: `0 2px 12px ${character.color}18`,
              }}
            >
              <p className="text-sm leading-relaxed italic" style={{ color: "#1a3a5c" }}>"{message}"</p>
            </div>
          </div>
        )}

        {/* 습관별 결과 */}
        {habitVerificationResults && habitVerificationResults.length > 0 && (
          <div
            className="px-4 py-3 rounded-2xl flex flex-col gap-2"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(160,210,240,0.55)",
              boxShadow: "0 2px 12px rgba(90,150,200,0.10)",
            }}
          >
            {habitVerificationResults.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                  style={{
                    background: r.verified ? "#4cca7a22" : "#f8717122",
                    color: r.verified ? "#4cca7a" : "#f87171",
                    border: `1px solid ${r.verified ? "#4cca7a66" : "#f8717166"}`,
                  }}
                >
                  {r.verified ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
                </span>
                <span className="text-sm" style={{ color: "#1a3a5c" }}>
                  {r.habit}
                </span>
                <span
                  className="ml-auto text-[11px] font-bold"
                  style={{ color: r.verified ? "#4cca7a" : "#f87171" }}
                >
                  {r.verified ? "통과" : "미통과"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 획득 보상 */}
        {isSuccess && (
          <div
            className="px-6 py-4 flex gap-6 justify-center text-center rounded-2xl"
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
                  <div className="flex justify-center"><Sparkles size={20} color="#a78bfa" /></div>
                  <div className="text-[10px]" style={{ color: "#7a9bb5" }}>스토리</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 버튼 — 하단 고정, 세로 스택 */}
      <div className="px-6 pb-10 pt-3 z-10 flex flex-col gap-2">
        {isSuccess ? (
          <GameButton fullWidth size="lg" onClick={() => router.push("/home")}>
            홈으로
          </GameButton>
        ) : (
          <>
            <GameButton fullWidth size="lg" onClick={() => router.push("/verification")}>
              다시 시도
            </GameButton>
            <GameButton variant="ghost" fullWidth onClick={() => router.push("/home")}>
              홈으로
            </GameButton>
          </>
        )}
      </div>
    </div>
  );
}
