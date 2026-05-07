import React from 'react';
import { UserTasteProfile } from '../schemas/index.js';
import { Sparkles, AlertCircle, CalendarHeart, MapPin, Ban, Heart } from 'lucide-react';
import { cn } from '../lib/utils.js';

interface TasteProfileBadgeProps {
  profile?: UserTasteProfile | null;
  loading?: boolean;
}

export const TasteProfileBadge: React.FC<TasteProfileBadgeProps> = ({ profile, loading }) => {
  if (loading) {
    return (
      <div className="mx-auto mb-6 max-w-2xl animate-pulse glass-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-[var(--color-brand-primary)]/20" />
          <div className="h-4 w-32 rounded bg-white/5" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 rounded-full bg-white/5" />
          <div className="h-6 w-16 rounded-full bg-white/5" />
          <div className="h-6 w-24 rounded-full bg-white/5" />
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
    <div className="mx-auto mb-6 max-w-2xl glass-card p-5">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-brand-primary)]" />
          <h4 className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-main)] uppercase">
            Taste Profile
          </h4>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-brand-primary)]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--color-brand-primary)] uppercase border border-[var(--color-brand-primary)]/20">
          <Heart className="h-3 w-3 fill-current" />
          Refined
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[9px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
              Preferences
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hasCuisines &&
                profile.cuisines!.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-text-main)]"
                  >
                    {cuisine}
                  </span>
                ))}

              {profile.price_range && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-brand-primary)]">
                  {profile.price_range}
                </span>
              )}
            </div>
          </div>

          {hasNeighborhoods && (
            <div>
              <p className="mb-2 text-[9px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                Locations
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.neighborhoods!.map((nb) => (
                  <span
                    key={nb}
                    className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-text-main)]"
                  >
                    <MapPin className="h-2.5 w-2.5 text-[var(--color-text-muted)]" />
                    {nb}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[9px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
              Lifestyle & Mood
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hasAmbiance &&
                profile.ambiance!.map((amb) => (
                  <span
                    key={amb}
                    className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-text-main)]"
                  >
                    {amb}
                  </span>
                ))}
              {hasOccasions &&
                profile.special_occasions!.map((occ) => (
                  <span
                    key={occ}
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-primary)]/5 border border-[var(--color-brand-primary)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-brand-primary)]"
                  >
                    <CalendarHeart className="h-2.5 w-2.5" />
                    {occ}
                  </span>
                ))}
            </div>
          </div>

          {(hasDislikedCuisines || hasAvoidPatterns || profile.dietary_notes) && (
            <div>
              <p className="mb-2 text-[9px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                Restrictions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.dietary_notes && profile.dietary_notes.toLowerCase() !== 'none' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-[11px] font-medium text-red-400">
                    <AlertCircle className="h-2.5 w-2.5" />
                    {profile.dietary_notes}
                  </span>
                )}
                {hasAvoidPatterns &&
                  profile.avoid_patterns!.map((pattern) => (
                    <span
                      key={pattern}
                      className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]"
                    >
                      <Ban className="h-2.5 w-2.5" />
                      {pattern}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
