import React from "react";
import { UserTasteProfile } from "../schemas/index.js";
import { Utensils, DollarSign, Sparkles, AlertCircle, CalendarHeart, MapPin, Ban, Heart } from "lucide-react";

interface TasteProfileBadgeProps {
  profile?: UserTasteProfile | null;
  loading?: boolean;
}

export const TasteProfileBadge: React.FC<TasteProfileBadgeProps> = ({ profile, loading }) => {
  if (loading) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 shadow-sm mb-6 max-w-2xl mx-auto animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-indigo-200 rounded-full" />
          <div className="h-4 w-32 bg-stone-200 rounded" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 bg-indigo-100 rounded-full" />
          <div className="h-6 w-16 bg-emerald-100 rounded-full" />
          <div className="h-6 w-24 bg-stone-200 rounded-full" />
          <div className="h-6 w-20 bg-pink-100 rounded-full" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const hasCuisines = profile.cuisines && profile.cuisines.length > 0;
  const hasDislikedCuisines = profile.disliked_cuisines && profile.disliked_cuisines.length > 0;
  const hasAmbiance = profile.ambiance && profile.ambiance.length > 0;
  const hasOccasions = profile.special_occasions && profile.special_occasions.length > 0;
  const hasNeighborhoods = profile.neighborhoods && profile.neighborhoods.length > 0;
  const hasAvoidPatterns = profile.avoid_patterns && profile.avoid_patterns.length > 0;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm mb-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-[0.1em]">Taste Profile</h4>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-100 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
          <Heart className="w-3 h-3 text-rose-500 fill-current" />
          Refined
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Preferences</p>
            <div className="flex flex-wrap gap-1.5">
              {hasCuisines && profile.cuisines!.map((cuisine) => (
                <span key={cuisine} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-100">
                  {cuisine}
                </span>
              ))}
              
              {profile.price_range && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
                  {profile.price_range}
                </span>
              )}

              {hasAmbiance && profile.ambiance!.map((amb) => (
                <span key={amb} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                  {amb}
                </span>
              ))}
            </div>
          </div>

          {(hasNeighborhoods || hasOccasions) && (
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Context</p>
              <div className="flex flex-wrap gap-1.5">
                {hasNeighborhoods && profile.neighborhoods!.map((nb) => (
                  <span key={nb} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100">
                    <MapPin className="w-2.5 h-2.5" />
                    {nb}
                  </span>
                ))}
                {hasOccasions && profile.special_occasions!.map((occ) => (
                  <span key={occ} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-medium border border-rose-100">
                    <CalendarHeart className="w-2.5 h-2.5" />
                    {occ}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Avoids</p>
            <div className="flex flex-wrap gap-1.5">
              {hasDislikedCuisines && profile.disliked_cuisines!.map((cuisine) => (
                <span key={cuisine} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-50 text-stone-400 text-[11px] font-medium border border-stone-200 line-through decoration-stone-300">
                  {cuisine}
                </span>
              ))}
              {hasAvoidPatterns && profile.avoid_patterns!.map((pattern) => (
                <span key={pattern} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-50 text-stone-400 text-[11px] font-medium border border-stone-200">
                  <Ban className="w-2.5 h-2.5" />
                  {pattern}
                </span>
              ))}
              {profile.dietary_notes && profile.dietary_notes.toLowerCase() !== "none" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-50 text-stone-500 text-[11px] font-medium border border-stone-200">
                  <AlertCircle className="w-2.5 h-2.5" />
                  {profile.dietary_notes}
                </span>
              )}
              {(!hasDislikedCuisines && !hasAvoidPatterns && (!profile.dietary_notes || profile.dietary_notes.toLowerCase() === "none")) && (
                <p className="text-[11px] text-stone-400 italic">No restrictions.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
