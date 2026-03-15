"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/components/AppContext";
import BottomNav from "@/components/ui/BottomNav";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import GameButton from "@/components/ui/GameButton";

interface Message {
  id: number;
  from: "user" | "character";
  text: string;
}

// 캐릭터 타입별 응답 목록
const RESPONSES: Record<string, string[]> = {
  tsundere: [
    "…뭐야, 그게. 그래, 나쁘지 않았어.",
    "별로 기대 안 했는데 생각보다 잘하네.",
    "칭찬하는 거 아니야. 그냥 사실을 말하는 거라고.",
    "흥. 그 정도면 합격이야.",
    "…고마워. 그, 딱 그 정도로만 알아둬.",
  ],
  genki: [
    "대박이야!! 진짜 대단해!",
    "역시 믿었어! 같이 하니까 재밌다~",
    "오늘도 최고였어! 내일도 기대할게!",
    "우리 66일 꼭 같이 완주하자고!",
    "너랑 있으면 진짜 힘이 나~",
  ],
  intellectual: [
    "흥미로운 관점이네요. 계속해요.",
    "습관은 반복으로 굳어지죠. 잘하고 있어요.",
    "통계적으로 봤을 때 당신의 진행률은 상위 20%예요.",
    "꾸준함이야말로 가장 희귀한 재능이에요.",
    "오늘의 데이터가 내일의 자신을 만들어요.",
  ],
};

const CHOICES: Record<string, string[]> = {
  tsundere: [
    "오늘 힘들었어...",
    "잘 지내고 있어?",
    "내일도 같이 해줄거야?",
    "응원해줘서 고마워.",
  ],
  genki: [
    "오늘 정말 열심히 했어!",
    "같이 있으니 좋다~",
    "힘들 때도 있는데 괜찮아?",
    "66일 같이 완주하자!",
  ],
  intellectual: [
    "오늘 습관 실천 완료!",
    "더 효율적인 방법이 있을까?",
    "동기가 떨어질 때 어떻게 해?",
    "함께여서 든든해.",
  ],
};

export default function ChatScreen() {
  const { state, dispatch } = useApp();
  const { character } = state;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const type = character?.type ?? "genki";
  const choices = CHOICES[type];
  const responses = RESPONSES[type];

  useEffect(() => {
    if (messages.length === 0 && character) {
      setMessages([
        { id: 0, from: "character", text: character.greeting },
      ]);
    }
  }, [character, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (isTyping) return;
    const userMsg: Message = { id: Date.now(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "character", text: reply },
      ]);
      setIsTyping(false);
      dispatch({ type: "ADD_AFFECTION", amount: 2 });
    }, 900 + Math.random() * 600);
  };

  if (!character) return null;

  return (
    <div className="relative w-full h-full game-gradient-bg flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <button
          className="text-[var(--text-secondary)]"
          onClick={() => dispatch({ type: "SET_SCREEN", screen: "home" })}
        >
          ←
        </button>
        <CharacterDisplay character={character} size="sm" />
        <div className="ml-1">
          <div
            className="font-bold text-sm"
            style={{ color: character.color }}
          >
            {character.name}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)]">
            {character.title}
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={
                msg.from === "user"
                  ? {
                      background: `linear-gradient(135deg, ${character.accentColor} 0%, ${character.color} 100%)`,
                      color: "#fff",
                      borderBottomRightRadius: "4px",
                    }
                  : {
                      background: "rgba(255,255,255,0.08)",
                      color: "var(--text-primary)",
                      borderBottomLeftRadius: "4px",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderBottomLeftRadius: "4px",
              }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: character.color,
                      animation: `sparkle-twinkle 1s ease-in-out ${i * 0.25}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 선택지 버튼 */}
      <div
        className="px-4 pb-20 pt-3 border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex flex-col gap-2">
          {choices.map((c, i) => (
            <GameButton
              key={i}
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => sendMessage(c)}
              disabled={isTyping}
              style={{ opacity: isTyping ? 0.5 : 1, textAlign: "left", justifyContent: "flex-start", paddingLeft: "16px" }}
            >
              {c}
            </GameButton>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
