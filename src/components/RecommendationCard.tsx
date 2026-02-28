import React from "react";
import { Star, TrendingUp, MapPin } from "lucide-react";
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
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-900 text-white font-bold text-sm">
            #{rank}
          </div>
          <h3 className="text-lg font-semibold text-stone-900">{name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3" />
            {matchPercentage}% Match
          </div>
        </div>
      </div>

      <p className="text-stone-600 text-sm leading-relaxed mb-4">{rationale}</p>

      {trend_relevance &&
        trend_relevance.trim() !== "" &&
        trend_relevance.toLowerCase() !== "none" && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">Trend Alert:</span>{" "}
              {trend_relevance}
            </p>
          </div>
        )}
    </div>
  );
};
