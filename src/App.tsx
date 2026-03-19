import React, { useState } from "react";
import TopAppBar from "./components/TopAppBar.js";
import BottomNavBar, { Screen } from "./components/BottomNavBar.js";
import ChatInterface from "./components/ChatInterface.js";
import ExploreScreen from "./components/ExploreScreen.js";
import BookingsScreen from "./components/BookingsScreen.js";
import ProfileScreen from "./components/ProfileScreen.js";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("home");

  const renderScreen = () => {
    switch (activeScreen) {
      case "home":
        return <ChatInterface />;
      case "explore":
        return <ExploreScreen />;
      case "bookings":
        return <BookingsScreen />;
      case "profile":
        return <ProfileScreen />;
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
