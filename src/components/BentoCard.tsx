import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types.ts';
import {
  ExternalLink,
  Link2,
  Check,
  Terminal,
  PlusCircle,
  Search,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface BentoCardProps {
  project: Project;
  onViewWidget: (projectId: string) => void;
  onCopyLink: (projectId: string, projectName: string) => void;
  isCompactView?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  project,
  onViewWidget,
  onCopyLink,
  isCompactView = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [widgetSearchInput, setWidgetSearchInput] = useState('');
  const [htmlViewMode, setHtmlViewMode] = useState<'fit' | 'scroll'>('fit');
  const [containerWidth, setContainerWidth] = useState(400);
  const htmlContainerRef = useRef<HTMLDivElement>(null);
  const widgetUrl = `/widget/${project.id}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCopyLink(project.id, project.customHeading || project.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWidgetGoogleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const query = widgetSearchInput.trim() || 'sustainability innovation';
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Measure card container width to compute scale factor for HTML "fit" mode
  useEffect(() => {
    if (htmlContainerRef.current) {
      const updateWidth = () => {
        if (htmlContainerRef.current) {
          setContainerWidth(htmlContainerRef.current.offsetWidth);
        }
      };
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [project.contentType]);

  const hasContent = project.contentType !== 'empty' && project.contentData.trim() !== '';

  // Calculate scale for rich HTML desktop layouts (e.g. 1200px desktop canvas)
  const virtualCanvasWidth = 1200;
  const scaleFactor = Math.max(0.25, Math.min(0.65, containerWidth / virtualCanvasWidth));

  return (
    <article
      className={`relative group flex flex-col justify-between rounded-2xl bg-[#0a1120] border border-slate-800/90 hover:border-cyan-500/50 transition-all duration-300 p-4 sm:p-5 shadow-lg ${
        project.contentType === 'html' ? 'col-span-1 md:col-span-2' : ''
      }`}
    >
      <div>
        {/* Top Header: Strictly NO icons on Urban Farming / Clean Energy */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="min-w-0">
            {/* Category text strictly without icons */}
            <span className="text-[11px] font-mono font-medium text-cyan-400 block tracking-wide uppercase">
              {project.category}
            </span>
            <a
              href={widgetUrl}
              onClick={(e) => {
                e.preventDefault();
                onViewWidget(project.id);
              }}
              className="text-base font-bold text-white hover:text-cyan-300 transition-colors truncate block mt-0.5"
            >
              {project.name}
              {project.customHeading && (
                <span className="text-slate-300 font-normal text-xs ml-1.5">
                  — {project.customHeading}
                </span>
              )}
            </a>
          </div>

          {/* Type Badge & Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {project.contentType === 'html' ? (
              <>
                <button
                  onClick={() => setHtmlViewMode(htmlViewMode === 'fit' ? 'scroll' : 'fit')}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                  title={htmlViewMode === 'fit' ? 'Switch to Interactive Scroll' : 'Switch to Fit Overview'}
                >
                  {htmlViewMode === 'fit' ? '🔍 Fit Overview' : '📜 Scroll View'}
                </button>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/40">
                  HTML LIVE
                </span>
              </>
            ) : project.contentType === 'python' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                PYTHON RUN
              </span>
            ) : project.contentType === 'link' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                GOOGLE BROWSER
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800">
                EMPTY SLOT
              </span>
            )}
          </div>
        </div>

        {/* Content Body: Displays FULL HTML, Google browser, or Python output */}
        <div
          ref={htmlContainerRef}
          className={`bg-[#060a14] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-center ${
            project.contentType === 'html' ? 'h-[440px] sm:h-[480px]' : 'min-h-[170px]'
          }`}
        >
          {!hasContent ? (
            /* 1. EMPTY WIDGET: clean initial placeholder */
            <div
              onClick={() => onViewWidget(project.id)}
              className="p-5 text-center cursor-pointer hover:bg-slate-900/40 transition-colors flex flex-col items-center justify-center space-y-2 h-48"
            >
              <PlusCircle className="w-8 h-8 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              <div className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                Empty Widget Slot
              </div>
              <p className="text-[11px] text-slate-500 max-w-[220px]">
                Click Open Widget to paste HTML, upload images, paste Python, or set Google Browser
              </p>
            </div>
          ) : project.contentType === 'html' ? (
            /* 2. FULL LIVE HTML: Entire document visible without partial cutoffs */
            <div className="w-full h-full relative overflow-hidden bg-[#030b1a]">
              {htmlViewMode === 'fit' ? (
                /* FIT MODE: Proportionally scales entire 1200px HTML canvas so header + all grid cards fit cleanly */
                <div
                  style={{
                    width: `${virtualCanvasWidth}px`,
                    height: `${480 / scaleFactor}px`,
                    transform: `scale(${scaleFactor})`,
                    transformOrigin: 'top left',
                  }}
                  className="pointer-events-auto"
                >
                  <iframe
                    title={`Widget ${project.id} HTML`}
                    srcDoc={project.contentData}
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full border-0 bg-transparent"
                  />
                </div>
              ) : (
                /* SCROLL MODE: 100% natural interactive resolution with smooth scrolling */
                <div className="w-full h-full overflow-auto">
                  <iframe
                    title={`Widget ${project.id} HTML Interactive`}
                    srcDoc={project.contentData}
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full min-h-[600px] border-0 bg-transparent"
                  />
                </div>
              )}
            </div>
          ) : project.contentType === 'python' ? (
            /* 3. LIVE PYTHON TERMINAL OUTPUT */
            <div className="p-3 font-mono text-xs text-emerald-300 overflow-y-auto h-48 space-y-1.5 bg-black/70">
              <div className="text-[10px] text-slate-500 flex items-center justify-between border-b border-slate-800/80 pb-1">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  <span>python3 {project.id}.py</span>
                </span>
                <span className="text-emerald-500">● executed</span>
              </div>
              <pre className="text-[11px] text-emerald-400 whitespace-pre-wrap leading-tight pt-1">
                {project.pythonOutput || '(Script output loaded successfully)'}
              </pre>
            </div>
          ) : (
            /* 4. GOOGLE BROWSER VISIBLE IN WIDGET */
            <div className="flex flex-col justify-between h-48 bg-[#080d1a] p-2.5">
              {/* Mini Browser Top Bar */}
              <div className="flex items-center justify-between bg-[#060a14] px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-cyan-300 truncate max-w-[140px] ml-1">
                    {project.contentData || 'https://www.google.com'}
                  </span>
                </div>
                <a
                  href={project.contentData.startsWith('http') ? project.contentData : `https://${project.contentData}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-white"
                  title="Open in external browser window"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Google View Inside Widget */}
              <div className="flex-1 flex flex-col items-center justify-center px-2 py-1 text-center">
                <div className="flex items-center justify-center font-bold text-xl tracking-tight mb-2 select-none">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </div>

                <form
                  onSubmit={handleWidgetGoogleSearch}
                  className="w-full relative flex items-center mb-1.5"
                >
                  <Search className="w-3 h-3 text-slate-500 absolute left-2.5" />
                  <input
                    type="text"
                    value={widgetSearchInput}
                    onChange={(e) => setWidgetSearchInput(e.target.value)}
                    placeholder="Search Google..."
                    className="w-full bg-[#060a14] border border-slate-700 focus:border-cyan-400 rounded-full pl-7 pr-14 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 px-2 py-0.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[10px] rounded-full transition-colors"
                  >
                    Search
                  </button>
                </form>

                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                  Google browser active inside widget
                </p>
              </div>

              <a
                href={project.contentData.startsWith('http') ? project.contentData : `https://${project.contentData}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-[10px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Launch in Browser Window</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer: Open Widget & Copy Link */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <a
          href={widgetUrl}
          onClick={(e) => {
            e.preventDefault();
            onViewWidget(project.id);
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
        >
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          <span>Open Widget</span>
        </a>

        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700/50"
          title={`Copy link for ${project.id}`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">Copy Link</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
