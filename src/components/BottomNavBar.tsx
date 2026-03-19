import React from "react";

export type Screen = "home" | "explore" | "bookings" | "profile";

interface BottomNavBarProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeScreen,
  onScreenChange,
}) => {
  const navItems = [
    { id: "home", icon: "home", label: "Home" },
    { id: "explore", icon: "explore", label: "Explore" },
    { id: "bookings", icon: "restaurant_menu", label: "Bookings" },
    { id: "profile", icon: "person", label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-background/80 backdrop-blur-xl rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] border-t border-surface-variant/10">
      {navItems.map((item) => {
        const isActive = activeScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id as Screen)}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-300 active:scale-90 ${
              isActive
                ? "bg-gradient-to-br from-primary to-primary-container text-on-primary-container rounded-2xl shadow-[0_0_12px_rgba(255,181,154,0.4)]"
                : "text-on-surface opacity-60 hover:opacity-100"
            }`}
          >
            <span className="material-symbols-outlined mb-1" data-icon={item.icon}>
              {item.icon}
            </span>
            <span className="font-label text-[10px] uppercase tracking-widest">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
