"use client";

import { useRef, useState } from "react";
import { useApp } from "@/components/AppContext";
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

export default function VerificationScreen() {
  const { state, dispatch } = useApp();
  const { habits, character, dayCount } = state;

  const [tab, setTab] = useState<InputTab>("text");
  const [textContent, setTextContent] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMediaType, setImageMediaType] = useState<string>("image/jpeg");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const characterType = character?.type ?? "genki";
  const prompt = INITIAL_PROMPTS[characterType] ?? INITIAL_PROMPTS.genki;
  const canSubmit = tab === "text" ? textContent.trim().length > 0 : imageBase64 !== null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMediaType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      // strip data:...;base64, prefix
      const base64 = result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);

    try {
      const input =
        tab === "text"
          ? { type: "text" as const, content: textContent }
          : { type: "image" as const, base64: imageBase64!, mediaType: imageMediaType };

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

      if (!res.ok) {
        throw new Error("API error");
      }

      const { verified, message } = (await res.json()) as { verified: boolean; message: string };
      dispatch({ type: verified ? "VERIFY_SUCCESS" : "VERIFY_FAIL", message });
      dispatch({ type: "SET_SCREEN", screen: "verificationResult" });
    } catch {
      setError("인증 요청에 실패했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleGiveUp = () => {
    const message = GIVE_UP_MESSAGES[characterType] ?? GIVE_UP_MESSAGES.genki;
    dispatch({ type: "VERIFY_FAIL", message });
    dispatch({ type: "SET_SCREEN", screen: "verificationResult" });
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

        {/* 습관 목록 */}
        <div className="flex flex-wrap gap-2">
          {habits.map((habit, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: `${character?.color ?? "#4aacef"}18`,
                color: character?.color ?? "#4aacef",
                border: `1px solid ${character?.color ?? "#4aacef"}44`,
              }}
            >
              {habit}
            </span>
          ))}
        </div>

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
          <div className="flex flex-col gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full glass-panel rounded-2xl p-6 flex flex-col items-center gap-2 transition-all active:scale-[0.98]"
              style={{ border: `2px dashed ${character?.color ?? "#4aacef"}55` }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full max-h-48 object-contain rounded-xl"
                />
              ) : (
                <>
                  <span className="text-3xl">📷</span>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    사진을 선택하세요
                  </p>
                </>
              )}
            </button>
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
