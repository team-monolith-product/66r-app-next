"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import SparkleEffect from "@/components/ui/SparkleEffect";
import { ImagePlus, X, ArrowUp } from "lucide-react";

const HABIT_OPENING: Record<string, (habit: string) => string> = {
  tsundere: (h) => `다음은 "${h}". 했으면 증명해봐.`,
  genki: (h) => `다음은 "${h}"야! 어떻게 했어? 보여줘!`,
  intellectual: (h) => `다음 습관: "${h}". 증거를 제시해주세요.`,
};

const PHOTO_CHECK_MESSAGES: Record<string, string> = {
  tsundere: "…이 사진, 직접 찍은 거 맞아? 인터넷 사진 아니지?",
  genki: "사진 잘 봤어! 혹시 오늘 직접 찍은 거 맞지?",
  intellectual: "증거 확인되었습니다. 이 사진은 오늘 직접 촬영한 것이 맞나요?",
};

const CLOSING_MESSAGES: Record<string, (success: boolean) => string> = {
  tsundere: (ok) => ok ? "…뭐, 다 됐네. 오늘은 인정해줄게." : "이번엔 부족했어. 내일은 제대로 해.",
  genki: (ok) => ok ? "완벽해!! 오늘도 최고야!!" : "아쉽다~ 내일은 꼭 같이 하자!",
  intellectual: (ok) => ok ? "인증 완료. 오늘의 데이터가 기록되었습니다." : "인증 미달. 내일 재시도를 권장합니다.",
};

const GIVE_UP_MESSAGES: Record<string, string> = {
  tsundere: "…그래. 오늘은 쉬어. 내일은 변명 없이 해.",
  genki: "에이~ 괜찮아! 내일 두 배로 하면 되잖아!",
  intellectual: "오늘의 데이터는 실패입니다. 내일 재개하세요.",
};

type ApiMessage = {
  role: "user" | "assistant";
  text: string;
  imageBase64?: string;
  imageMediaType?: string;
};

type PhotoData = {
  base64: string;
  mediaType: string;
  preview: string;
};

type SentMessage = {
  text: string;
  imagePreview?: string;
};

function useTypewriter(text: string, speed = 26) {
  const [displayed, setDisplayed] = useState(text);

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return displayed;
}

