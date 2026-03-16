"use client";

import { useState } from "react";
import { useAppStore, CHARACTERS, GACHA_COST, CHAR_PRICE, STREAK_FREEZE_PRICE, type GachaReward } from "@/store/useAppStore";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import GameButton from "@/components/ui/GameButton";
import BottomNav from "@/components/ui/BottomNav";
import { Sparkles, Gift, Check, Shield } from "lucide-react";

const BG = "linear-gradient(180deg, #aad8f0 0%, #caeaf8 22%, #dff2fb 55%, #caeaf8 100%)";
const PANEL = {
  background: "rgba(255,255,255,0.90)",
  border: "1px solid rgba(160,210,240,0.55)",
  boxShadow: "0 2px 12px rgba(90,150,200,0.10)",
};

const RARITY = {
  common: { color: "#4aacef", label: "COMMON" },
  rare:   { color: "#a78bfa", label: "RARE"   },
  epic:   { color: "#f0a020", label: "EPIC"   },
};

const POOL_INFO = [
  { label: "호감도 +10",    rarity: "common" as const, prob: "50%" },
  { label: "코인 +50",      rarity: "common" as const, prob: "28%" },
  { label: "스트릭 프리즈", rarity: "rare"   as const, prob: "12%" },
  { label: "호감도 +30",    rarity: "rare"   as const, prob: "7%"  },
  { label: "코인 +200",     rarity: "epic"   as const, prob: "3%"  },
];

