"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import GameButton from "@/components/ui/GameButton";
import SparkleEffect from "@/components/ui/SparkleEffect";
import CharacterDisplay from "@/components/ui/CharacterDisplay";

const INITIAL_PROMPTS: Record<string, string> = {
  tsundere: "오늘 습관 지켰어? 증명해봐.",
  genki: "오늘 뭐 했는지 보여줘! 기대하고 있어!",
  intellectual: "오늘의 습관 이행을 검증해드리겠습니다. 증거를 제시해주세요.",
};

const GIVE_UP_MESSAGES: Record<string, string> = {
  tsundere: "…그래. 오늘은 쉬어. 내일은 변명 없이 해.",
  genki: "에이~ 괜찮아! 내일 두 배로 하면 되잖아!",
  intellectual: "오늘의 데이터는 실패입니다. 내일 재개하세요.",
};

type InputTab = "text" | "image";
type HabitImage = { base64: string; mediaType: string; preview: string } | null;

export default function VerificationScreen() {
  const router = useRouter();
  useRouteGuard("setup-complete");

  const habits = useAppStore((s) => s.habits);
  const character = useAppStore((s) => s.character);
  const dayCount = useAppStore((s) => s.dayCount);
  const verifySuccess = useAppStore((s) => s.verifySuccess);
  const verifyFail = useAppStore((s) => s.verifyFail);

  const [tab, setTab] = useState<InputTab>("text");
  const [textContent, setTextContent] = useState("");
  const [habitImages, setHabitImages] = useState<HabitImage[]>(() => habits.map(() => null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSlotRef = useRef<number>(-1);

  const characterType = character?.type ?? "genki";
  const prompt = INITIAL_PROMPTS[characterType] ?? INITIAL_PROMPTS.genki;
  const canSubmit =
    tab === "text"
      ? textContent.trim().length > 0
      : habitImages.some((img) => img !== null);

  const triggerFileInput = (slotIndex: number) => {
    pendingSlotRef.current = slotIndex;
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const slot = pendingSlotRef.current;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setHabitImages((prev) => {
        const next = [...prev];
        next[slot] = {
          base64: dataUrl.split(",")[1],
          mediaType: file.type || "image/jpeg",
          preview: dataUrl,
        };
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);

    try {
      const input =
        tab === "text"
          ? { type: "text" as const, content: textContent }
          : {
              type: "image" as const,
              habitImages: habitImages.map((img) =>
                img ? { base64: img.base64, mediaType: img.mediaType } : null
              ),
            };

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habits,
          characterType: character?.type ?? "genki",
          characterName: character?.name ?? "캐릭터",
          input,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const { habitResults, overallVerified, message } = (await res.json()) as {
        habitResults: { habit: string; verified: boolean }[];
        overallVerified: boolean;
        message: string;
      };

      if (overallVerified) {
        verifySuccess(message, habitResults);
      } else {
        verifyFail(message, habitResults);
      }
      router.push("/verification/result");
    } catch {
      setError("인증 요청에 실패했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleGiveUp = () => {
    const message = GIVE_UP_MESSAGES[characterType] ?? GIVE_UP_MESSAGES.genki;
    verifyFail(message);
    router.push("/verification/result");
  };

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col overflow-hidden">
      <SparkleEffect count={6} />

      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 z-10">
        <button
          className="text-[var(--text-secondary)]"
          onClick={() => router.push("/home")}
        >
          ←
        </button>
        <div>
          <p className="text-xs text-[var(--text-secondary)] tracking-widest uppercase">Day {dayCount}</p>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">오늘의 인증</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 z-10 flex flex-col gap-4 pb-4">
        {/* 캐릭터 + 말풍선 */}
        {character && (
          <div className="flex items-end gap-3">
            <CharacterDisplay character={character} size="sm" mood="neutral" />
            <div
              className="flex-1 px-4 py-3 rounded-2xl rounded-bl-sm"
              style={{
                background: "rgba(255,255,255,0.88)",
                border: `1px solid ${character.color}44`,
                boxShadow: `0 2px 12px ${character.color}18`,
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "#1a3a5c" }}>
                {loading ? "판단 중…" : prompt}
              </p>
            </div>
          </div>
        )}

        {/* 탭 */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          {(["text", "image"] as InputTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 text-sm font-bold transition-all"
              style={
                tab === t
                  ? {
                      background: character?.color ?? "#4aacef",
                      color: "#fff",
                      borderRadius: "10px",
                    }
                  : { color: "var(--text-secondary)" }
              }
            >
              {t === "text" ? "📝 텍스트" : "📷 사진"}
            </button>
          ))}
        </div>

        {/* 입력 영역 */}
        {tab === "text" ? (
          <textarea
            className="w-full glass-panel rounded-2xl p-4 text-sm resize-none outline-none"
            rows={5}
            placeholder="오늘 어떻게 했는지 구체적으로 적어주세요..."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            style={{ color: "var(--text-primary)" }}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs px-1" style={{ color: "var(--text-secondary)" }}>
              각 습관마다 사진 1장씩 업로드하세요. 반 이상 통과하면 인증 성공!
            </p>
            {habits.map((habit, i) => (
              <div
                key={i}
                className="flex items-center gap-3 glass-panel rounded-2xl p-3"
              >
                {/* 습관 태그 */}
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                  style={{
                    background: `${character?.color ?? "#4aacef"}18`,
                    color: character?.color ?? "#4aacef",
                    border: `1px solid ${character?.color ?? "#4aacef"}44`,
                    maxWidth: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {habit}
                </span>

                {/* 사진 슬롯 */}
                {habitImages[i] ? (
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <img
                      src={habitImages[i]!.preview}
                      alt={`${habit} 사진`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() =>
                        setHabitImages((prev) => {
                          const next = [...prev];
                          next[i] = null;
                          return next;
                        })
                      }
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => triggerFileInput(i)}
                    className="w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1 flex-shrink-0 transition-all active:scale-95"
                    style={{
                      border: `2px dashed ${character?.color ?? "#4aacef"}55`,
                      background: `${character?.color ?? "#4aacef"}08`,
                    }}
                  >
                    <span className="text-lg">+</span>
                  </button>
                )}

                {/* 상태 표시 */}
                <span className="text-xs ml-auto" style={{ color: "var(--text-secondary)" }}>
                  {habitImages[i] ? "✓ 업로드됨" : "미업로드"}
                </span>
              </div>
            ))}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        )}

        {/* 에러 */}
        {error && (
          <p className="text-xs text-center" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-5 pb-10 pt-3 z-10 flex flex-col gap-2">
        <GameButton
          fullWidth
          size="lg"
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
          style={{ opacity: canSubmit && !loading ? 1 : 0.4 }}
        >
          {loading ? "판단 중…" : "제출하기"}
        </GameButton>
        <button
          onClick={handleGiveUp}
          disabled={loading}
          className="text-xs text-center py-2"
          style={{ color: "var(--text-secondary)", opacity: 0.6 }}
        >
          오늘은 못 했어요
        </button>
      </div>
    </div>
  );
}
