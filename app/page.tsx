"use client";

import { AppProvider, useApp } from "@/components/AppContext";
import SplashScreen from "@/components/screens/SplashScreen";
import OnboardingScreen from "@/components/screens/OnboardingScreen";
import HabitSetupScreen from "@/components/screens/HabitSetupScreen";
import CharacterSelectScreen from "@/components/screens/CharacterSelectScreen";
import HomeScreen from "@/components/screens/HomeScreen";
import VerificationScreen from "@/components/screens/VerificationScreen";
import VerificationResultScreen from "@/components/screens/VerificationResultScreen";
import ChatScreen from "@/components/screens/ChatScreen";
import StoryScreen from "@/components/screens/StoryScreen";
import DashboardScreen from "@/components/screens/DashboardScreen";
import EndingScreen from "@/components/screens/EndingScreen";

function ScreenRouter() {
  const { state } = useApp();

  const screens: Record<typeof state.screen, React.ReactNode> = {
    splash: <SplashScreen />,
    onboarding: <OnboardingScreen />,
    habitSetup: <HabitSetupScreen />,
    characterSelect: <CharacterSelectScreen />,
    home: <HomeScreen />,
    verification: <VerificationScreen />,
    verificationResult: <VerificationResultScreen />,
    chat: <ChatScreen />,
    story: <StoryScreen />,
    dashboard: <DashboardScreen />,
    ending: <EndingScreen />,
  };

  return <div className="app-container">{screens[state.screen]}</div>;
}

export default function Page() {
  return (
    <AppProvider>
      <div className="w-full min-h-dvh flex items-center justify-center bg-[#050310] py-6">
        <ScreenRouter />
      </div>
    </AppProvider>
  );
}
