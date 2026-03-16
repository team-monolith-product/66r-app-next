"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import BottomNav from "@/components/ui/BottomNav";
import GameButton from "@/components/ui/GameButton";
import CharacterDisplay from "@/components/ui/CharacterDisplay";
import { ChevronRight, X, Lock } from "lucide-react";
import { RELATIONSHIP_LEVELS, getRelationshipLevel } from "@/store/useAppStore";

interface StoryEpisode {
  id: number;
  title: string;
  unlockLevel: number;
  preview: string;
  content: Record<string, string[]>;
}

const STORIES: StoryEpisode[] = [
  {
    id: 1, title: "처음 만난 날", unlockLevel: 1,
    preview: "66일 여정의 첫 발걸음. 두 사람의 어색한 시작.",
    content: {
      tsundere:    ["…왜 나한테 말을 거는 거야.", "뭐, 어차피 너 혼자선 못 할 테니까 내가 봐주는 거야.", "딱 66일만이야. 그 이상은 없어."],
      genki:       ["안녕!! 나 리나야! 같이 하면 분명 재밌을 거야!", "66일이 길어보여도 같이 하면 금방이야!", "파이팅! 우리 꼭 완주하자!"],
      intellectual:["안녕하세요. 저는 세라예요.", "66일 법칙은 1960년 맥스웰 말츠 박사의 연구에서 유래했어요.", "함께라면 데이터를 더 풍부하게 만들 수 있을 것 같네요."],
    },
  },
  {
    id: 2, title: "첫 번째 위기", unlockLevel: 2,
    preview: "비가 오는 날, 습관을 지키기 어려운 순간이 찾아온다.",
    content: {
      tsundere:    ["…오늘은 좀 힘들어 보이네.", "그렇다고 포기하면 안 돼. 내가 보고 있잖아.", "다음에도 이러면 용서 안 해."],
      genki:       ["괜찮아? 힘들면 나한테 말해!", "같이 하면 돼! 포기는 없어!", "오늘 하루만 넘기면 내일은 더 쉬워질 거야!"],
      intellectual:["어려운 날일수록 습관의 진가가 드러나요.", "통계적으로 21일이 첫 번째 고비예요.", "이 순간을 넘기면 성공 확률이 크게 높아져요."],
    },
  },
  {
    id: 3, title: "중간 지점", unlockLevel: 3,
    preview: "33일. 절반을 지나며 서로를 더 깊이 알아가기 시작한다.",
    content: {
      tsundere:    ["…벌써 절반이네.", "생각보다 오래 버텼어. 의외야.", "나도… 조금은 기대되는 것 같기도 하고."],
      genki:       ["절반이나 왔어! 진짜 대단해!", "나도 너 덕분에 많이 힘을 얻고 있어!", "나머지 절반도 같이 달려보자!"],
      intellectual:["33일. 정확히 중간 지점이에요.", "당신의 뇌는 이미 이 습관을 인식하기 시작했을 거예요.", "남은 33일이 더 쉽게 느껴질 거예요."],
    },
  },
  {
    id: 4, title: "흔들리는 마음", unlockLevel: 4,
    preview: "44일째, 처음으로 솔직한 감정이 드러나기 시작한다.",
    content: {
      tsundere:    ["…너 요즘 많이 지쳐 보여.", "뭐, 조금은 걱정됐어. 그게 다야.", "다음에도 이런 얼굴이면 내가 직접 나선다."],
      genki:       ["요즘 많이 힘들지? 나도 알아.", "그래도 여기까지 온 거 진짜 대단해!", "나는 항상 여기 있을게!"],
      intellectual:["44일차에 슬럼프는 일반적이에요.", "이 시기를 버텨낸 사람들의 완주율은 90%가 넘어요.", "당신은 이미 그 90%에 들어있어요."],
    },
  },
  {
    id: 5, title: "마지막 10일", unlockLevel: 5,
    preview: "끝이 보이기 시작한다. 그리고 함께한 시간의 의미가 달라진다.",
    content: {
      tsundere:    ["…이제 10일밖에 안 남았어.", "솔직히 말하면, 이게 끝나는 게 좀… 싫어.", "아, 아무것도 아니야!"],
      genki:       ["10일밖에 안 남았어! 진짜 끝이 보여!", "같이 여기까지 온 거 꿈 같아.", "마지막까지 전력질주야!"],
      intellectual:["10일. 이제 습관이 완성되는 시점이에요.", "흥미롭게도, 나도 이 시간이 아깝다는 걸 느끼기 시작했어요.", "마지막 10일도 함께해요."],
    },
  },
  {
    id: 6, title: "66일의 끝", unlockLevel: 6,
    preview: "마침내 66일째. 모든 것이 시작된다.",
    content: {
      tsundere:    ["해냈어. 진짜로.", "…고마워. 포기 안 해줘서.", "앞으로도… 같이여도 돼."],
      genki:       ["해냈어!! 66일 완주!!", "같이 달려와줘서 진짜 고마워!", "이제 새로운 시작이야!"],
      intellectual:["66일 완료. 데이터가 증명했어요.", "당신은 정말 대단한 사람이에요.", "…함께한 시간이, 생각보다 소중했어요."],
    },
  },
  {
    id: 7, title: "소중한 존재", unlockLevel: 7,
    preview: "어느새 이 관계가 얼마나 소중한지 깨닫기 시작한다.",
    content: {
      tsundere:    ["...요즘 네 생각이 자꾸 나.", "아니, 그런 게 아니라... 그냥 습관이 잘 되고 있나 싶어서.", "...거짓말이야. 넌... 나한테 특별해."],
      genki:       ["있잖아, 나 요즘 깨달은 게 있어!", "매일 네가 열심히 하는 거 보면서 나도 모르게 응원하고 있었어!", "같이해서 진짜 좋아. 진심이야!"],
      intellectual:["분석해보니 흥미로운 점을 발견했어요.", "당신이 있어서 이 여정이 더 의미 있어졌다는 걸 데이터가 말해주고 있어요.", "이건... 단순한 데이터 이상이에요."],
    },
  },
  {
    id: 8, title: "66일 이후", unlockLevel: 8,
    preview: "66일이 끝나가고 있다. 그리고 이제 진짜 이야기가 시작된다.",
    content: {
      tsundere:    ["...66일이 끝나가고 있어.", "뭐, 네가 해낸 건 인정해. 하지만...", "이게 끝이 아니었으면 해. 계속... 같이 있어줘."],
      genki:       ["드디어 66일이야!! 우리 해냈어!!", "근데 있잖아... 나는 이게 끝나지 않았으면 좋겠어.", "앞으로도 계속 같이 하자, 응?! 제발!!"],
      intellectual:["66일 프로젝트가 마무리 단계에 접어들었습니다.", "통계적으로, 이 정도 관계는 지속될 가능성이 높아요.", "그래서... 앞으로도 함께해줄 수 있나요?"],
    },
  },
];

