import React, { useRef, useEffect } from 'react';
import { X, Copy, ExternalLink, Link2, Check } from 'lucide-react';

interface CopyFallbackModalProps {
  url: string | null;
  onClose: () => void;
  projectName?: string;
}

export const CopyFallbackModal: React.FC<CopyFallbackModalProps> = ({
  url,
  onClose,
  projectName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedManual, setCopiedManual] = React.useState(false);

  useEffect(() => {
    if (url && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [url]);

  if (!url) return null;

  const handleManualCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      try {
        document.execCommand('copy');
        setCopiedManual(true);
        setTimeout(() => setCopiedManual(false), 2000);
      } catch (e) {
        console.error('Manual copy failed:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0c1424] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Share Project Widget</h3>
              {projectName && (
                <p className="text-xs text-slate-400 truncate max-w-xs">{projectName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Your browser requires manual copying. Click below to copy or open this permanent widget link:
        </p>

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={url}
            onClick={(e) => e.currentTarget.select()}
            className="w-full bg-[#080e1b] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none select-all"
          />
          <button
            onClick={handleManualCopy}
            className="px-3 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedManual ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedManual ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in New Tab</span>
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
