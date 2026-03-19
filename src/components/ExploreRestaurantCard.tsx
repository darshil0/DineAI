import React from "react";
import { Restaurant } from "../data/restaurants";

interface ExploreRestaurantCardProps {
  restaurant: Restaurant;
  aiInsight?: string;
  isAiRecommended?: boolean;
  isPopular?: boolean;
  imageUrl: string;
  isBento?: boolean;
}

const ExploreRestaurantCard: React.FC<ExploreRestaurantCardProps> = ({
  restaurant,
  aiInsight,
  isAiRecommended,
  isPopular,
  imageUrl,
  isBento,
}) => {
  if (isBento) {
    return (
      <div className="group lg:col-span-2 flex flex-col md:flex-row bg-surface-container-low rounded-[32px] overflow-hidden transition-all duration-300 hover:translate-y-[-4px]">
        <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={restaurant.name}
            src={imageUrl}
          />
          <div className="absolute top-4 left-4">
            <span className="bg-secondary-container text-white px-3 py-1 rounded-lg font-label text-[10px] tracking-widest uppercase">
              Popular Near You
            </span>
          </div>
        </div>
        <div className="p-8 flex flex-col justify-center md:w-1/2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
                {restaurant.name}
              </h3>
              <p className="text-on-surface-variant font-label mt-1">
                {restaurant.cuisine}
              </p>
            </div>
            <div className="text-right">
              <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 font-label text-xs font-bold text-white mb-2">
                <span
                  className="material-symbols-outlined text-primary text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                {restaurant.rating}
              </span>
              <div className="text-primary-fixed-dim font-label font-bold text-lg">
                {restaurant.price_tier}
              </div>
            </div>
          </div>
          <div className="bg-surface-container-high p-5 rounded-2xl border-l-4 border-primary-container shadow-inner mb-6">
            <div className="flex items-center gap-2 mb-2 text-primary-container font-label text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">
                auto_awesome
              </span>
              DineAI Insight
            </div>
            <p className="text-on-surface-variant italic leading-relaxed">
              "{aiInsight}"
            </p>
          </div>
          <button className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-headline font-bold py-4 rounded-2xl transition-all hover:shadow-[0_8px_24px_rgba(255,92,0,0.4)] active:scale-95">
            Reserve a Table
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col bg-surface-container-low rounded-[32px] overflow-hidden transition-all duration-300 hover:translate-y-[-4px]">
      <div className="relative h-64 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={restaurant.name}
          src={imageUrl}
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 font-label text-xs font-bold text-white">
            <span
              className="material-symbols-outlined text-primary text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            {restaurant.rating}
          </span>
        </div>
        {isAiRecommended && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-secondary-container text-white px-3 py-1 rounded-lg font-label text-[10px] tracking-widest uppercase">
              AI Recommended
            </span>
          </div>
        )}
        {isPopular && (
          <div className="absolute top-4 left-4">
            <span className="bg-secondary-container text-white px-3 py-1 rounded-lg font-label text-[10px] tracking-widest uppercase">
              Popular Near You
            </span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface">
            {restaurant.name}
          </h3>
          <span className="font-label text-primary-fixed-dim font-bold">
            {restaurant.price_tier}
          </span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant text-sm font-label mb-4">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">
              distance
            </span>
            {(0.5 + Math.random() * 2).toFixed(1)} mi
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span>{restaurant.cuisine}</span>
        </div>
        {aiInsight && (
          <div className="mt-auto bg-surface-container-high p-4 rounded-2xl border-l-4 border-primary shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-primary font-label text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">
                auto_awesome
              </span>
              Why you'll like it
            </div>
            <p className="text-sm text-on-surface-variant italic leading-relaxed">
              "{aiInsight}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreRestaurantCard;
