import React, { useState } from 'react';
import { Project, WidgetContentType } from '../types.ts';
import {
  X,
  Check,
  Link2,
  Globe,
  Code,
  Terminal,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react';

interface CopyActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  widgetUrl: string;
  onSelectOption: (
    contentType: WidgetContentType,
    contentData: string,
    customHeading?: string
  ) => void;
  onOpenInNewBrowser: (url: string) => void;
}

export const CopyActionModal: React.FC<CopyActionModalProps> = ({
  isOpen,
  onClose,
  project,
  widgetUrl,
  onSelectOption,
  onOpenInNewBrowser,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(true);
  const [googleQuery, setGoogleQuery] = useState('sustainability innovation exhibition');

  const handleCopyAgain = () => {
    navigator.clipboard.writeText(widgetUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSetGoogle = (openInWindow = false) => {
    const googleUrl = googleQuery.trim()
      ? `https://www.google.com/search?q=${encodeURIComponent(googleQuery.trim())}`
      : 'https://www.google.com';
    
    // Set widget to display Google browser inside
    onSelectOption('link', googleUrl, project.customHeading || `${project.name} Google Search`);

    // If requested or as primary action, open another browser window with Google
    if (openInWindow) {
      window.open(googleUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  const handleSetHtml = () => {
    onSelectOption('html', '', project.customHeading);
    onClose();
  };

  const handleSetPython = () => {
    onSelectOption('python', '', project.customHeading);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#0c1424] border border-cyan-500/50 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Widget Link Copied!
              </h3>
              <p className="text-xs text-slate-400">
                {project.name} {project.customHeading ? `— ${project.customHeading}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Copied URL Box */}
        <div className="bg-[#060a14] border border-slate-800 rounded-xl p-3 mb-5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-mono text-xs text-cyan-300 truncate">
              {widgetUrl}
            </span>
          </div>
          <button
            onClick={handleCopyAgain}
            className="shrink-0 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            {copied ? 'Copied ✓' : 'Copy Again'}
          </button>
        </div>

        {/* Action Prompt */}
        <div className="mb-4">
          <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider mb-1">
            Choose what to open & run inside this widget:
          </h4>
          <p className="text-xs text-slate-400">
            Open another browser with Google, show Google inside this widget, or paste HTML/Python code.
          </p>
        </div>

        {/* Options Grid */}
        <div className="space-y-3">
          
          {/* OPTION 1: GOOGLE BROWSER (User's primary requirement) */}
          <div className="p-3.5 bg-[#080f1e] border border-cyan-500/40 hover:border-cyan-400 rounded-xl transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {/* Mini Google Logo */}
                <div className="flex items-center font-bold text-sm tracking-tight">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </div>
                <span className="text-xs font-bold text-white">Browser inside Widget</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Recommended
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-2.5">
              Opens Google in another browser window and embeds Google search directly inside this widget.
            </p>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={googleQuery}
                  onChange={(e) => setGoogleQuery(e.target.value)}
                  placeholder="Search Google query..."
                  className="w-full bg-[#060a14] border border-slate-700 focus:border-cyan-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleSetGoogle(true)}
                className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Google & Set</span>
              </button>
            </div>
          </div>

          {/* OPTION 2: PASTE HTML CODE */}
          <button
            onClick={handleSetHtml}
            className="w-full text-left p-3.5 bg-[#080f1e] hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">
                  Paste HTML File / Code
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Run custom HTML, CSS, or JS directly inside the widget
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-400 font-mono">
              Paste HTML →
            </span>
          </button>

          {/* OPTION 3: PASTE PYTHON SCRIPT */}
          <button
            onClick={handleSetPython}
            className="w-full text-left p-3.5 bg-[#080f1e] hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-emerald-300 transition-colors">
                  Paste Python Script
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Execute Python code and display terminal output in widget
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 font-mono">
              Paste Python →
            </span>
          </button>

          {/* OPTION 4: OPEN IN ANOTHER BROWSER TAB */}
          <button
            onClick={() => onOpenInNewBrowser(widgetUrl)}
            className="w-full text-left p-3 bg-[#060a14] hover:bg-slate-900/60 border border-slate-800 rounded-xl transition-colors flex items-center justify-between text-xs text-slate-300 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Launch widget page in new browser window</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">_blank</span>
          </button>

        </div>

      </div>
    </div>
  );
};
