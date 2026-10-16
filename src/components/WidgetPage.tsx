import React, { useState, useEffect } from 'react';
import { Project, WidgetContentType } from '../types.ts';
import { ImageManagerModal } from './ImageManagerModal.tsx';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Link2,
  Check,
  Code,
  Globe,
  Terminal,
  Play,
  Save,
  ExternalLink,
  Upload,
  Edit3,
  Search,
  Image as ImageIcon,
  Eye,
  Sliders,
} from 'lucide-react';

interface WidgetPageProps {
  projectId: string;
  onBackToDashboard: () => void;
  onCopyLink: (projectId: string, projectName: string) => void;
}

export const WidgetPage: React.FC<WidgetPageProps> = ({
  projectId,
  onBackToDashboard,
  onCopyLink,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [copied, setCopied] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [customHeading, setCustomHeading] = useState('');
  const [contentType, setContentType] = useState<WidgetContentType>('link');
  const [contentData, setContentData] = useState('https://www.google.com');
  const [pythonOutput, setPythonOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [googleSearchQuery, setGoogleSearchQuery] = useState('');

  // Fetch project data from API
  const fetchProjectData = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        throw new Error(`Project "${projectId}" not found.`);
      }
      const data = await res.json();
      setProject(data.project);
      setCustomHeading(data.project.customHeading || '');
      setContentType(data.project.contentType === 'empty' ? 'link' : data.project.contentType);
      setContentData(
        data.project.contentData ||
          (data.project.contentType === 'empty' ? 'https://www.google.com' : '')
      );
      setPythonOutput(data.project.pythonOutput || '');
      if (data.project.contentType === 'empty') {
        setIsEditing(true);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load project widget.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const handleCopyLink = () => {
    if (project) {
      onCopyLink(project.id, project.customHeading || project.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Run Python on server
  const handleRunPython = async () => {
    setIsExecuting(true);
    setPythonOutput('Executing Python code on server...');
    try {
      const res = await fetch('/api/run-python', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: contentData }),
      });
      const data = await res.json();
      setPythonOutput(data.output || '(No output produced)');
    } catch (err: any) {
      setPythonOutput(`Execution error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Save changes to database
  const handleSaveWidget = async () => {
    if (!project) return;
    setSaveStatus('Saving widget...');
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customHeading: customHeading.trim(),
          contentType,
          contentData,
          pythonOutput,
        }),
      });
      if (!res.ok) throw new Error('Failed to save widget data');
      const data = await res.json();
      setProject(data.project);
      setIsEditing(false);
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message}`);
    }
  };

  // File upload handler
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

  // Insert image tag directly into HTML
  const handleInsertImageIntoHtml = (imgTag: string) => {
    setContentData((prev) => `${prev}\n\n${imgTag}`);
  };

  // Google Search Submission
  const handleGoogleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = googleSearchQuery.trim() || 'sustainability exhibition';
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading && !project) {
    return (
      <div className="min-h-screen bg-[#030b1a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-xl border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
        <h2 className="text-lg font-bold text-white">Loading Widget...</h2>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#030b1a] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Widget Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">{error || 'Unknown project identifier'}</p>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isHtml = project.contentType === 'html' && !isEditing;

  return (
    <div className="min-h-screen w-screen bg-[#030b1a] text-slate-100 relative overflow-hidden flex flex-col">
      
      {/* 
        FLOATING MINIMALIST CONTROL BAR:
        Positioned fixed over the top right so it causes ZERO layout shifts to the HTML canvas!
      */}
      <div className="fixed top-3 right-4 z-50 flex items-center gap-2 bg-[#061224]/90 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-full shadow-2xl">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-cyan-300 transition-colors pr-2 border-r border-slate-700"
          title="Back to Exhibition Command Center"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dashboard</span>
        </button>

        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-emerald-300 pr-2 border-r border-slate-700">
          <Clock className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>{currentTime.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>

        {/* Upload Images Button */}
        <button
          onClick={() => setIsImageModalOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 rounded-full transition-colors"
          title="Upload & Insert Images"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Upload Image</span>
        </button>

        {/* Edit / View Mode Toggle */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-colors"
        >
          {isEditing ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <Edit3 className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isEditing ? 'View Widget' : 'Edit Content'}</span>
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-full transition-colors shadow-sm"
          title="Copy shareable link"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* 
        IF NOT EDITING AND HTML CONTENT:
        100% Edge-to-Edge Pure HTML View (No margins, no shifts, no cutoffs!)
      */}
      {isHtml ? (
        <div className="w-screen h-screen absolute inset-0 z-0 bg-[#030b1a] overflow-hidden">
          <iframe
            title={`Widget ${project.id} Full HTML`}
            srcDoc={project.contentData}
            sandbox="allow-scripts allow-same-origin allow-forms"
            className="w-full h-full border-0 m-0 p-0 block bg-transparent"
          />
        </div>
      ) : isEditing ? (
        /* EDITING MODE: Configuration & HTML/Image Editor */
        <div className="relative z-10 flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 my-16 overflow-y-auto">
          <div className="bg-[#0a1120] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                  {project.category}
                </span>
                <h2 className="text-xl font-black text-white">
                  Configure {project.name}
                </h2>
              </div>
              {saveStatus && (
                <span className="text-xs font-mono text-emerald-400 font-semibold">{saveStatus}</span>
              )}
            </div>

            {/* Custom Heading Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Title / Heading (Optional)
              </label>
              <input
                type="text"
                value={customHeading}
                onChange={(e) => setCustomHeading(e.target.value)}
                placeholder="e.g. A Innovations - Sustainability Live Dashboard"
                className="w-full bg-[#060a14] border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* 3 Content Choices */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Content Type:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setContentType('html')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                    contentType === 'html'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Code className="w-4 h-4 text-amber-400" />
                  <span>HTML Code / Webpage</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContentType('link');
                    if (!contentData || contentData.trim() === '') {
                      setContentData('https://www.google.com');
                    }
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                    contentType === 'link'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Google / Browser Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContentType('python')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                    contentType === 'python'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Python Script</span>
                </button>
              </div>
            </div>

            {/* HTML Editor Panel with Image Upload Helper */}
            {contentType === 'html' && (
              <div className="space-y-3 bg-[#060a14] p-4 rounded-xl border border-amber-500/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300">
                    Full HTML Code (Entire widget renders this HTML without shifts):
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Upload & Insert Image</span>
                    </button>

                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs border border-slate-700 hover:bg-slate-700 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload .html</span>
                      <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <textarea
                  value={contentData}
                  onChange={(e) => setContentData(e.target.value)}
                  rows={14}
                  placeholder="<!DOCTYPE html><html><body>...</body></html>"
                  className="w-full bg-[#030b1a] border border-slate-700 rounded-xl p-3 text-xs font-mono text-amber-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />

                <p className="text-[11px] text-slate-400">
                  Tip: Upload photos using the button above and insert the generated <code className="text-cyan-300">&lt;img src="..." /&gt;</code> anywhere in your HTML code!
                </p>
              </div>
            )}

            {/* Google Browser Panel */}
            {contentType === 'link' && (
              <div className="space-y-3 bg-[#060a14] p-4 rounded-xl border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <div className="flex items-center font-bold text-sm tracking-tight">
                      <span className="text-[#4285F4]">G</span>
                      <span className="text-[#EA4335]">o</span>
                      <span className="text-[#FBBC05]">o</span>
                      <span className="text-[#4285F4]">g</span>
                      <span className="text-[#34A853]">l</span>
                      <span className="text-[#EA4335]">e</span>
                    </div>
                    <span>Browser Inside Widget</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setContentData('https://www.google.com')}
                    className="px-2.5 py-1 text-xs bg-cyan-950 text-cyan-300 rounded border border-cyan-800 hover:bg-cyan-900"
                  >
                    Set Google Home
                  </button>
                </div>

                <input
                  type="text"
                  value={contentData}
                  onChange={(e) => setContentData(e.target.value)}
                  placeholder="https://www.google.com or search URL"
                  className="w-full bg-[#0c1424] border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-cyan-200 focus:outline-none"
                />
              </div>
            )}

            {/* Python Script Panel */}
            {contentType === 'python' && (
              <div className="space-y-3 bg-[#060a14] p-4 rounded-xl border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">Python Script:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleRunPython}
                      disabled={isExecuting}
                      className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isExecuting ? 'Running...' : 'Run Script'}</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={contentData}
                  onChange={(e) => setContentData(e.target.value)}
                  rows={8}
                  placeholder="print('Hello Sustainability')"
                  className="w-full bg-[#0c1424] border border-slate-700 rounded-lg p-3 text-xs font-mono text-emerald-100"
                />
                {pythonOutput && (
                  <div className="bg-black/90 p-3 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300">
                    <pre className="whitespace-pre-wrap">{pythonOutput}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveWidget}
                className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Save & Display in Widget</span>
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* NON-HTML DISPLAY (Google Browser or Python Terminal) */
        <div className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 my-16 flex flex-col">
          <div className="mb-4">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
              {project.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {project.name}
              {project.customHeading && (
                <span className="text-slate-300 font-normal ml-2">
                  — {project.customHeading}
                </span>
              )}
            </h1>
          </div>

          {project.contentType === 'link' ? (
            <div className="flex-1 flex flex-col bg-[#070c18] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl min-h-[500px]">
              <div className="px-4 py-2.5 bg-[#060a14] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-cyan-300 ml-2 font-mono">{project.contentData}</span>
                </div>
                <a
                  href={project.contentData.startsWith('http') ? project.contentData : `https://${project.contentData}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in External Window</span>
                </a>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto w-full space-y-6">
                <div className="flex items-center justify-center font-extrabold text-5xl tracking-tight select-none">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </div>

                <form onSubmit={handleGoogleSearchSubmit} className="relative w-full max-w-lg">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={googleSearchQuery}
                    onChange={(e) => setGoogleSearchQuery(e.target.value)}
                    placeholder="Search Google..."
                    className="w-full bg-[#0c1424] border border-slate-700 focus:border-cyan-400 rounded-full pl-12 pr-28 py-3 text-sm text-white placeholder-slate-500 shadow-xl focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-full transition-colors"
                  >
                    Search
                  </button>
                </form>

                <p className="text-xs text-slate-400">
                  Google browser active inside this widget.
                </p>
              </div>
            </div>
          ) : project.contentType === 'python' ? (
            <div className="flex-1 flex flex-col bg-black/90 rounded-2xl p-6 border border-slate-800 font-mono min-h-[450px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>python3 {project.id}.py</span>
                </div>
                <button
                  onClick={handleRunPython}
                  disabled={isExecuting}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'Running...' : 'Re-run Code'}</span>
                </button>
              </div>
              <pre className="text-sm text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-y-auto">
                {pythonOutput || project.pythonOutput || '(Script output loaded successfully)'}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-[#0a1120] rounded-2xl border border-slate-800">
              <p className="text-sm mb-4">This widget is currently empty.</p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Configure Widget
              </button>
            </div>
          )}
        </div>
      )}

      {/* Standalone Image Manager Modal */}
      {isImageModalOpen && (
        <ImageManagerModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onInsertImageIntoHtml={handleInsertImageIntoHtml}
          projectId={project.id}
        />
      )}

    </div>
  );
};
