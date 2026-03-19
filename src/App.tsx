import React, { useState } from "react";
import TopAppBar from "./components/TopAppBar";
import BottomNavBar, { type Screen } from "./components/BottomNavBar";
import ChatInterface from "./components/ChatInterface";
import ExploreScreen from "./components/ExploreScreen";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home");

  const renderScreen = () => {
    switch (activeScreen) {
      case "home":
        return <ChatInterface />;
      case "explore":
        return <ExploreScreen />;
      case "bookings":
        return (
          <div className="flex items-center justify-center min-h-screen text-on-surface-variant font-headline text-xl">
            Bookings Screen (Coming Soon)
          </div>
        );
      case "profile":
        return (
          <div className="flex items-center justify-center min-h-screen text-on-surface-variant font-headline text-xl">
            Profile Screen (Coming Soon)
          </div>
        );
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      <div className="pb-24">
        {renderScreen()}
      </div>
      <BottomNavBar
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
      />
    </div>
  );
}
