import React, { useState, useEffect } from 'react';
import { Project, WidgetContentType } from '../types.ts';
import { ImageManagerModal } from './ImageManagerModal.tsx';
import {
  X,
  Globe,
  Code,
  Terminal,
  Play,
  Save,
  Upload,
  Check,
  Search,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';

interface SimpleWidgetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  initialTab?: WidgetContentType;
  onSave: (
    projectId: string,
    contentType: WidgetContentType,
    contentData: string,
    customHeading?: string,
    pythonOutput?: string
  ) => Promise<void>;
}

export const SimpleWidgetEditorModal: React.FC<SimpleWidgetEditorModalProps> = ({
  isOpen,
  onClose,
  project,
  initialTab,
  onSave,
}) => {
  if (!isOpen) return null;

  const [customHeading, setCustomHeading] = useState(project.customHeading || '');
  const [contentType, setContentType] = useState<WidgetContentType>(
    initialTab || (project.contentType === 'empty' ? 'link' : project.contentType)
  );
  const [contentData, setContentData] = useState(
    project.contentData || (initialTab === 'link' || project.contentType === 'empty' ? 'https://www.google.com' : '')
  );
  const [pythonOutput, setPythonOutput] = useState(project.pythonOutput || '');
  const [isRunning, setIsRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync state if project changes
  useEffect(() => {
    setCustomHeading(project.customHeading || '');
    const defaultType = initialTab || (project.contentType === 'empty' ? 'link' : project.contentType);
    setContentType(defaultType);
    if (defaultType === 'link' && (!project.contentData || project.contentData.trim() === '')) {
      setContentData('https://www.google.com');
    } else {
      setContentData(project.contentData || '');
    }
    setPythonOutput(project.pythonOutput || '');
  }, [project, initialTab]);

  // Run Python code on backend
  const handleRunPython = async () => {
    if (!contentData.trim()) return;
    setIsRunning(true);
    setPythonOutput('Running Python script...');
    try {
      const res = await fetch('/api/run-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: contentData }),
      });
      const data = await res.json();
      setPythonOutput(data.output || '(No output produced)');
    } catch (err: any) {
      setPythonOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Upload .html or .py file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setContentData(reader.result);
          if (file.name.endsWith('.py')) {
            setContentType('python');
          } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
            setContentType('html');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setStatusMessage('Saving widget...');
    try {
      await onSave(
        project.id,
        contentType,
        contentData,
        customHeading.trim(),
        pythonOutput
      );
      setStatusMessage('Saved successfully!');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 500);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c1424] border border-cyan-500/50 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 block uppercase tracking-wider">
              {project.category}
            </span>
            <h3 className="text-lg font-black text-white">
              {project.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* Custom Heading Input (User's request: "அதொட ஹெட்டிங்லாம் நான் கொடுத்துப்பேன் ஓகேவா?") */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Heading / Title (Optional)
            </label>
            <input
              type="text"
              value={customHeading}
              onChange={(e) => setCustomHeading(e.target.value)}
              placeholder="e.g. Solar Telemetry Unit, Google Search, Hydroponics Sensor"
              className="w-full bg-[#060a14] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* 3 Content Tabs (Google/Browser, HTML, Python) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select What to Run & Display:
            </label>
            <div className="grid grid-cols-3 gap-2">
              
              <button
                type="button"
                onClick={() => {
                  setContentType('link');
                  if (!contentData || contentData.trim() === '') {
                    setContentData('https://www.google.com');
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  contentType === 'link'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                    : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google / Web</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setContentType('html');
                  if (!contentData || contentData.startsWith('http')) {
                    setContentData(
                      `<div style="padding: 16px; background: #060a14; color: #38bdf8; font-family: sans-serif; text-align: center; border-radius: 12px; border: 1px solid #0284c7;">\n  <h2 style="color: #34d399; margin: 0 0 8px 0;">🌱 ${customHeading || project.name}</h2>\n  <p style="color: #94a3b8; font-size: 13px; margin: 0;">Running Live HTML inside widget</p>\n</div>`
                    );
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  contentType === 'html'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                    : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-amber-400" />
                <span>Paste HTML</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setContentType('python');
                  if (!contentData || contentData.startsWith('http') || contentData.includes('<div')) {
                    setContentData(
                      `# Sustainability Sensor Analysis\nprint("Executing ${customHeading || project.name} Python Script...")\nimport math\nenergy = 98.4\ncarbon_saved = 42.5\nprint(f"Energy Efficiency: {energy}%")\nprint(f"Carbon Saved: {carbon_saved} kg CO2")\nprint("Status: Nominal and active")`
                    );
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  contentType === 'python'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                    : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Paste Python</span>
              </button>

            </div>
          </div>

          {/* TAB 1: GOOGLE / BROWSER CONFIGURATION */}
          {contentType === 'link' && (
            <div className="bg-[#060a14] border border-cyan-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <div className="flex items-center font-bold text-xs tracking-tight">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </div>
                  <span>Browser inside Widget</span>
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setContentData('https://www.google.com')}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-colors"
                  >
                    Set Google Home
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentData('https://www.google.com/search?q=sustainability+innovation')}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-colors"
                  >
                    Google Search
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Target Browser URL / Search Link:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={contentData}
                    onChange={(e) => setContentData(e.target.value)}
                    placeholder="https://www.google.com or search URL"
                    className="flex-1 bg-[#0c1424] border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-200 focus:outline-none"
                  />
                  <a
                    href={contentData.startsWith('http') ? contentData : `https://${contentData}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 transition-colors"
                    title="Open in real browser"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="border border-slate-800 rounded-xl p-3 bg-[#080d1a] text-center">
                <p className="text-[11px] text-slate-400 mb-2">
                  This widget will display an embedded Google browser with search and direct launch inside the card!
                </p>
                <div className="inline-flex items-center gap-1 font-bold text-lg">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE HTML CODE / UPLOAD */}
          {contentType === 'html' && (
            <div className="bg-[#060a14] border border-amber-500/30 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  <span>Paste HTML / CSS / JS Code</span>
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded-lg transition-colors border border-cyan-800"
                  >
                    <span>📷 Upload Images</span>
                  </button>

                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700">
                    <Upload className="w-3 h-3 text-amber-400" />
                    <span>Upload .html</span>
                    <input
                      type="file"
                      accept=".html,.htm"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <textarea
                value={contentData}
                onChange={(e) => setContentData(e.target.value)}
                placeholder="Paste raw HTML code here, e.g. <div><h2>My Project</h2></div>"
                rows={6}
                className="w-full bg-[#0c1424] border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-xs font-mono text-amber-100 placeholder-slate-600 focus:outline-none"
              />

              {/* Instant Live HTML Preview */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  Live Preview:
                </span>
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-black/40 h-28">
                  <iframe
                    title="Live HTML preview"
                    srcDoc={contentData}
                    sandbox="allow-scripts"
                    className="w-full h-full border-0 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PASTE PYTHON SCRIPT / RUN */}
          {contentType === 'python' && (
            <div className="bg-[#060a14] border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Paste Python Script</span>
                </span>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700">
                    <Upload className="w-3 h-3 text-emerald-400" />
                    <span>Upload .py</span>
                    <input
                      type="file"
                      accept=".py"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleRunPython}
                    disabled={isRunning}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isRunning ? 'Running...' : 'Run Script'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={contentData}
                onChange={(e) => setContentData(e.target.value)}
                placeholder="Paste Python script here..."
                rows={5}
                className="w-full bg-[#0c1424] border border-slate-700 focus:border-emerald-400 rounded-xl p-3 text-xs font-mono text-emerald-100 placeholder-slate-600 focus:outline-none"
              />

              {/* Terminal Output */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  Terminal Output (Visible in Widget):
                </span>
                <div className="bg-black/80 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-emerald-300 max-h-24 overflow-y-auto">
                  <pre className="whitespace-pre-wrap leading-tight">
                    {pythonOutput || '(Click "Run Script" to see execution output)'}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono text-cyan-400">
            {statusMessage && <span>{statusMessage}</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save & Display in Widget'}</span>
            </button>
          </div>
        </div>

      </div>

      {isImageModalOpen && (
        <ImageManagerModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onInsertImageIntoHtml={(tag) => {
            setContentData((prev) => `${prev}\n\n${tag}`);
          }}
          projectId={project.id}
        />
      )}
    </div>
  );
};
