import React from "react";

const BookingsScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-on-surface-variant px-6 text-center">
      <span className="material-symbols-outlined text-6xl mb-4 text-primary opacity-40">
        restaurant_menu
      </span>
      <h2 className="font-headline text-3xl font-bold mb-2">Bookings</h2>
      <p className="text-lg opacity-60 font-label max-w-md">
        Your reservations and dining history will appear here. This feature is coming soon!
      </p>
    </div>
  );
};

export default BookingsScreen;
