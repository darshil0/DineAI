import React, { useState } from 'react';
import {
  Star,
  TrendingUp,
  MapPin,
  Phone,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import { Recommendation } from '../schemas/index.js';

interface RecommendationCardProps {
  recommendation?: Recommendation;
  loading?: boolean;
  onFeedback?: (name: string, type: 'like' | 'dislike') => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  loading,
  onFeedback,
}) => {
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);

  if (loading) {
    return (
      <div className="mb-4 animate-pulse rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-stone-200" />
            <div className="h-6 w-32 rounded bg-stone-200" />
          </div>
          <div className="h-6 w-20 rounded-full bg-stone-100" />
        </div>

        <div className="mb-4 space-y-2">
          <div className="h-4 w-full rounded bg-stone-100" />
          <div className="h-4 w-5/6 rounded bg-stone-100" />
        </div>

        <div className="mb-4 space-y-2">
          <div className="h-3 w-48 rounded bg-stone-50" />
          <div className="h-3 w-32 rounded bg-stone-50" />
        </div>

        <div className="h-12 w-full rounded-lg border border-amber-100/50 bg-amber-50/50" />
      </div>
    );
  }

  if (!recommendation) return null;

  const {
    rank,
    name,
    rationale,
    match_score,
    trend_relevance,
    trend_connection,
    address,
    phone,
    hours,
    cuisine,
    price_level,
    neighborhood,
  } = recommendation;
  const matchPercentage = Math.round(match_score * 100);

  const handleLike = () => {
    if (feedback === 'liked') return;
    setFeedback('liked');
    onFeedback?.(name, 'like');
  };

  const handleDislike = () => {
    if (feedback === 'disliked') return;
    setFeedback('disliked');
    onFeedback?.(name, 'dislike');
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address || ''}`)}`;

  return (
    <div className="group relative mb-4 overflow-hidden rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      {feedback === 'liked' && (
        <div className="absolute top-0 right-0 rounded-bl-lg bg-emerald-50 p-1 text-emerald-600">
          <Star className="h-4 w-4 fill-current" />
        </div>
      )}

      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
            #{rank}
          </div>
          <div>
            <h3 className="text-lg leading-tight font-semibold text-stone-900">{name}</h3>
            <div className="mt-1 flex items-center gap-2">
              {cuisine && (
                <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                  {cuisine}
                </span>
              )}
              {neighborhood && (
                <>
                  <span className="text-stone-300">|</span>
                  <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase italic">
                    {neighborhood}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <Star className="h-3 w-3" />
            {matchPercentage}% Match
          </div>
          {price_level && (
            <span className="text-xs font-bold tracking-widest text-emerald-600">
              {price_level}
            </span>
          )}
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-stone-600">{rationale}</p>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          {address && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <MapPin className="h-3.5 w-3.5 text-stone-400" />
              <span className="truncate">{address}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Phone className="h-3.5 w-3.5 text-stone-400" />
              <span>{phone}</span>
            </div>
          )}
          {hours && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Clock className="h-3.5 w-3.5 text-stone-400" />
              <span>{hours}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleLike}
            disabled={!!feedback}
            className={`rounded-lg border p-2 transition-all ${
              feedback === 'liked'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                : 'border-stone-200 text-stone-400 hover:border-emerald-200 hover:text-emerald-600'
            }`}
            title="Like this recommendation"
          >
            <ThumbsUp className={`h-4 w-4 ${feedback === 'liked' ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleDislike}
            disabled={!!feedback}
            className={`rounded-lg border p-2 transition-all ${
              feedback === 'disliked'
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-stone-200 text-stone-400 hover:border-red-200 hover:text-red-600'
            }`}
            title="Dislike this recommendation"
          >
            <ThumbsDown className={`h-4 w-4 ${feedback === 'disliked' ? 'fill-current' : ''}`} />
          </button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-stone-800"
          >
            <Navigation className="h-3.5 w-3.5" />
            Go
          </a>
        </div>
      </div>

      {trend_relevance &&
        trend_relevance.trim() !== '' &&
        trend_relevance.toLowerCase() !== 'none' && (
          <div className="space-y-2 rounded-lg border border-amber-100 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-800 italic">
                <span className="text-[10px] font-semibold tracking-wide uppercase not-italic">
                  Trend:
                </span>{' '}
                {trend_relevance}
              </p>
            </div>
            {trend_connection && (
              <p className="border-t border-amber-200/50 pt-2 pl-6 text-xs leading-relaxed text-amber-900/80">
                {trend_connection}
              </p>
            )}
          </div>
        )}
    </div>
  );
};
