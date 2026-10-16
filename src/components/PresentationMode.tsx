import React, { useState, useEffect } from 'react';
import { Project } from '../types.ts';
import { BentoCard } from './BentoCard.tsx';
import {
  Minimize2,
  Clock,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PresentationModeProps {
  projects: Project[];
  onExit: () => void;
  onViewWidget: (id: string) => void;
  onCopyLink: (id: string, name: string) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  projects,
  onExit,
  onViewWidget,
  onCopyLink,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(true);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (!isAutoCycling || totalPages <= 1) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 12000);
    return () => clearInterval(interval);
  }, [isAutoCycling, totalPages]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  const displayedProjects = projects.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#060a14] text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="px-8 py-5 border-b border-slate-800/80 bg-[#080e1c]/90 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
            SUSTAINABILITY LIVE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Exhibition Live Widgets Wall
          </p>
        </div>

        {/* Live Digital Clock & Auto-Cycle Controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-[#0d1629] border border-slate-800 rounded-2xl px-5 py-2.5 shadow-inner">
            <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-xl sm:text-2xl font-mono font-bold tabular-nums text-emerald-300 tracking-wider">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 bg-[#0d1629] border border-slate-800 rounded-2xl p-1.5">
              <button
                onClick={() => setCurrentPage((p) => (p - 1 + totalPages) % totalPages)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2 text-slate-300">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => (p + 1) % totalPages)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAutoCycling(!isAutoCycling)}
                className={`p-2 rounded-xl transition-colors ${
                  isAutoCycling ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-400 hover:text-white'
                }`}
                title={isAutoCycling ? 'Pause Auto-cycle' : 'Start Auto-cycle'}
              >
                {isAutoCycling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          )}

          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayedProjects.map((project) => (
            <BentoCard
              key={project.id}
              project={project}
              onViewWidget={onViewWidget}
              onCopyLink={onCopyLink}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
