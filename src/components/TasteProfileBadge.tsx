import React from 'react';
import { UserTasteProfile } from '../schemas/index.js';
import {
  Utensils,
  DollarSign,
  Sparkles,
  AlertCircle,
  CalendarHeart,
  MapPin,
  Ban,
  Heart,
} from 'lucide-react';

interface TasteProfileBadgeProps {
  profile?: UserTasteProfile | null;
  loading?: boolean;
}

export const TasteProfileBadge: React.FC<TasteProfileBadgeProps> = ({ profile, loading }) => {
  if (loading) {
    return (
      <div className="mx-auto mb-6 max-w-2xl animate-pulse rounded-xl border border-stone-200 bg-stone-50 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-indigo-200" />
          <div className="h-4 w-32 rounded bg-stone-200" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 rounded-full bg-indigo-100" />
          <div className="h-6 w-16 rounded-full bg-emerald-100" />
          <div className="h-6 w-24 rounded-full bg-stone-200" />
          <div className="h-6 w-20 rounded-full bg-pink-100" />
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
    <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <h4 className="text-xs font-bold tracking-[0.1em] text-stone-900 uppercase">
            Taste Profile
          </h4>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1 text-[10px] font-bold tracking-wider text-stone-500 uppercase">
          <Heart className="h-3 w-3 fill-current text-rose-500" />
          Refined
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
              Preferences
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hasCuisines &&
                profile.cuisines!.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
                  >
                    {cuisine}
                  </span>
                ))}

              {profile.price_range && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  {profile.price_range}
                </span>
              )}

              {hasAmbiance &&
                profile.ambiance!.map((amb) => (
                  <span
                    key={amb}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700"
                  >
                    {amb}
                  </span>
                ))}
            </div>
          </div>

          {(hasNeighborhoods || hasOccasions) && (
            <div>
              <p className="mb-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                Context
              </p>
              <div className="flex flex-wrap gap-1.5">
                {hasNeighborhoods &&
                  profile.neighborhoods!.map((nb) => (
                    <span
                      key={nb}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                    >
                      <MapPin className="h-2.5 w-2.5" />
                      {nb}
                    </span>
                  ))}
                {hasOccasions &&
                  profile.special_occasions!.map((occ) => (
                    <span
                      key={occ}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700"
                    >
                      <CalendarHeart className="h-2.5 w-2.5" />
                      {occ}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
              Avoids
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hasDislikedCuisines &&
                profile.disliked_cuisines!.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-400 line-through decoration-stone-300"
                  >
                    {cuisine}
                  </span>
                ))}
              {hasAvoidPatterns &&
                profile.avoid_patterns!.map((pattern) => (
                  <span
                    key={pattern}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-400"
                  >
                    <Ban className="h-2.5 w-2.5" />
                    {pattern}
                  </span>
                ))}
              {profile.dietary_notes && profile.dietary_notes.toLowerCase() !== 'none' && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-500">
                  <AlertCircle className="h-2.5 w-2.5" />
                  {profile.dietary_notes}
                </span>
              )}
              {!hasDislikedCuisines &&
                !hasAvoidPatterns &&
                (!profile.dietary_notes || profile.dietary_notes.toLowerCase() === 'none') && (
                  <p className="text-[11px] text-stone-400 italic">No restrictions.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
