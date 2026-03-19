import React from "react";
import { UserTasteProfile } from "../schemas/index.js";

interface TasteProfileBadgeProps {
  profile: UserTasteProfile;
}

export const TasteProfileBadge: React.FC<TasteProfileBadgeProps> = ({
  profile,
}) => {
  return (
    <div className="bg-surface-container-high border border-surface-variant/30 rounded-[32px] p-6 mb-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary-container/20 p-2 rounded-xl">
          <span className="material-symbols-outlined text-primary text-xl">
            analytics
          </span>
        </div>
        <h4 className="text-sm font-bold uppercase tracking-widest text-primary font-label">
          Updated Taste Profile
        </h4>
      </div>

      <div className="space-y-4">
        {profile.cuisines && profile.cuisines.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2 font-label">
              Preferred Cuisines
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.cuisines.map((cuisine) => (
                <span
                  key={cuisine}
                  className="px-3 py-1.5 rounded-full bg-surface-bright border border-outline-variant/30 text-on-surface text-xs font-label"
                >
                  {cuisine}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {profile.price_range && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-1 font-label">
                Price Range
              </span>
              <p className="text-sm font-bold text-on-surface font-headline">
                {profile.price_range}
              </p>
            </div>
          )}
          {profile.special_occasions && profile.special_occasions.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-1 font-label">
                Occasion
              </span>
              <div className="flex flex-wrap gap-1">
                {profile.special_occasions.map((occasion) => (
                  <span key={occasion} className="text-sm font-bold text-on-surface font-headline">
                    {occasion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {profile.ambiance && profile.ambiance.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2 font-label">
              Vibe
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.ambiance.map((vibe) => (
                <span
                  key={vibe}
                  className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-label font-bold"
                >
                  {vibe}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.dietary_notes && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-1 font-label">
              Dietary Preferences
            </span>
            <p className="text-xs text-on-surface-variant italic">
              {profile.dietary_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
