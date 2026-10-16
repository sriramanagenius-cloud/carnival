import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Globe,
  Search,
  Code,
  Play,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface InteractiveBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetUrl: string;
  projectId: string;
  projectName: string;
}

export const InteractiveBrowserModal: React.FC<InteractiveBrowserModalProps> = ({
  isOpen,
  onClose,
  widgetUrl,
  projectId,
  projectName,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'google' | 'widget' | 'html'>('google');
  const [addressBar, setAddressBar] = useState(widgetUrl);
  const [searchQuery, setSearchQuery] = useState(`${projectName} sustainability research`);
  const [htmlCode, setHtmlCode] = useState(
    `<div style="font-family: sans-serif; background: #070d18; color: #38bdf8; padding: 24px; border-radius: 16px; border: 1px solid #0284c7;">\n  <h2 style="margin: 0 0 10px 0; color: #34d399;">🌱 ${projectName} — Live HTML Embed</h2>\n  <p style="color: #94a3b8; font-size: 14px;">Running custom student HTML code inside the embedded widget browser.</p>\n  <div style="display: flex; gap: 12px; margin-top: 16px;">\n    <div style="background: #0f172a; padding: 12px 16px; border-radius: 12px; border: 1px solid #334155;">\n      <span style="font-size: 11px; color: #64748b; display: block;">Energy Offset</span>\n      <strong style="font-size: 20px; color: #f8fafc;">98.4%</strong>\n    </div>\n    <div style="background: #0f172a; padding: 12px 16px; border-radius: 12px; border: 1px solid #334155;">\n      <span style="font-size: 11px; color: #64748b; display: block;">Carbon Captured</span>\n      <strong style="font-size: 20px; color: #34d399;">42 kg CO₂</strong>\n    </div>\n  </div>\n</div>`
  );
  const [renderedHtml, setRenderedHtml] = useState(htmlCode);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  useEffect(() => {
    setAddressBar(widgetUrl);
  }, [widgetUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(widgetUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressBar.includes('google')) {
      setActiveTab('google');
    } else if (addressBar.includes('widget') || addressBar.includes('http')) {
      setActiveTab('widget');
    }
  };

  const handleGoogleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchSubmitted(true);
      setAddressBar(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleRunHtml = () => {
    setRenderedHtml(htmlCode);
    setActiveTab('html');
    setAddressBar(`data:text/html;base64,${btoa(unescape(encodeURIComponent(htmlCode)))}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div
        className={`relative w-full ${
          isBrowserFullscreen ? 'max-w-none h-full m-0 rounded-none' : 'max-w-5xl h-[88vh] rounded-2xl'
        } bg-[#0c1424] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col transition-all`}
      >
        {/* Browser Chrome Title Bar */}
        <div className="px-4 py-2.5 bg-[#080d1a] border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-xs font-mono text-slate-400 truncate max-w-xs sm:max-w-md">
              Sustainability Live Browser — {projectName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBrowserFullscreen(!isBrowserFullscreen)}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              title={isBrowserFullscreen ? 'Exit Fullscreen' : 'Fullscreen Browser'}
            >
              {isBrowserFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              title="Close Browser"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Address Bar & Controls */}
        <div className="px-4 py-2 bg-[#0a1120] border-b border-slate-800 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setActiveTab('widget')}
              className="p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('google')}
              className="p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="Forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (activeTab === 'html') handleRunHtml();
              }}
              className="p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="Reload"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form address bar */}
          <form onSubmit={handleAddressSubmit} className="flex-1 min-w-[200px] flex items-center">
            <div className="relative w-full flex items-center">
              <span className="absolute left-2.5 text-cyan-400">
                <Shield className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={addressBar}
                onChange={(e) => setAddressBar(e.target.value)}
                className="w-full bg-[#060a14] border border-slate-700 focus:border-cyan-400 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-cyan-200 focus:outline-none"
              />
            </div>
          </form>

          {/* Quick Browser Mode Tabs */}
          <div className="flex items-center gap-1 bg-[#060a14] border border-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('google');
                setAddressBar('https://www.google.com');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'google'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Google View</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('widget');
                setAddressBar(widgetUrl);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'widget'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Widget Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('html')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'html'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Paste HTML</span>
            </button>
          </div>

          {/* Real Tab Launcher */}
          <a
            href={widgetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Open in New Tab</span>
          </a>
        </div>

        {/* Browser Content Area */}
        <div className="flex-1 bg-[#070c18] overflow-y-auto relative p-4 sm:p-6">
          {/* TAB 1: GOOGLE SEARCH BROWSER VIEW */}
          {activeTab === 'google' && (
            <div className="max-w-2xl mx-auto py-8 sm:py-12 text-center space-y-6 animate-in fade-in">
              {/* Google Brand Logo */}
              <div className="flex items-center justify-center gap-1 select-none">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#4285F4]">G</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-[#EA4335]">o</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-[#FBBC05]">o</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-[#4285F4]">g</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-[#34A853]">l</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-[#EA4335]">e</span>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleGoogleSearch} className="relative max-w-lg mx-auto">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Google for sustainability data, research, or URL..."
                  className="w-full bg-[#0c1424] border border-slate-700 focus:border-cyan-400 rounded-full pl-12 pr-28 py-3 text-sm text-white placeholder-slate-500 shadow-lg focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-full transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Quick Sustainability Search Queries */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {[
                  `${projectName} live telemetry`,
                  'UN SDG 13 Climate Action projects',
                  'ESP32 IoT sensor sustainability',
                  'Carbon dioxide indoor ventilation standards',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      setSearchSubmitted(true);
                      setAddressBar(`https://www.google.com/search?q=${encodeURIComponent(tag)}`);
                    }}
                    className="px-3 py-1 text-xs rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors"
                  >
                    🔍 {tag}
                  </button>
                ))}
              </div>

              {/* Simulated Google Search Results */}
              {searchSubmitted && (
                <div className="mt-8 text-left bg-[#0c1424] border border-slate-800 rounded-2xl p-6 space-y-5 animate-in fade-in">
                  <div className="text-xs font-mono text-slate-500">
                    About 4,200,000 results (0.34 seconds)
                  </div>

                  {/* Result 1: The Copied Widget Link */}
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-cyan-400 truncate">{widgetUrl}</div>
                    <a
                      href={widgetUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab('widget');
                        setAddressBar(widgetUrl);
                      }}
                      className="text-base font-semibold text-sky-400 hover:underline block"
                    >
                      {projectName} — Sustainability Live Exhibition Node #{projectId}
                    </a>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Official verified sustainability project running live on the Innovation Command Center. View real-time temperature, humidity, CO₂ levels, and air quality telemetry.
                    </p>
                  </div>

                  {/* Result 2: Climate & Sustainability Reference */}
                  <div className="space-y-1 pt-3 border-t border-slate-800/80">
                    <div className="text-xs font-mono text-slate-400">https://sustainability.google/commitments</div>
                    <div className="text-base font-semibold text-sky-400">
                      Google 24/7 Carbon-Free Energy & Environmental Impact
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Learn how real-time microgrids, high-efficiency sensor feedback, and renewable telemetry accelerate net-zero carbon operations worldwide.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE WIDGET PREVIEW */}
          {activeTab === 'widget' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-3xl bg-[#0b1222] border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                      Live Widget Running Inside Browser
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{widgetUrl}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">{projectName}</h3>
                  <p className="text-xs text-slate-400">
                    This widget is actively accessible and runnable across all browsers via its permanent URL.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <a
                    href={widgetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Full Browser Window</span>
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl border border-slate-700 transition-colors"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedUrl ? 'Copied URL!' : 'Copy Link Again'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PASTE HTML TO RUN */}
          {activeTab === 'html' && (
            <div className="h-full flex flex-col lg:flex-row gap-4">
              {/* HTML Editor Input */}
              <div className="flex-1 flex flex-col bg-[#0c1424] border border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span>Paste HTML / Code to Run</span>
                  </div>
                  <button
                    onClick={handleRunHtml}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-md"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Live HTML</span>
                  </button>
                </div>
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="Paste your custom student HTML, SVG, or embed code here..."
                  className="flex-1 w-full bg-[#070b14] border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none resize-none min-h-[160px]"
                />
              </div>

              {/* Live Render Output */}
              <div className="flex-1 flex flex-col bg-[#0c1424] border border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Live Output Runner</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Sandboxed Execution</span>
                </div>
                <div className="flex-1 bg-[#070b14] border border-slate-800/80 rounded-xl p-4 overflow-auto min-h-[160px]">
                  <iframe
                    title="Live HTML Sandbox"
                    srcDoc={renderedHtml}
                    sandbox="allow-scripts"
                    className="w-full h-full border-0 min-h-[220px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-4 py-2.5 bg-[#080d1a] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>URL:</span>
            <code className="text-cyan-300 truncate max-w-sm sm:max-w-md">{widgetUrl}</code>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              {copiedUrl ? 'Copied' : 'Copy URL'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
