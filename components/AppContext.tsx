"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";

/* ── 타입 정의 ──────────────────────────────────────── */
export type ScreenName =
  | "splash"
  | "onboarding"
  | "habitSetup"
  | "characterSelect"
  | "home"
  | "verification"
  | "verificationResult"
  | "chat"
  | "story"
  | "dashboard"
  | "ending";

export interface CharacterData {
  id: string;
  name: string;
  title: string;
  color: string;       // CSS 변수명 또는 hex
  accentColor: string;
  personality: string;
  greeting: string;
  type: "tsundere" | "genki" | "intellectual";
}

export interface AppState {
  screen: ScreenName;
  habits: string[];
  character: CharacterData | null;
  dayCount: number;          // 1~66
  affection: number;         // 0~660
  streak: number;
  todayVerified: boolean;
  todayHabitChecks: boolean[];  // habits와 1:1 대응, 오늘 각 습관 인증 여부
  completedDays: number[];
  currency: number;
  unlockedStories: number[];
  verificationSuccess: boolean | null;
  verificationCharacterMessage: string | null;
  endingType: "best" | "normal" | "bad" | null;
}

export type AppAction =
  | { type: "SET_SCREEN"; screen: ScreenName }
  | { type: "SET_HABITS"; habits: string[] }
  | { type: "SET_CHARACTER"; character: CharacterData }
  | { type: "TOGGLE_HABIT_CHECK"; index: number }
  | { type: "VERIFY_SUCCESS"; message?: string }
  | { type: "VERIFY_FAIL"; message?: string }
  | { type: "NEXT_DAY" }
  | { type: "ADD_AFFECTION"; amount: number }
  | { type: "UNLOCK_STORY"; storyId: number }
  | { type: "SET_ENDING"; endingType: "best" | "normal" | "bad" }
  | { type: "RESET" }
  | { type: "DEBUG_PATCH"; patch: Partial<AppState> };

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
    greeting:
      "…뭘 봐? 습관이 그렇게 중요하다고 생각하지 않지만… 뭐, 도와줄 순 있어.",
  },
  {
    id: "lina",
    name: "리나",
    title: "태양의 소녀",
    color: "#f472b6",
    accentColor: "#db2777",
    personality: "활발",
    type: "genki",
    greeting:
      "안녕! 나랑 같이 66일 완주해보자! 절대 포기하면 안 돼, 알겠지?",
  },
  {
    id: "sera",
    name: "세라",
    title: "달빛 사서",
    color: "#60a5fa",
    accentColor: "#2563eb",
    personality: "지적",
    type: "intellectual",
    greeting:
      "습관 형성에는 평균 66일이 필요하다는 연구 결과가 있어. 함께 검증해볼까?",
  },
];

/* ── 초기 상태 ──────────────────────────────────────── */
const initialState: AppState = {
  screen: "splash",
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
  endingType: null,
};

/* ── 리듀서 ─────────────────────────────────────────── */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, screen: action.screen };

    case "SET_HABITS":
      return {
        ...state,
        habits: action.habits,
        todayHabitChecks: new Array(action.habits.length).fill(false),
      };

    case "SET_CHARACTER":
      return { ...state, character: action.character };

    case "TOGGLE_HABIT_CHECK": {
      const checks = [...state.todayHabitChecks];
      checks[action.index] = !checks[action.index];
      return { ...state, todayHabitChecks: checks };
    }

    case "VERIFY_SUCCESS": {
      const newAffection = Math.min(660, state.affection + 10);
      const newDays = state.completedDays.includes(state.dayCount)
        ? state.completedDays
        : [...state.completedDays, state.dayCount];
      // 스토리 언락 체크: 10일마다
      const storyId = Math.floor(state.dayCount / 10);
      const newStories =
        storyId > 0 && !state.unlockedStories.includes(storyId)
          ? [...state.unlockedStories, storyId]
          : state.unlockedStories;
      return {
        ...state,
        todayVerified: true,
        verificationSuccess: true,
        verificationCharacterMessage: action.message ?? null,
        affection: newAffection,
        streak: state.streak + 1,
        currency: state.currency + 10,
        completedDays: newDays,
        unlockedStories: newStories,
      };
    }

    case "VERIFY_FAIL":
      return {
        ...state,
        todayVerified: true,
        verificationSuccess: false,
        verificationCharacterMessage: action.message ?? null,
        streak: 0,
        affection: Math.max(0, state.affection - 5),
      };

    case "NEXT_DAY": {
      const nextDay = state.dayCount + 1;
      if (nextDay > 66) {
        const endingType =
          state.affection >= 500
            ? "best"
            : state.affection >= 300
            ? "normal"
            : "bad";
        return {
          ...state,
          dayCount: 66,
          screen: "ending",
          endingType,
        };
      }
      return {
        ...state,
        dayCount: nextDay,
        todayVerified: false,
        todayHabitChecks: new Array(state.habits.length).fill(false),
        verificationSuccess: null,
        verificationCharacterMessage: null,
        screen: "home",
      };
    }

    case "ADD_AFFECTION":
      return {
        ...state,
        affection: Math.min(660, state.affection + action.amount),
      };

    case "UNLOCK_STORY":
      if (state.unlockedStories.includes(action.storyId)) return state;
      return {
        ...state,
        unlockedStories: [...state.unlockedStories, action.storyId],
      };

    case "SET_ENDING":
      return { ...state, endingType: action.endingType, screen: "ending" };

    case "RESET":
      return { ...initialState };

    case "DEBUG_PATCH":
      return { ...state, ...action.patch };

    default:
      return state;
  }
}

/* ── Context ────────────────────────────────────────── */
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
