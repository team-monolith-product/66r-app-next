"use client";

import { useApp, type ScreenName } from "@/components/AppContext";

interface NavItem {
  screen: ScreenName;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { screen: "home",      label: "홈",     icon: "⌂"  },
  { screen: "chat",      label: "대화",   icon: "♡"  },
  { screen: "dashboard", label: "기록",   icon: "◈"  },
  { screen: "story",     label: "스토리", icon: "✦"  },
];

export default function BottomNav() {
  const { state, dispatch } = useApp();
  const { screen, character } = state;

  const accentColor = character?.color ?? "var(--gold)";

  return (
    <nav className="absolute bottom-0 left-0 right-0 glass-panel-dark rounded-t-2xl border-t border-white/10 px-2 pb-4 pt-2">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = screen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => dispatch({ type: "SET_SCREEN", screen: item.screen })}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
              style={
                isActive
                  ? {
                      background: `${accentColor}18`,
                      color: accentColor,
                    }
                  : { color: "var(--text-secondary)" }
              }
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span
                className="text-[10px] tracking-wide"
                style={isActive ? { color: accentColor } : {}}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ background: accentColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