export default function VerificationScreen() {
  const router = useRouter();
  useRouteGuard("setup-complete");

  const habits = useAppStore((s) => s.habits);
  const character = useAppStore((s) => s.character);
  const dayCount = useAppStore((s) => s.dayCount);
  const streak = useAppStore((s) => s.streak);
  const verifySuccess = useAppStore((s) => s.verifySuccess);
  const verifyFail = useAppStore((s) => s.verifyFail);

  const characterType = character?.type ?? "genki";
  const charColor = character?.color ?? "#4aacef";

  const firstHabitOpening = HABIT_OPENING[characterType]?.(habits[0] ?? "") ?? "";

  // 습관 진행 상태
  const [habitIndex, setHabitIndex] = useState(0);
  const [habitResults, setHabitResults] = useState<{ habit: string; verified: boolean }[]>([]);
  const [habitTurnCount, setHabitTurnCount] = useState(0);
  const [habitMessages, setHabitMessages] = useState<ApiMessage[]>([
    { role: "assistant", text: firstHabitOpening },
  ]);

  // UI 상태
  const [charMessage, setCharMessage] = useState(firstHabitOpening);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [attachedPhoto, setAttachedPhoto] = useState<PhotoData | null>(null);
  const [sentMessage, setSentMessage] = useState<SentMessage | null>(null);
  const [waitingPhotoConfirm, setWaitingPhotoConfirm] = useState(false);

  const typedMessage = useTypewriter(charMessage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = (inputText.trim().length > 0 || attachedPhoto !== null) && !loading;

  const moveToNextHabit = (verified: boolean) => {
    const newResults = [...habitResults, { habit: habits[habitIndex], verified }];
    setHabitResults(newResults);

    if (habitIndex + 1 >= habits.length) {
      const passCount = newResults.filter((r) => r.verified).length;
      const overallVerified = passCount * 2 >= habits.length;
      const closingMsg = (CLOSING_MESSAGES[characterType] ?? CLOSING_MESSAGES.genki)(overallVerified);
      if (overallVerified) {
        verifySuccess(closingMsg, newResults);
      } else {
        verifyFail(closingMsg, newResults);
      }
      router.push("/verification/result");
    } else {
      const nextHabit = habits[habitIndex + 1];
      const openingMsg = HABIT_OPENING[characterType]?.(nextHabit) ?? "";
      setHabitIndex(habitIndex + 1);
      setHabitMessages([{ role: "assistant", text: openingMsg }]);
      setHabitTurnCount(0);
      setWaitingPhotoConfirm(false);
      setSentMessage(null);
      setCharMessage(openingMsg);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX = 1024;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        setAttachedPhoto({
          base64: compressed.split(",")[1],
          mediaType: "image/jpeg",
          preview: compressed,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSend = async () => {
    if (!canSend) return;
    const userText = inputText.trim();
    const photo = attachedPhoto;
    const newTurnCount = habitTurnCount + 1;

    setSentMessage({ text: userText, imagePreview: photo?.preview });
    setInputText("");
    setAttachedPhoto(null);
    setLoading(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const newUserMsg: ApiMessage = {
      role: "user",
      text: userText,
      imageBase64: photo?.base64,
      imageMediaType: photo?.mediaType,
    };
    const updatedMessages = [...habitMessages, newUserMsg];
    setHabitMessages(updatedMessages);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit: habits[habitIndex],
          characterType: character?.type ?? "genki",
          characterName: character?.name ?? "캐릭터",
          dayCount,
          streak,
          messages: updatedMessages,
          habitTurnCount: newTurnCount,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = (await res.json()) as {
        action: "photo_check" | "follow_up" | "irrelevant";
        message: string;
      };

      if (data.action === "photo_check") {
        const photoMsg = PHOTO_CHECK_MESSAGES[characterType] ?? PHOTO_CHECK_MESSAGES.genki;
        setHabitMessages((prev) => [...prev, { role: "assistant", text: photoMsg }]);
        setCharMessage(photoMsg);
        setWaitingPhotoConfirm(true);
        setSentMessage(null);
        setLoading(false);
      } else if (data.action === "follow_up") {
        setHabitMessages((prev) => [...prev, { role: "assistant", text: data.message }]);
        setCharMessage(data.message);
        setHabitTurnCount(newTurnCount);
        setSentMessage(null);
        setLoading(false);
      } else {
        // irrelevant
        setCharMessage(data.message);
        setSentMessage(null);
        setLoading(false);
        setTimeout(() => moveToNextHabit(false), 1800);
      }
    } catch {
      setSentMessage(null);
      setCharMessage("오류가 발생했어요. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGiveUp = () => {
    verifyFail(GIVE_UP_MESSAGES[characterType] ?? GIVE_UP_MESSAGES.genki);
    router.push("/verification/result");
  };

  return (
    <div className="relative w-full h-full overflow-hidden game-gradient-bg flex flex-col">
      <SparkleEffect count={8} />

      {/* ── Top HUD ────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95"
          style={{
            background: "rgba(255,255,255,0.72)",
            color: charColor,
            border: `1px solid ${charColor}44`,
            backdropFilter: "blur(10px)",
          }}
        >
          ← 홈
        </button>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: "rgba(255,255,255,0.72)",
            color: charColor,
            border: `1px solid ${charColor}44`,
            backdropFilter: "blur(10px)",
          }}
        >
          Day {dayCount}
          <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
            &nbsp;· {habitIndex + 1}/{habits.length} 습관
          </span>
        </div>

        <button
          onClick={handleGiveUp}
          className="text-xs px-3 py-1.5 rounded-full transition-all active:scale-95"
          style={{
            background: "rgba(255,255,255,0.55)",
            color: "var(--text-secondary)",
            border: "1px solid rgba(120,160,190,0.28)",
            backdropFilter: "blur(10px)",
          }}
        >
          포기
        </button>
      </div>

      {/* ── Character Stage ─────────────────────────────────── */}
      <div className="absolute inset-0 flex items-end justify-center z-10 pointer-events-none">
        {character && (
          <CharacterDisplay
            character={character}
            size="hero"
            mood={loading ? "neutral" : "happy"}
          />
        )}
      </div>

      {/* ── VN Dialog Box ───────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col">
        {/* User sent message (floats above box) */}
        {sentMessage && (
          <div className="flex items-end justify-end gap-2 px-5 pb-2">
            {sentMessage.imagePreview && (
              <img
                src={sentMessage.imagePreview}
                alt="첨부"
                className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                style={{
                  border: `2px solid ${charColor}66`,
                  boxShadow: `0 2px 8px ${charColor}33`,
                }}
              />
            )}
            {sentMessage.text && (
              <div
                className="max-w-[72%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-snug"
                style={{
                  background: charColor,
                  color: "#fff",
                  boxShadow: `0 3px 14px ${charColor}55`,
                }}
              >
                {sentMessage.text}
              </div>
            )}
          </div>
        )}

        {/* Photo attach preview (before sending) */}
        {attachedPhoto && !sentMessage && (
          <div className="flex items-end justify-end px-5 pb-2">
            <div className="relative">
              <img
                src={attachedPhoto.preview}
                alt="첨부 미리보기"
                className="w-16 h-16 object-cover rounded-xl"
                style={{
                  border: `2px solid ${charColor}66`,
                  boxShadow: `0 2px 8px ${charColor}33`,
                }}
              />
              <button
                onClick={() => setAttachedPhoto(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
              >
                <X size={10} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        {/* Dialog panel */}
        <div
          style={{
            background: "rgba(255,255,255,0.94)",
            borderTop: `2.5px solid ${charColor}55`,
            boxShadow: `0 -8px 40px rgba(90,150,200,0.16)`,
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Character name + message */}
          <div className="px-5 pt-4 pb-3">
            <span
              className="inline-block text-xs font-bold px-3 py-0.5 rounded-full mb-2.5"
              style={{
                background: `${charColor}18`,
                color: charColor,
                border: `1px solid ${charColor}44`,
              }}
            >
              {character?.name ?? "캐릭터"}
            </span>

            <div className="min-h-[3rem]" style={{ color: "var(--text-primary)" }}>
              {loading ? (
                <div className="flex gap-1.5 items-center mt-1">
                  {[0, 1, 2].map((j) => (
                    <span
                      key={j}
                      className="inline-block w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: charColor,
                        animationDelay: `${j * 0.16}s`,
                        opacity: 0.75,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-relaxed font-medium">
                  {typedMessage}
                  <span
                    className="inline-block w-0.5 h-4 ml-px align-text-bottom animate-pulse"
                    style={{
                      background: charColor,
                      opacity: typedMessage === charMessage ? 0 : 1,
                    }}
                  />
                </p>
              )}
            </div>
          </div>

          {/* Input area: Yes/No 버튼 or 입력창 */}
          {waitingPhotoConfirm ? (
            <div
              className="flex gap-3 px-4 pb-10 pt-2"
              style={{ borderTop: `1px solid ${charColor}1a` }}
            >
              <button
                onClick={() => moveToNextHabit(true)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
                style={{
                  background: charColor,
                  color: "#fff",
                  boxShadow: `0 2px 14px ${charColor}55`,
                }}
              >
                예, 직접 찍었어
              </button>
              <button
                onClick={() => moveToNextHabit(false)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95"
                style={{
                  background: "rgba(0,0,0,0.06)",
                  color: "var(--text-secondary)",
                  border: "1.5px solid rgba(120,160,190,0.28)",
                }}
              >
                아니, 인터넷 사진이야
              </button>
            </div>
          ) : (
            <div
              className="flex items-end gap-2 px-4 pb-10 pt-2"
              style={{ borderTop: `1px solid ${charColor}1a` }}
            >
              {/* Photo button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: attachedPhoto ? `${charColor}22` : "rgba(0,0,0,0.05)",
                  border: `1.5px solid ${attachedPhoto ? charColor : charColor + "33"}`,
                  color: attachedPhoto ? charColor : "var(--text-secondary)",
                }}
              >
                <ImagePlus size={20} strokeWidth={1.8} />
              </button>

              {/* Text input */}
              <textarea
                ref={textareaRef}
                className="flex-1 rounded-2xl px-4 py-2.5 text-sm resize-none outline-none hide-scrollbar"
                rows={1}
                placeholder="메시지를 입력하세요…"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
                }}
                onKeyDown={handleKeyDown}
                disabled={loading}
                style={{
                  background: "rgba(0,0,0,0.05)",
                  color: "var(--text-primary)",
                  border: `1.5px solid ${charColor}33`,
                  maxHeight: "80px",
                }}
              />

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 font-bold text-base"
                style={{
                  background: canSend ? charColor : `${charColor}2a`,
                  color: canSend ? "#fff" : `${charColor}66`,
                  boxShadow: canSend ? `0 2px 14px ${charColor}55` : "none",
                  transition: "all 0.18s ease",
                }}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
