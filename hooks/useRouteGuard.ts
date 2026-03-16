"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export function useRouteGuard(rule: "setup-complete" | "verification-done") {
  const router = useRouter();
  const habits = useAppStore((s) => s.habits);
  const character = useAppStore((s) => s.character);
  const verificationSuccess = useAppStore((s) => s.verificationSuccess);

  useEffect(() => {
    if (rule === "setup-complete" && (habits.length === 0 || !character)) {
      router.replace("/onboarding");
    }
    if (rule === "verification-done" && verificationSuccess === null) {
      router.replace("/home");
    }
  }, [rule, habits, character, verificationSuccess, router]);
}
