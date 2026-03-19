import React from "react";
import { Star, TrendingUp } from "lucide-react";
import { Recommendation } from "../schemas/index.js";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
}) => {
  const { rank, name, rationale, match_score, trend_relevance } =
    recommendation;
  const matchPercentage = Math.round(match_score * 100);

  return (
    <div className="bg-surface-container-low border border-surface-variant/30 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-sm font-headline">
            #{rank}
          </div>
          <h3 className="text-xl font-bold text-on-surface font-headline tracking-tight">{name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="px-3 py-1.5 rounded-full bg-secondary-container text-white text-xs font-bold font-label flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-current" />
            {matchPercentage}% Match
          </div>
        </div>
      </div>

      <p className="text-on-surface-variant text-sm leading-relaxed mb-4 italic">
        "{rationale}"
      </p>

      {trend_relevance &&
        trend_relevance.trim() !== "" &&
        trend_relevance.toLowerCase() !== "none" && (
          <div className="bg-surface-container-high border-l-4 border-primary rounded-2xl p-4 flex items-start gap-3">
            <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-label block">
                Trend Insight
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {trend_relevance}
              </p>
            </div>
          </div>
        )}
    </div>
  );
};
