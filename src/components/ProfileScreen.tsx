import React from "react";

const ProfileScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-on-surface-variant px-6 text-center">
      <span className="material-symbols-outlined text-6xl mb-4 text-primary opacity-40">
        person
      </span>
      <h2 className="font-headline text-3xl font-bold mb-2">Profile</h2>
      <p className="text-lg opacity-60 font-label max-w-md">
        Your taste profile, preferences, and saved spots will appear here. This feature is coming soon!
      </p>
    </div>
  );
};

export default ProfileScreen;
