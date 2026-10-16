import React, { useState, useEffect } from 'react';
import { FilterOptions, ProjectCategory } from '../types.ts';
import {
  Clock,
  Calendar,
  Search,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface HeaderProps {
  totalActive: number;
  totalConfigured: number;
  projectCount: number;
  onProjectCountChange: (count: number) => void;
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isCompactMode: boolean;
  onToggleCompactMode: () => void;
  onOpenImageManager?: () => void;
}

const CATEGORIES: ProjectCategory[] = [
  'All',
  'Urban Farming',
  'Clean Energy',
  'Air & Climate',
  'Waste & Circular',
  'Water Systems',
  'Biodiversity',
  'Smart Campus',
];

const PRESET_COUNTS = [10, 15, 20, 25, 30, 35, 40, 45, 50];

export const Header: React.FC<HeaderProps> = ({
  totalActive,
  totalConfigured,
  projectCount,
  onProjectCountChange,
  filters,
  onFilterChange,
  isFullscreen,
  onToggleFullscreen,
  isCompactMode,
  onToggleCompactMode,
  onOpenImageManager,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHoursMins = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <header className="border-b border-slate-800/90 bg-[#060a14]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Top Dominant Dashboard Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Top Left: Clean Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                  SUSTAINABILITY LIVE
                </h1>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  COMMAND CENTER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Innovation Exhibition Live Widgets Wall
              </p>
            </div>
          </div>

          {/* Top Center: BIG PROMINENT RUNNING LIVE CLOCK & DATE */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 bg-[#0a1120] border border-cyan-500/30 rounded-2xl px-6 py-2.5 shadow-xl shadow-cyan-950/40">
            <div className="flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-emerald-400 animate-pulse" />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-extrabold tracking-widest text-emerald-300 tabular-nums">
                {formatHoursMins(currentTime)}
              </span>
            </div>
            <span className="hidden sm:inline text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-300">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{formatDate(currentTime)}</span>
            </div>
          </div>

          {/* Top Corner: WIDGET COUNT CONTROLLER (10-50) */}
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            
            {/* Widget Count Selector */}
            <div className="flex items-center gap-1.5 bg-[#0a1120] border border-slate-700 p-1 rounded-xl shadow-inner">
              <span className="text-xs font-bold text-slate-300 px-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Widgets:</span>
              </span>
              <div className="flex items-center gap-1">
                {PRESET_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => onProjectCountChange(cnt)}
                    className={`px-2 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                      projectCount === cnt
                        ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20 scale-105'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Images Button */}
            {onOpenImageManager && (
              <button
                onClick={onOpenImageManager}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold transition-colors"
                title="Upload & Manage Images"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Images</span>
              </button>
            )}

            {/* Density toggle */}
            <button
              onClick={onToggleCompactMode}
              className={`p-2 rounded-xl border transition-colors ${
                isCompactMode
                  ? 'bg-slate-800 border-cyan-400 text-cyan-300'
                  : 'bg-[#0a1120] border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Compact View"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors"
              title="Fullscreen Exhibition Display"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* Secondary Category Bar: PURE TEXT ONLY — STRICTLY NO ICONS */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Categories: STRICTLY NO ICONS AS REQUESTED */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onFilterChange({ category: cat })}
                className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  filters.category === cat
                    ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search widget..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full bg-[#0a1120] border border-slate-800 focus:border-cyan-400 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

        </div>

      </div>
    </header>
  );
};
