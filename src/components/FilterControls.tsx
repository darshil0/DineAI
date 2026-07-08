import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Recommendation } from '../schemas/index.js';
import { cn } from '../lib/utils.js';

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  icon: React.ReactNode;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  align?: 'left' | 'right';
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  icon,
  options,
  selected,
  onChange,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold tracking-wide transition-all uppercase',
          selected.length > 0
            ? 'bg-[var(--color-brand-primary)] text-black border-transparent shadow-lg'
            : 'border-white/10 bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 hover:border-white/20'
        )}
      >
        {icon}
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/20 text-[10px]">
            {selected.length}
          </span>
        )}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            className={cn(
              'absolute z-50 mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-bg-card)] p-2 shadow-2xl backdrop-blur-xl',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="max-h-[250px] overflow-y-auto px-1 py-1">
              {options.length === 0 ? (
                <p className="p-2 text-xs italic text-[var(--color-text-muted)]">No options available</p>
              ) : (
                options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[11px] font-medium transition-colors hover:bg-white/5 group"
                  >
                    <span
                      className={
                        selected.includes(opt.value) ? 'text-[var(--color-brand-primary)] font-bold' : 'text-[var(--color-text-main)]'
                      }
                    >
                      {opt.label}
                    </span>
                    {selected.includes(opt.value) && (
                      <Check className="h-4 w-4 text-[var(--color-brand-primary)]" />
                    )}
                  </button>
                ))
              )}
            </div>
            {selected.length > 0 && (
              <div className="mt-1 flex items-center justify-center border-t border-white/10 px-2 pt-2 pb-1">
                <button
                  onClick={() => onChange([])}
                  className="text-[9px] font-bold text-[var(--color-brand-primary)] uppercase tracking-widest hover:brightness-125 transition-all"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface Filters {
  cuisines: string[];
  prices: string[];
  neighborhoods: string[];
}

interface FilterControlsProps {
  recommendations: Recommendation[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  recommendations,
  filters,
  onFilterChange,
}) => {
  const cuisines = Array.from(
    new Set(recommendations.map((r) => r.cuisine).filter((c): c is string => !!c))
  );
  const prices = Array.from(
    new Set(recommendations.map((r) => r.price_level).filter((p): p is string => !!p))
  );
  const neighborhoods = Array.from(
    new Set(recommendations.map((r) => r.neighborhood).filter((n): n is string => !!n))
  );

  const hasActiveFilters = filters.cuisines.length > 0 || filters.prices.length > 0 || filters.neighborhoods.length > 0;

  return (
    <div className="flex flex-col gap-4 p-5 glass-card mb-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-[var(--color-text-main)]">
          <Filter className="w-4 h-4 text-[var(--color-brand-primary)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Refine Collection</span>
        </div>
        {hasActiveFilters && (
          <button 
            onClick={() => onFilterChange({ cuisines: [], prices: [], neighborhoods: [] })}
            className="text-[9px] font-bold text-[var(--color-brand-primary)] uppercase tracking-widest hover:brightness-125 transition-all"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <MultiSelect
          label="Cuisine"
          icon={<Filter className="h-3.5 w-3.5" />}
          options={cuisines.map((c) => ({ label: c, value: c }))}
          selected={filters.cuisines}
          onChange={(val) => onFilterChange({ ...filters, cuisines: val })}
        />
        <MultiSelect
          label="Budget"
          icon={<Filter className="h-3.5 w-3.5" />}
          options={prices.map((p) => ({ label: p, value: p }))}
          selected={filters.prices}
          onChange={(val) => onFilterChange({ ...filters, prices: val })}
        />
        <MultiSelect
          label="Neighborhood"
          icon={<Filter className="h-3.5 w-3.5" />}
          options={neighborhoods.map((n) => ({ label: n, value: n }))}
          selected={filters.neighborhoods}
          onChange={(val) => onFilterChange({ ...filters, neighborhoods: val })}
          align="right"
        />
      </div>
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-1">
          {filters.cuisines.map((val) => (
            <FilterChip 
              key={`c-${val}`} 
              label={val} 
              onRemove={() => onFilterChange({ ...filters, cuisines: filters.cuisines.filter(c => c !== val) })} 
            />
          ))}
          {filters.prices.map((val) => (
            <FilterChip 
              key={`p-${val}`} 
              label={val} 
              onRemove={() => onFilterChange({ ...filters, prices: filters.prices.filter(p => p !== val) })} 
            />
          ))}
          {filters.neighborhoods.map((val) => (
            <FilterChip 
              key={`n-${val}`} 
              label={val} 
              onRemove={() => onFilterChange({ ...filters, neighborhoods: filters.neighborhoods.filter(n => n !== val) })} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold text-[var(--color-text-main)]">
    {label}
    <button onClick={onRemove} className="text-[var(--color-text-muted)] hover:text-white transition-colors">
      <X className="h-3 w-3" />
    </button>
  </span>
);
