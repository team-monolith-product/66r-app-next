"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Heart, BarChart2, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  Icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/home",      label: "홈",     Icon: Home },
  { path: "/chat",      label: "대화",   Icon: Heart },
  { path: "/dashboard", label: "기록",   Icon: BarChart2 },
  { path: "/story",     label: "스토리", Icon: BookOpen },
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
              style={isActive ? { color: "#3a90d4" } : { color: "#8ab0c8" }}
            >
              {isActive && (
                <div
                  className="absolute -top-0 w-8 h-[3px] rounded-full"
                  style={{ background: "#3a90d4", transform: "translateY(-6px)" }}
                />
              )}
              <item.Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                style={isActive ? { filter: "drop-shadow(0 0 4px rgba(58,144,212,0.5))" } : {}}
              />
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
