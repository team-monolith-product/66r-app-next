"use client";

import { useRouter, usePathname } from "next/navigation";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/home",      label: "홈",     icon: "⌂" },
  { path: "/chat",      label: "대화",   icon: "♡" },
  { path: "/dashboard", label: "기록",   icon: "◈" },
  { path: "/story",     label: "스토리", icon: "✦" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 px-2 pb-3 pt-1.5"
      style={{
        background: "rgba(255,255,255,0.94)",
        borderTop: "1px solid rgba(160,210,240,0.5)",
        boxShadow: "0 -4px 20px rgba(90,150,200,0.10)",
        zIndex: 20,
      }}
    >
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all active:scale-95"
              style={
                isActive
                  ? { color: "#3a90d4" }
                  : { color: "#8ab0c8" }
              }
            >
              {isActive && (
                <div
                  className="absolute -top-0 w-8 h-[3px] rounded-full"
                  style={{ background: "#3a90d4", transform: "translateY(-6px)" }}
                />
              )}
              <span
                className="text-xl leading-none"
                style={isActive ? { filter: "drop-shadow(0 0 4px rgba(58,144,212,0.5))" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