const BG = "linear-gradient(180deg, #aad8f0 0%, #caeaf8 22%, #dff2fb 55%, #caeaf8 100%)";
const PANEL = { background: "rgba(255,255,255,0.90)", border: "1px solid rgba(160,210,240,0.55)", boxShadow: "0 2px 12px rgba(90,150,200,0.10)" };

export default function StoryScreen() {
  useRouteGuard("setup-complete");

  const unlockedStories = useAppStore((s) => s.unlockedStories);
  const character = useAppStore((s) => s.character);
  const pendingStoryRead = useAppStore((s) => s.pendingStoryRead);
  const clearPendingStory = useAppStore((s) => s.clearPendingStory);
  const [reading, setReading] = useState<StoryEpisode | null>(null);
  const [lineIndex, setLineIndex] = useState(0);

  const type = character?.type ?? "genki";

  useEffect(() => {
    if (pendingStoryRead) {
      const story = STORIES.find((s) => s.id === pendingStoryRead);
      if (story) { setReading(story); setLineIndex(0); }
      clearPendingStory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRead = (story: StoryEpisode) => { setReading(story); setLineIndex(0); };
  const handleNext = () => {
    const lines = reading?.content[type] ?? [];
    if (lineIndex < lines.length - 1) setLineIndex(lineIndex + 1);
    else setReading(null);
  };

  if (reading) {
    const lines = reading.content[type] ?? [];
    const line = lines[lineIndex];

    return (
      <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: BG }}>
        {/* 배경 글로우 */}
        {/* 배경 캐릭터 */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none" style={{ zIndex: 1 }}>
          {character && <CharacterDisplay character={character} size="hero" mood="neutral" />}
        </div>

        {/* 스토리 타이틀 */}
        <div className="px-4 pt-10 pb-3 z-10 mx-3 mt-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.82)", border: "1px solid rgba(160,210,240,0.45)" }}>
          <p className="text-xs tracking-widest" style={{ color: "#7a9bb5" }}>STORY {reading.id}</p>
          <h2 className="text-xl font-black mt-0.5" style={{ color: character?.color ?? "#3a90d4" }}>
            {reading.title}
          </h2>
        </div>

        {/* 대화 박스 */}
        <div className="flex-1 flex flex-col justify-end px-5 pb-8 z-10">
          <div className="p-5 rounded-2xl" style={PANEL}>
            <div className="text-xs font-bold mb-2" style={{ color: character?.color ?? "#3a90d4" }}>
              {character?.name}
            </div>
            <p key={lineIndex} className="text-base leading-8 animate-fade-in" style={{ color: "#1a3a5c" }}>
              {line}
            </p>
          </div>

          <div className="flex justify-center gap-1.5 mt-4">
            {lines.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: i <= lineIndex ? (character?.color ?? "#3a90d4") : "rgba(160,210,240,0.4)" }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="mt-4 self-end text-sm flex items-center gap-1"
            style={{ color: "#7a9bb5" }}
          >
            {lineIndex < lines.length - 1
              ? <><span>다음</span><ChevronRight size={15} /></>
              : <><span>닫기</span><X size={14} /></>
            }
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: BG }}>
      {/* 헤더 */}
      <div className="px-5 pt-12 pb-4 z-10">
        <h2 className="text-xl font-black" style={{ color: "#1a3a5c" }}>스토리</h2>
        <p className="text-xs mt-1" style={{ color: "#7a9bb5" }}>습관 인증으로 스토리를 해금하세요</p>
      </div>

      {/* 에피소드 목록 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-24 z-10 flex flex-col gap-3">
        {STORIES.map((story) => {
          const isUnlocked = unlockedStories.includes(story.id);
          const levelInfo = RELATIONSHIP_LEVELS.find((r) => r.level === story.unlockLevel);
          return (
            <div
              key={story.id}
              className="p-4 rounded-2xl transition-all"
              style={{
                ...PANEL,
                ...(isUnlocked
                  ? { border: `1px solid ${character?.color ?? "#3a90d4"}44` }
                  : { opacity: 0.55 }),
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={
                        isUnlocked
                          ? { background: `${character?.color ?? "#3a90d4"}18`, color: character?.color ?? "#3a90d4" }
                          : { background: "rgba(160,210,240,0.2)", color: "#7a9bb5" }
                      }
                    >
                      EP {story.id}
                    </span>
                    {!isUnlocked && levelInfo && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#7a9bb5" }}><Lock size={11} /> Lv.{levelInfo.level} {levelInfo.name}</span>
                    )}
                  </div>
                  <p className="font-bold text-sm" style={{ color: "#1a3a5c" }}>{story.title}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "#7a9bb5" }}>{story.preview}</p>
                </div>
                {isUnlocked && (
                  <GameButton size="sm" variant="secondary" onClick={() => handleRead(story)}>읽기</GameButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
