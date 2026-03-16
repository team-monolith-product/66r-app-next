"use client";

import DebugPanel from "@/components/ui/DebugPanel";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-dvh flex items-center justify-center bg-[#050310] py-6">
      <div className="app-container relative">
        {children}
        <DebugPanel />
      </div>
    </div>
  );
}
