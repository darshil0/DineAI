import React from "react";
import { UserTasteProfile } from "../schemas/index.js";
import { Utensils, DollarSign, Sparkles, AlertCircle, CalendarHeart } from "lucide-react";

interface TasteProfileBadgeProps {
  profile: UserTasteProfile | null;
}

export const TasteProfileBadge: React.FC<TasteProfileBadgeProps> = ({ profile }) => {
  if (!profile) return null;

  const hasCuisines = profile.cuisines && profile.cuisines.length > 0;
  const hasAmbiance = profile.ambiance && profile.ambiance.length > 0;
  const hasOccasions = profile.special_occasions && profile.special_occasions.length > 0;

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 shadow-sm mb-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <h4 className="text-sm font-semibold text-stone-800 uppercase tracking-wider">Your Taste Profile</h4>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {hasCuisines && profile.cuisines!.map((cuisine, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
            <Utensils className="w-3 h-3" />
            {cuisine}
          </span>
        ))}
        
        {profile.price_range && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
            <DollarSign className="w-3 h-3" />
            {profile.price_range}
          </span>
        )}

        {hasAmbiance && profile.ambiance!.map((amb, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200 text-stone-800 text-xs font-medium">
            {amb}
          </span>
        ))}

        {hasOccasions && profile.special_occasions!.map((occ, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-medium">
            <CalendarHeart className="w-3 h-3" />
            {occ}
          </span>
        ))}

        {profile.dietary_notes && profile.dietary_notes.toLowerCase() !== "none" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            {profile.dietary_notes}
          </span>
        )}
      </div>
    </div>
  );
};
