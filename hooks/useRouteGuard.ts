"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export function useRouteGuard(rule: "setup-complete" | "verification-done") {
  const router = useRouter();
  const habits = useAppStore((s) => s.habits);
  const character = useAppStore((s) => s.character);
  const todayVerified = useAppStore((s) => s.todayVerified);

  useEffect(() => {
    if (rule === "setup-complete" && (habits.length === 0 || !character)) {
      router.replace("/onboarding");
    }
    if (rule === "verification-done" && !todayVerified) {
      router.replace("/home");
    }
  }, [rule, habits, character, todayVerified, router]);
}