export default function ShopScreen() {
  useRouteGuard("setup-complete");

  const character      = useAppStore((s) => s.character);
  const currency       = useAppStore((s) => s.currency);
  const ownedCharacters   = useAppStore((s) => s.ownedCharacters);
  const streakFreezes     = useAppStore((s) => s.streakFreezes);
  const setCharacter      = useAppStore((s) => s.setCharacter);
  const purchaseCharacter = useAppStore((s) => s.purchaseCharacter);
  const purchaseStreakFreeze = useAppStore((s) => s.purchaseStreakFreeze);
  const pullGacha         = useAppStore((s) => s.pullGacha);

  const [tab, setTab]             = useState<"character" | "item" | "gacha">("character");
  const [pulling, setPulling]     = useState(false);
  const [result, setResult]       = useState<GachaReward | null>(null);
  const [resultKey, setResultKey] = useState(0);
  const [errMsg, setErrMsg]       = useState<string | null>(null);

  const isOwned = (id: string) =>
    ownedCharacters.includes(id) || character?.id === id;

  const handlePurchase = (charId: string) => {
    const ok = purchaseCharacter(charId);
    if (!ok) { setErrMsg("코인이 부족해요!"); setTimeout(() => setErrMsg(null), 2000); }
  };

  const handlePull = () => {
    if (currency < GACHA_COST || pulling) return;
    setPulling(true);
    setResult(null);
    setTimeout(() => {
      const r = pullGacha();
      setResult(r);
      setResultKey((k) => k + 1);
      setPulling(false);
    }, 500);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: BG }}>

      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 z-10">
        <h1 className="text-xl font-black" style={{ color: "#1a3a5c" }}>상점</h1>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(240,192,64,0.4)" }}
        >
          <Sparkles size={13} color="#c8a000" />
          <span className="text-sm font-black" style={{ color: "#9a7800" }}>{currency}</span>
          <span className="text-xs" style={{ color: "#b09000" }}>코인</span>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 px-5 mb-4 z-10">
        {(["character", "item", "gacha"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
            style={
              tab === t
                ? { background: "#4aacef", color: "#fff", boxShadow: "0 2px 10px rgba(74,172,239,0.35)" }
                : { background: "rgba(255,255,255,0.70)", color: "#7a9bb5", border: "1px solid rgba(160,210,240,0.5)" }
            }
          >
            {t === "character" ? "캐릭터" : t === "item" ? "아이템" : "뽑기"}
          </button>
        ))}
      </div>

      {/* ── 캐릭터 탭 ── */}
      {tab === "character" && (
        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-24 flex flex-col gap-3 z-10">
          {CHARACTERS.map((c) => {
            const owned   = isOwned(c.id);
            const current = character?.id === c.id;
            return (
              <div key={c.id} className="rounded-2xl overflow-hidden" style={PANEL}>
                <div className="flex items-center gap-3 p-4">
                  {/* 컬러 도트 */}
                  <div
                    className="w-10 h-10 rounded-xl shrink-0"
                    style={{ background: `linear-gradient(145deg, ${c.color}55, ${c.color}22)`, border: `1.5px solid ${c.color}55` }}
                  />

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-[15px]" style={{ color: c.color }}>{c.name}</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${c.color}18`, color: c.color }}
                      >
                        {c.personality}
                      </span>
                    </div>
                    <p className="text-[11px] mb-3 truncate" style={{ color: "#7a9bb5" }}>{c.title}</p>

                    {current ? (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full"
                        style={{ background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}40` }}
                      >
                        <Check size={11} strokeWidth={3} /> 사용 중
                      </span>
                    ) : owned ? (
                      <button
                        onClick={() => setCharacter(c)}
                        className="text-[11px] font-black px-3 py-1.5 rounded-full transition-all active:scale-95"
                        style={{ background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}44` }}
                      >
                        전환하기
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(c.id)}
                        disabled={currency < CHAR_PRICE}
                        className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full transition-all active:scale-95"
                        style={
                          currency >= CHAR_PRICE
                            ? { background: "linear-gradient(135deg, #f0c040, #e0a820)", color: "#fff", boxShadow: "0 2px 8px rgba(240,192,64,0.40)" }
                            : { background: "rgba(0,0,0,0.06)", color: "#aabdd0" }
                        }
                      >
                        <Sparkles size={11} /> {CHAR_PRICE} 코인
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {errMsg && (
            <p className="text-center text-sm font-bold animate-fade-in" style={{ color: "#f87171" }}>
              {errMsg}
            </p>
          )}
        </div>
      )}

      {/* ── 아이템 탭 ── */}
      {tab === "item" && (
        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-24 flex flex-col gap-3 z-10">
          {/* 스트릭 프리즈 */}
          <div className="rounded-2xl overflow-hidden" style={PANEL}>
            <div className="flex items-center gap-4 p-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(145deg, rgba(74,172,239,0.25), rgba(74,172,239,0.10))", border: "1.5px solid rgba(74,172,239,0.40)" }}
              >
                <Shield size={22} color="#4aacef" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-black text-[15px]" style={{ color: "#1a3a5c" }}>스트릭 프리즈</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(74,172,239,0.12)", color: "#4aacef" }}>
                    보유 {streakFreezes}개
                  </span>
                </div>
                <p className="text-[11px] mb-3" style={{ color: "#7a9bb5" }}>
                  인증 실패 시 스트릭을 1회 보호해줘요
                </p>
                <button
                  onClick={() => {
                    const ok = purchaseStreakFreeze();
                    if (!ok) { setErrMsg("코인이 부족해요!"); setTimeout(() => setErrMsg(null), 2000); }
                  }}
                  disabled={currency < STREAK_FREEZE_PRICE}
                  className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full transition-all active:scale-95"
                  style={
                    currency >= STREAK_FREEZE_PRICE
                      ? { background: "linear-gradient(135deg, #f0c040, #e0a820)", color: "#fff", boxShadow: "0 2px 8px rgba(240,192,64,0.40)" }
                      : { background: "rgba(0,0,0,0.06)", color: "#aabdd0" }
                  }
                >
                  <Sparkles size={11} /> {STREAK_FREEZE_PRICE} 코인
                </button>
              </div>
            </div>
          </div>

          {errMsg && (
            <p className="text-center text-sm font-bold animate-fade-in" style={{ color: "#f87171" }}>
              {errMsg}
            </p>
          )}
        </div>
      )}

      {/* ── 뽑기 탭 ── */}
      {tab === "gacha" && (
        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-24 flex flex-col gap-4 z-10">

          {/* 뽑기 카드 */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-4"
            style={{
              background: "linear-gradient(160deg, rgba(167,139,250,0.15) 0%, rgba(74,172,239,0.10) 100%)",
              border: "1px solid rgba(167,139,250,0.30)",
              boxShadow: "0 4px 20px rgba(167,139,250,0.12)",
            }}
          >
            <div
              className="w-[64px] h-[64px] rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, rgba(167,139,250,0.25), rgba(107,190,245,0.15))",
                border: "1.5px solid rgba(167,139,250,0.45)",
              }}
            >
              <Gift size={28} color="#a78bfa" strokeWidth={1.8} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black" style={{ color: "#1a3a5c" }}>랜덤 뽑기</h3>
              <p className="text-xs mt-0.5" style={{ color: "#7a9bb5" }}>호감도, 코인 등 랜덤 보상</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} color="#c8a000" />
              <span className="text-sm font-black" style={{ color: "#9a7800" }}>1회 · {GACHA_COST}코인</span>
            </div>
            <GameButton
              fullWidth
              disabled={currency < GACHA_COST || pulling}
              onClick={handlePull}
              style={{ opacity: currency >= GACHA_COST ? 1 : 0.45 }}
            >
              {pulling ? "뽑는 중…" : "뽑기!"}
            </GameButton>
            {currency < GACHA_COST && (
              <p className="text-xs" style={{ color: "#f87171" }}>
                코인이 부족해요 (보유 {currency} / 필요 {GACHA_COST})
              </p>
            )}
          </div>

          {/* 결과 */}
          {result && (
            <div
              key={resultKey}
              className="rounded-2xl p-5 flex flex-col items-center gap-3 animate-slide-up"
              style={{
                background: `${RARITY[result.rarity].color}12`,
                border: `1.5px solid ${RARITY[result.rarity].color}50`,
                boxShadow: `0 4px 20px ${RARITY[result.rarity].color}20`,
              }}
            >
              <span
                className="text-[10px] font-black tracking-widest px-3 py-1 rounded-full"
                style={{
                  background: `${RARITY[result.rarity].color}18`,
                  color: RARITY[result.rarity].color,
                  border: `1px solid ${RARITY[result.rarity].color}50`,
                }}
              >
                {RARITY[result.rarity].label}
              </span>
              <p className="text-xl font-black" style={{ color: "#1a3a5c" }}>{result.label}</p>
            </div>
          )}

          {/* 확률 표 */}
          <div className="rounded-2xl overflow-hidden" style={PANEL}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(160,210,240,0.4)" }}>
              <p className="text-[11px] font-black tracking-widest uppercase" style={{ color: "#7a9bb5" }}>확률 정보</p>
            </div>
            {POOL_INFO.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid rgba(160,210,240,0.25)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-black px-2 py-0.5 rounded-full"
                    style={{
                      background: `${RARITY[item.rarity].color}14`,
                      color: RARITY[item.rarity].color,
                      border: `1px solid ${RARITY[item.rarity].color}40`,
                    }}
                  >
                    {RARITY[item.rarity].label}
                  </span>
                  <span className="text-sm" style={{ color: "#1a3a5c" }}>{item.label}</span>
                </div>
                <span className="text-sm font-black" style={{ color: RARITY[item.rarity].color }}>
                  {item.prob}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
