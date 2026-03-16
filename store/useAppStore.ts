import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ── 타입 정의 ──────────────────────────────────────── */
export interface CharacterData {
  id: string;
  name: string;
  title: string;
  color: string;
  accentColor: string;
  personality: string;
  greeting: string;
  type: "tsundere" | "genki" | "intellectual";
}

export interface AppState {
  habits: string[];
  character: CharacterData | null;
  dayCount: number;
  affection: number;
  streak: number;
  todayVerified: boolean;
  todayHabitChecks: boolean[];
  completedDays: number[];
  currency: number;
  unlockedStories: number[];
  verificationSuccess: boolean | null;
  verificationCharacterMessage: string | null;
  habitVerificationResults: { habit: string; verified: boolean }[] | null;
  endingType: "best" | "normal" | "bad" | null;
}

export interface AppActions {
  setHabits: (habits: string[]) => void;
  setCharacter: (character: CharacterData) => void;
  toggleHabitCheck: (index: number) => void;
  verifySuccess: (message?: string, habitResults?: { habit: string; verified: boolean }[]) => void;
  verifyFail: (message?: string, habitResults?: { habit: string; verified: boolean }[]) => void;
  nextDay: () => string; // returns URL to navigate to ("/home" or "/ending")
  addAffection: (amount: number) => void;
  unlockStory: (storyId: number) => void;
  setEnding: (endingType: "best" | "normal" | "bad") => void;
  reset: () => void;
  debugPatch: (patch: Partial<AppState>) => void;
}

/* ── 캐릭터 데이터 ──────────────────────────────────── */
export const CHARACTERS: CharacterData[] = [
  {
    id: "aria",
    name: "아리아",
    title: "고독한 별의 기사",
    color: "#a78bfa",
    accentColor: "#7c3aed",
    personality: "츤데레",
    type: "tsundere",
    greeting: "…뭘 봐? 습관이 그렇게 중요하다고 생각하지 않지만… 뭐, 도와줄 순 있어.",
  },
  {
    id: "lina",
    name: "리나",
    title: "태양의 소녀",
    color: "#f472b6",
    accentColor: "#db2777",
    personality: "활발",
    type: "genki",
    greeting: "안녕! 나랑 같이 66일 완주해보자! 절대 포기하면 안 돼, 알겠지?",
  },
  {
    id: "sera",
    name: "세라",
    title: "달빛 사서",
    color: "#60a5fa",
    accentColor: "#2563eb",
    personality: "지적",
    type: "intellectual",
    greeting: "습관 형성에는 평균 66일이 필요하다는 연구 결과가 있어. 함께 검증해볼까?",
  },
];

/* ── 초기 상태 ──────────────────────────────────────── */
const initialState: AppState = {
  habits: [],
  character: null,
  dayCount: 1,
  affection: 0,
  streak: 0,
  todayVerified: false,
  todayHabitChecks: [],
  completedDays: [],
  currency: 0,
  unlockedStories: [],
  verificationSuccess: null,
  verificationCharacterMessage: null,
  habitVerificationResults: null,
  endingType: null,
};

/* ── Zustand Store ──────────────────────────────────── */
export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setHabits: (habits) =>
        set({ habits, todayHabitChecks: new Array(habits.length).fill(false) }),

      setCharacter: (character) => set({ character }),

      toggleHabitCheck: (index) => {
        const checks = [...get().todayHabitChecks];
        checks[index] = !checks[index];
        set({ todayHabitChecks: checks });
      },

      verifySuccess: (message, habitResults) => {
        const state = get();
        const newAffection = Math.min(660, state.affection + 10);
        const newDays = state.completedDays.includes(state.dayCount)
          ? state.completedDays
          : [...state.completedDays, state.dayCount];
        const storyId = Math.floor(state.dayCount / 10);
        const newStories =
          storyId > 0 && !state.unlockedStories.includes(storyId)
            ? [...state.unlockedStories, storyId]
            : state.unlockedStories;
        set({
          todayVerified: true,
          verificationSuccess: true,
          verificationCharacterMessage: message ?? null,
          habitVerificationResults: habitResults ?? null,
          affection: newAffection,
          streak: state.streak + 1,
          currency: state.currency + 10,
          completedDays: newDays,
          unlockedStories: newStories,
        });
      },

      verifyFail: (message, habitResults) => {
        const state = get();
        set({
          todayVerified: false,
          verificationSuccess: false,
          verificationCharacterMessage: message ?? null,
          habitVerificationResults: habitResults ?? null,
          streak: 0,
          affection: Math.max(0, state.affection - 5),
        });
      },

      nextDay: () => {
        const state = get();
        const nextDayCount = state.dayCount + 1;
        if (nextDayCount > 66) {
          const endingType =
            state.affection >= 500 ? "best" : state.affection >= 300 ? "normal" : "bad";
          set({ dayCount: 66, endingType });
          return "/ending";
        }
        set({
          dayCount: nextDayCount,
          todayVerified: false,
          todayHabitChecks: new Array(state.habits.length).fill(false),
          verificationSuccess: null,
          verificationCharacterMessage: null,
          habitVerificationResults: null,
        });
        return "/home";
      },

      addAffection: (amount) =>
        set({ affection: Math.min(660, get().affection + amount) }),

      unlockStory: (storyId) => {
        const state = get();
        if (state.unlockedStories.includes(storyId)) return;
        set({ unlockedStories: [...state.unlockedStories, storyId] });
      },

      setEnding: (endingType) => set({ endingType }),

      reset: () => set(initialState),

      debugPatch: (patch) => set(patch as Partial<AppState & AppActions>),
    }),
    { name: "66r-app-state" }
  )
);
