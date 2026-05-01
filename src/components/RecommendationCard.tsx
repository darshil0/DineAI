import React from "react";
import { Star, TrendingUp, MapPin, Phone, Clock } from "lucide-react";
import { Recommendation } from "../schemas/index.js";

interface RecommendationCardProps {
  recommendation?: Recommendation;
  loading?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm mb-4 animate-pulse">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200" />
            <div className="h-6 w-32 bg-stone-200 rounded" />
          </div>
          <div className="h-6 w-20 bg-stone-100 rounded-full" />
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-stone-100 rounded" />
          <div className="h-4 w-5/6 bg-stone-100 rounded" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="h-3 w-48 bg-stone-50 rounded" />
          <div className="h-3 w-32 bg-stone-50 rounded" />
        </div>

        <div className="h-12 w-full bg-amber-50/50 rounded-lg border border-amber-100/50" />
      </div>
    );
  }

  if (!recommendation) return null;

  const { rank, name, rationale, match_score, trend_relevance, trend_connection, address, phone, hours } = recommendation;
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
      
      <p className="text-stone-600 text-sm leading-relaxed mb-4">
        {rationale}
      </p>

      <div className="space-y-2 mb-4">
        {address && (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <span>{address}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Phone className="w-3.5 h-3.5 text-stone-400" />
            <span>{phone}</span>
          </div>
        )}
        {hours && (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{hours}</span>
          </div>
        )}
      </div>

      {trend_relevance && trend_relevance.trim() !== "" && trend_relevance.toLowerCase() !== "none" && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed italic">
              <span className="font-semibold not-italic tracking-wide uppercase text-[10px]">Trend:</span> {trend_relevance}
            </p>
          </div>
          {trend_connection && (
            <p className="text-xs text-amber-900/80 leading-relaxed border-t border-amber-200/50 pt-2 pl-6">
              {trend_connection}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
