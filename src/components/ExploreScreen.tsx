import React from "react";
import { restaurants } from "../data/restaurants";
import ExploreRestaurantCard from "./ExploreRestaurantCard";

const ExploreScreen: React.FC = () => {
  const categories = [
    "All",
    "Sushi",
    "Fine Dining",
    "Italian",
    "Vegan",
    "Rooftop",
    "Late Night",
  ];

  // Safe references to featured restaurants by name, not brittle indices
  const FEATURED_RESTAURANTS = {
    sushi: "Sushi Nakazawa",
    seafood: "Cervo's",
    pizza: "Lucali",
    finedining: "Le Bernardin",
    vegan: "Superiority Burger",
  };

  // Get featured restaurants safely
  const sushiRest = restaurants.find(r => r.name === FEATURED_RESTAURANTS.sushi);
  const seafoodRest = restaurants.find(r => r.name === FEATURED_RESTAURANTS.seafood);
  const pizzaRest = restaurants.find(r => r.name === FEATURED_RESTAURANTS.pizza);
  const fineRest = restaurants.find(r => r.name === FEATURED_RESTAURANTS.finedining);
  const veganRest = restaurants.find(r => r.name === FEATURED_RESTAURANTS.vegan);

  const featuredImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDHdhb8uzKlZ_unr84YcyomCzM0e5hgEX2JuKpo5vrgq5In_y0JiC52sR2Z1n8P4iuB2IkWXwP1tP14NlLCUfaG8204oqXoBdzHyJlF6zVsXPCzFDiLBYQTXHYCYCSymKN37AMcR6MQ_97eEZs3Jk-XMOHnu74mQw-4K0fG-8PmEMtCRzmUpLpEp7W-ltVrAVuQ90PK58RnfP3-6mh2Lzy-RQaPpuZEOySoTlregehUT0elKRGJ5m3hAAnLwZZ8EmlRU1v5uCnmeAbe",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDfYIIoC7rdF35bXQNET3V7jbynX2ha4nFVV2sARo1HtPV0L9Fwc-8bAx9q4G7dZrgI_1awaqv_2B2nhzagn3YsEPfU9sP0NeEX_QuzF1lacrMN98EUlNBxYdfR5tWIJbQea8fEEORFsnjKS1ssTS_Mo_2TrSIr79C3kR4vdPKo1Fs1GxFqBqNaZAoUAYYGtqti9InknTpX7SUSKqCn6yz-oRM5-cy4FR8ufWHq66fmryyAurrYs6nCZqsdE3Ua_zhi5nbAcTFi2OAN",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDwd7oCXo8OD8qUlX7sv24H0GwPinsqVNFth_7tMazwYebcPLzfA07hbixTExwi7Cc4twKifHlMpDUPwY5EfPsU6HfdE9I6CYKmvwVDu9XrWVLRjkAcz8amcKVv1zSAHm_au16aZYJqU32MGlSBiu1Ys3Ockz_VEvYtWMgK5t_dmuy2PWn3G9AGhMV-3ut6NJSB0QnVukjsBTejIrODXYGHQLtrrI_dresFbKEN175N-K89NS4nrwIVPP5woSNPPxp9Ki_L1tTYUUR8",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCQQ9HiWlnUW7Zuwo9L1zI-7hp8UW042HhCEIUMUq9a1HINvmOHiLPB2DNLWwB3HguE8mnn0bBytOR2pLvms1BNB1KuEle-husQjmGT0VDuCNL0Slszp8rR0w7WDe8eWmXapT_n4Wvnb35xkH8nPwKBUSc_tV7yAREGTjKfovtyk8dDbeHwk8061KuIjYr-MVZmP-7QX9bRnXHG2UZnRKy_pZNyVlQi9O-ZQa4DlkOz29lLL_pMY685JtvjSA7-PXqNQOlfSKhc67JQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCshXHYZ-saealQfWPVKQpRuirEvSJGauw9kIIGeq_7t-VUO7lIfw1a_sZFrB_Nj4UyMt2W5l9l7BSuVF6bANYUPLM7D2R3pMGWWL6jIbXQTIjUoVAbO2jfNQ2W9W-3OqTtxd5aa8vPn57N_X4pA3YHbAZ0zPz_sedaHJN1pF7MLt5QgiKTupjMTTwb2qwoImtpaG9v1fx4k6jjhG_y1DY6Z6VvisYavQZkJwp_3JuUt8yJPICdhmAlvep_7aBrczCrKHbFI5tZImt1",
  ];

  const mockInsights = [
    "Perfect for your preference for quiet ambiance and rare seasonal fish selections. Their Bluefin Tuna is unmatched in the city.",
    "Matches your 'dimly lit' search tag. The AI notes guests mention the jazz playlist fits your saved Spotify preferences.",
    "The highest-rated authentic Neapolitan style near you. Often has last-minute table openings on Tuesday nights.",
    "Matches your interest in molecular gastronomy. Guests frequently praise the chef's table experience for special occasions.",
    "Top choice for your recent healthy eating streak. High protein vegan options available for post-workout meals.",
  ];

  return (
    <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto min-h-screen">
      {/* Search & Filter Section */}
      <section className="mb-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline">search</span>
          </div>
          <input
            className="w-full bg-surface-container-high border-none rounded-2xl py-5 pl-14 pr-32 focus:ring-2 focus:ring-surface-tint/50 transition-all font-label placeholder:text-outline/60 text-lg text-on-surface"
            placeholder="Search for your next craving..."
            type="text"
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            <button className="bg-surface-bright text-on-surface px-4 py-2 rounded-xl flex items-center gap-2 font-label text-sm transition-all hover:bg-surface-variant active:scale-95">
              <span className="material-symbols-outlined text-sm">map</span>
              Map View
            </button>
          </div>
        </div>

        {/* Secondary Filter Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-4 pb-2 border-b border-surface-variant/20">
          <div className="flex items-center gap-2 px-3 border-r border-surface-variant/30 pr-4 shrink-0">
            <span className="material-symbols-outlined text-sm text-primary">tune</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Filters</span>
          </div>
          {[
            { label: "$$" },
            { label: "$$$" },
            { icon: "distance", label: "< 1 mi" },
            { icon: "distance", label: "< 5 mi" },
            { icon: "star", label: "4.0+", primaryIcon: true },
            { icon: "eco", label: "Vegan" },
            { icon: "no_food", label: "Gluten-Free" },
          ].map((filter, idx) => (
            <button
              key={idx}
              className="flex-none px-4 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface hover:bg-surface-bright font-label text-xs transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              {filter.icon && (
                <span className={`material-symbols-outlined text-xs ${filter.primaryIcon ? "text-primary" : ""}`}>
                  {filter.icon}
                </span>
              )}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Category Chips */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pt-4">
          {categories.map((cat, idx) => (
            <button
              key={cat}
              className={`flex-none px-6 py-2.5 rounded-full font-label text-sm transition-all ${
                idx === 0
                  ? "bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold shadow-[0_4px_12px_rgba(255,92,0,0.3)]"
                  : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sushiRest && (
          <ExploreRestaurantCard
            restaurant={sushiRest}
            imageUrl={featuredImages[0]}
            aiInsight={mockInsights[0]}
            isAiRecommended
          />
        )}
        {seafoodRest && (
          <ExploreRestaurantCard
            restaurant={seafoodRest}
            imageUrl={featuredImages[1]}
            aiInsight={mockInsights[1]}
          />
        )}
        {pizzaRest && (
          <ExploreRestaurantCard
            restaurant={pizzaRest}
            imageUrl={featuredImages[2]}
            aiInsight={mockInsights[2]}
          />
        )}
        {fineRest && (
          <ExploreRestaurantCard
            restaurant={fineRest}
            imageUrl={featuredImages[3]}
            aiInsight={mockInsights[3]}
            isBento
          />
        )}
        {veganRest && (
          <ExploreRestaurantCard
            restaurant={veganRest}
            imageUrl={featuredImages[4]}
            aiInsight={mockInsights[4]}
          />
        )}
      </div>
    </main>
  );
};

export default ExploreScreen;
