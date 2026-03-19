import React from "react";

const TopAppBar: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-20 bg-background border-b border-surface-variant/10">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl" data-icon="location_on">
          location_on
        </span>
        <span className="text-2xl font-black text-primary tracking-tighter font-headline">
          DineAI
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-surface-bright transition-colors duration-200 active:scale-95 text-primary">
          <span className="material-symbols-outlined" data-icon="smart_toy">
            smart_toy
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopAppBar;
