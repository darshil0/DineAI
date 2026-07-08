import React, { useState } from 'react';
import {
  Star,
  TrendingUp,
  MapPin,
  Phone,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Navigation,
} from 'lucide-react';
import { Recommendation } from '../schemas/index.js';
import { cn } from '../lib/utils.js';

interface RecommendationCardProps {
  recommendation?: Recommendation;
  loading?: boolean;
  isFavorite?: boolean;
  onFeedback?: (name: string, type: 'like' | 'dislike') => void;
  onToggleFavorite?: (rec: Recommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  loading,
  isFavorite = false,
  onFeedback = () => {},
  onToggleFavorite = () => {},
}) => {
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);

  if (loading) {
    return (
      <div className="mb-4 animate-pulse glass-card p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/5" />
            <div className="h-6 w-32 rounded bg-white/5" />
          </div>
          <div className="h-6 w-20 rounded-full bg-white/10" />
        </div>
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-5/6 rounded bg-white/5" />
        </div>
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
    whyMatch,
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
    <div className="group relative mb-6 overflow-hidden glass-card p-6 transition-all hover:bg-white/[0.07] hover:scale-[1.01] hover:shadow-2xl">
      {/* Top Banner for Rank */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[var(--color-brand-primary)] to-transparent opacity-30" />

      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/30 text-base font-black text-[var(--color-brand-primary)] shadow-inner">
            {rank}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[var(--color-text-main)] group-hover:text-[var(--color-brand-primary)] transition-colors">
              {name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
                {cuisine}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
                {neighborhood}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-brand-primary)] px-3 py-1 text-[11px] font-black text-black shadow-lg">
            <Star className="h-3 w-3 fill-current" />
            {matchPercentage}%
          </div>
          <span className="text-xs font-black tracking-widest text-[var(--color-brand-primary)]/60">
            {price_level}
          </span>
        </div>
      </div>

      {/* Why it matches (Heuristic Rationale) */}
      {(whyMatch || rationale) && (
        <div className="mb-4 rounded-xl bg-white/5 border border-white/10 p-3">
           <p className="text-xs italic leading-relaxed text-[var(--color-text-main)]/90">
             <span className="text-[9px] font-bold tracking-widest uppercase not-italic text-[var(--color-brand-primary)] mr-2">Why it matches:</span>
             {whyMatch || rationale}
           </p>
        </div>
      )}

      {/* Trend Insights */}
      {trend_relevance && trend_relevance !== 'None' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-[var(--color-brand-primary)]/5 border border-[var(--color-brand-primary)]/10 p-4">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-primary)]" />
          <div>
            <p className="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-widest mb-1">Culinary Trend</p>
            <p className="text-xs leading-relaxed text-[var(--color-text-main)]/80 italic">
              {trend_relevance}
            </p>
            {trend_connection && (
              <p className="mt-2 border-t border-white/5 pt-2 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                {trend_connection}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
        <div className="space-y-1.5">
          {address && (
            <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
              <MapPin className="h-3 w-3 text-[var(--color-brand-primary)]/50" />
              <span className="truncate max-w-[180px]">{address}</span>
            </div>
          )}
          {hours && (
            <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
              <Clock className="h-3 w-3 text-[var(--color-brand-primary)]/50" />
              <span>{hours}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="mr-2 flex items-center gap-1 border-r border-white/10 pr-2">
            <button
              onClick={handleLike}
              disabled={!!feedback}
              className={cn(
                'rounded-lg p-2 transition-all',
                feedback === 'liked'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10'
              )}
            >
              <ThumbsUp className={cn('h-4 w-4', feedback === 'liked' && 'fill-current')} />
            </button>
            <button
              onClick={handleDislike}
              disabled={!!feedback}
              className={cn(
                'rounded-lg p-2 transition-all',
                feedback === 'disliked'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'text-white/20 hover:text-rose-400 hover:bg-rose-500/10'
              )}
            >
              <ThumbsDown className={cn('h-4 w-4', feedback === 'disliked' && 'fill-current')} />
            </button>
          </div>

          <button
            onClick={() => recommendation && onToggleFavorite?.(recommendation)}
            className={cn(
              'rounded-lg p-2 transition-all',
              isFavorite
                ? 'bg-rose-500/20 text-rose-500'
                : 'text-white/20 hover:text-rose-500 hover:bg-rose-500/10'
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-[11px] font-bold text-white transition-all hover:bg-white/20"
          >
            <Navigation className="h-3.5 w-3.5" />
            Navigate
          </a>
        </div>
      </div>
    </div>
  );
};
