"use client";

import { type CharacterData } from "@/components/AppContext";

interface CharacterDisplayProps {
  character: CharacterData;
  size?: "sm" | "md" | "lg";
  mood?: "neutral" | "happy" | "shy" | "sad";
}

const sizeMap = {
  sm: { wrapper: "w-24 h-32",  face: "w-14 h-14", body: "w-20 h-16" },
  md: { wrapper: "w-36 h-48",  face: "w-20 h-20", body: "w-28 h-20" },
  lg: { wrapper: "w-52 h-[280px]", face: "w-28 h-28", body: "w-40 h-28" },
};

/* CSS art 캐릭터 — 이미지 없이 순수 CSS로 */
export default function CharacterDisplay({
  character,
  size = "md",
  mood = "neutral",
}: CharacterDisplayProps) {
  const s = sizeMap[size];
  const c = character.color;
  const a = character.accentColor;

  const eyeExpression =
    mood === "happy"   ? "😊" :
    mood === "shy"     ? "☺️" :
    mood === "sad"     ? "😢" :
    character.type === "tsundere"    ? "😒" :
    character.type === "genki"       ? "✨" :
    "🌙";

  return (
    <div className={`relative flex flex-col items-center ${s.wrapper} select-none`}>
      {/* 글로우 배경 */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: c }}
      />

      {/* 머리카락 (뒤) */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className="rounded-t-full rounded-b-lg"
          style={{
            background: `linear-gradient(180deg, ${a} 0%, ${c} 100%)`,
            boxShadow: `0 0 16px ${c}66`,
            ...(size === "lg"
              ? { width: "112px", height: "40px" }
              : size === "md"
              ? { width: "80px", height: "28px" }
              : { width: "56px", height: "20px" }),
          }}
        />

        {/* 얼굴 */}
        <div
          className={`relative ${s.face} rounded-full flex flex-col items-center justify-center -mt-3 z-10`}
          style={{
            background: "linear-gradient(160deg, #ffe4d6 0%, #ffd0bc 100%)",
            border: `2px solid ${c}44`,
            boxShadow: `0 4px 20px ${c}33`,
          }}
        >
          {/* 눈 */}
          <div className="flex gap-2 items-center mb-1">
            <div
              className="rounded-full"
              style={{
                width: size === "lg" ? "14px" : size === "md" ? "10px" : "7px",
                height: size === "lg" ? "16px" : size === "md" ? "12px" : "8px",
                background: a,
                boxShadow: `0 0 6px ${c}`,
              }}
            />
            <div
              className="rounded-full"
              style={{
                width: size === "lg" ? "14px" : size === "md" ? "10px" : "7px",
                height: size === "lg" ? "16px" : size === "md" ? "12px" : "8px",
                background: a,
                boxShadow: `0 0 6px ${c}`,
              }}
            />
          </div>

          {/* 입 */}
          <div
            className="rounded-full"
            style={{
              width:  size === "lg" ? "14px" : "9px",
              height: size === "lg" ? "5px"  : "3px",
              background: mood === "happy" || mood === "shy" ? "#f472b6" : "#d97706",
              marginTop: "2px",
              borderRadius: mood === "happy" ? "0 0 9999px 9999px" : "9999px",
            }}
          />

          {/* 볼 홍조 */}
          {(mood === "happy" || mood === "shy") && (
            <>
              <div
                className="absolute rounded-full opacity-40"
                style={{
                  width: size === "lg" ? "18px" : "12px",
                  height: size === "lg" ? "10px" : "7px",
                  background: "#f9a8d4",
                  bottom: size === "lg" ? "18px" : "12px",
                  left: size === "lg" ? "8px" : "6px",
                }}
              />
              <div
                className="absolute rounded-full opacity-40"
                style={{
                  width: size === "lg" ? "18px" : "12px",
                  height: size === "lg" ? "10px" : "7px",
                  background: "#f9a8d4",
                  bottom: size === "lg" ? "18px" : "12px",
                  right: size === "lg" ? "8px" : "6px",
                }}
              />
            </>
          )}

          {/* 표정 이모지 오버레이 */}
          <div className="absolute -top-2 -right-2 text-base">{eyeExpression}</div>
        </div>

        {/* 머리카락 (앞 앞머리) */}
        <div
          className="absolute top-4 flex gap-1 z-20"
          style={{ marginTop: size === "lg" ? "26px" : "16px" }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-b-full"
              style={{
                width:  size === "lg" ? "14px" : size === "md" ? "10px" : "7px",
                height: size === "lg" ? "20px" : size === "md" ? "14px" : "10px",
                background: `linear-gradient(180deg, ${a} 0%, ${c} 100%)`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      </div>

      {/* 몸통 */}
      <div
        className={`-mt-2 ${s.body} rounded-t-3xl flex items-end justify-center relative z-0`}
        style={{
          background: `linear-gradient(180deg, ${c}88 0%, ${a}55 100%)`,
          border: `1px solid ${c}44`,
        }}
      >
        {/* 리본/장식 */}
        <div
          className="absolute top-2 w-6 h-3 rounded-full opacity-70"
          style={{ background: c }}
        />
      </div>

      {/* 이름 */}
      <div
        className="mt-2 text-xs font-bold tracking-widest"
        style={{ color: c }}
      >
        {character.name}
      </div>
    </div>
  );
}
