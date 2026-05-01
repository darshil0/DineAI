import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FilterOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  icon: React.ReactNode;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  colorClass: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, icon, options, selected, onChange, colorClass }) => {
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
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
          selected.length > 0 
            ? `${colorClass} border-transparent shadow-sm` 
            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
        }`}
      >
        {icon}
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20 text-[10px]">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-20 mt-2 min-w-[200px] bg-white rounded-xl shadow-xl border border-stone-100 p-2 overflow-hidden"
          >
            <div className="max-h-[250px] overflow-y-auto px-1 py-1">
              {options.length === 0 ? (
                <p className="p-2 text-xs text-stone-400 italic">No options available</p>
              ) : (
                options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-stone-50 transition-colors group"
                  >
                    <span className={selected.includes(opt.value) ? 'font-semibold text-stone-900' : 'text-stone-600'}>
                      {opt.label}
                    </span>
                    {selected.includes(opt.value) && (
                      <Check className="w-3.5 h-3.5 text-stone-900" />
                    )}
                  </button>
                ))
              )}
            </div>
            {selected.length > 0 && (
              <div className="mt-1 pt-2 border-t border-stone-50 px-2 flex justify-between items-center">
                 <button 
                  onClick={() => onChange([])}
                  className="text-[10px] font-bold text-stone-400 hover:text-stone-600 uppercase"
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

interface FilterControlsProps {
  recommendations: any[];
  filters: {
    cuisines: string[];
    prices: string[];
    neighborhoods: string[];
  };
  onFilterChange: (filters: {
    cuisines: string[];
    prices: string[];
    neighborhoods: string[];
  }) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ 
  recommendations, 
  filters, 
  onFilterChange 
}) => {
  const cuisines = Array.from(new Set(recommendations.map(r => r.cuisine).filter(Boolean))) as string[];
  const prices = Array.from(new Set(recommendations.map(r => r.price_level).filter(Boolean))) as string[];
  const neighborhoods = Array.from(new Set(recommendations.map(r => r.neighborhood).filter(Boolean))) as string[];

  const hasActiveFilters = filters.cuisines.length > 0 || filters.prices.length > 0 || filters.neighborhoods.length > 0;

  return (
    <div className="flex flex-col gap-3 p-4 bg-stone-100/50 rounded-2xl border border-stone-200/50 mb-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-stone-900">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Advanced Filtering</span>
        </div>
        {hasActiveFilters && (
          <button 
            onClick={() => onFilterChange({ cuisines: [], prices: [], neighborhoods: [] })}
            className="text-[10px] font-bold text-orange-600 uppercase hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <MultiSelect 
          label="Cuisine"
          icon={<Filter className="w-3 h-3" />}
          options={cuisines.map(c => ({ label: c, value: c }))}
          selected={filters.cuisines}
          onChange={(val) => onFilterChange({ ...filters, cuisines: val })}
          colorClass="bg-orange-500 text-white"
        />
        <MultiSelect 
          label="Price"
          icon={<Filter className="w-3 h-3" />}
          options={prices.map(p => ({ label: p, value: p }))}
          selected={filters.prices}
          onChange={(val) => onFilterChange({ ...filters, prices: val })}
          colorClass="bg-emerald-500 text-white"
        />
        <MultiSelect 
          label="Neighborhood"
          icon={<Filter className="w-3 h-3" />}
          options={neighborhoods.map(n => ({ label: n, value: n }))}
          selected={filters.neighborhoods}
          onChange={(val) => onFilterChange({ ...filters, neighborhoods: val })}
          colorClass="bg-blue-500 text-white"
        />
      </div>
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-1">
          {[...filters.cuisines, ...filters.prices, ...filters.neighborhoods].map(active => (
            <span key={active} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-[10px] text-stone-500">
              {active}
              <button 
                onClick={() => {
                  const newC = filters.cuisines.filter(c => c !== active);
                  const newP = filters.prices.filter(p => p !== active);
                  const newN = filters.neighborhoods.filter(n => n !== active);
                  onFilterChange({ cuisines: newC, prices: newP, neighborhoods: newN });
                }}
                className="hover:text-stone-800"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
