import React, { useState, useEffect, useMemo } from 'react';
import {
  Project,
  FilterOptions,
  DashboardSettings,
  WidgetContentType,
} from './types.ts';
import { Header } from './components/Header.tsx';
import { BentoCard } from './components/BentoCard.tsx';
import { WidgetPage } from './components/WidgetPage.tsx';
import { PresentationMode } from './components/PresentationMode.tsx';
import { CopyFallbackModal } from './components/CopyFallbackModal.tsx';
import { CopyActionModal } from './components/CopyActionModal.tsx';
import { SimpleWidgetEditorModal } from './components/SimpleWidgetEditorModal.tsx';
import { ImageManagerModal } from './components/ImageManagerModal.tsx';
import { copyWidgetLinkToClipboard } from './utils/clipboard.ts';
import { SearchX, CheckCircle } from 'lucide-react';

function getWidgetIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/widget\/([a-zA-Z0-9_-]+)(?:\/)?$/);
  return match ? match[1] : null;
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalConfigured, setTotalConfigured] = useState(50);
  const [settings, setSettings] = useState<DashboardSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active route: null for main dashboard, or "project-01" etc. for widget view
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(() => {
    return getWidgetIdFromPath(window.location.pathname);
  });

  // UI state
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    category: 'All',
  });
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [fallbackProjectName, setFallbackProjectName] = useState<string>('');

  // Modals
  const [copyActionProject, setCopyActionProject] = useState<Project | null>(null);
  const [editorProject, setEditorProject] = useState<Project | null>(null);
  const [editorInitialTab, setEditorInitialTab] = useState<WidgetContentType | undefined>(undefined);
  const [isGlobalImageManagerOpen, setIsGlobalImageManagerOpen] = useState(false);

  // Listen to browser popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const widgetId = getWidgetIdFromPath(window.location.pathname);
      setActiveWidgetId(widgetId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToWidget = (id: string) => {
    window.history.pushState({}, '', `/widget/${id}`);
    setActiveWidgetId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDashboard = () => {
    window.history.pushState({}, '', '/');
    setActiveWidgetId(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copy link handler: copies link and triggers interactive action modal
  const handleCopyWidgetLink = async (projectId: string, projectName: string) => {
    const targetProject = projects.find((p) => p.id === projectId);
    
    await copyWidgetLinkToClipboard(
      projectId,
      () => {
        showToast(`Widget link copied to clipboard!`);
        if (targetProject) {
          setCopyActionProject(targetProject);
        }
      },
      (fallback) => {
        setFallbackUrl(fallback);
        setFallbackProjectName(projectName);
      }
    );
  };

  // Open Widget Click: opens simple modal directly on dashboard
  const handleOpenWidgetEditor = (projectId: string) => {
    const targetProject = projects.find((p) => p.id === projectId);
    if (targetProject) {
      setEditorProject(targetProject);
      setEditorInitialTab(targetProject.contentType === 'empty' ? 'link' : targetProject.contentType);
    }
  };

  // Save content to project
  const handleSaveProjectContent = async (
    projectId: string,
    contentType: WidgetContentType,
    contentData: string,
    customHeading?: string,
    pythonOutput?: string
  ) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          contentData,
          customHeading: customHeading !== undefined ? customHeading : '',
          pythonOutput: pythonOutput || '',
        }),
      });
      if (!res.ok) throw new Error('Failed to update project content');
      const data = await res.json();
      
      // Update local state immediately
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? data.project : p))
      );
      showToast(`Saved to ${data.project.name}!`);
    } catch (err: any) {
      showToast(`Error saving: ${err.message}`);
    }
  };

  // Fetch telemetry from server
  const fetchDashboardData = async (silent = false) => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch exhibition projects');
      const data = await res.json();
      setProjects(data.projects);
      setTotalConfigured(data.totalConfigured);
      setSettings(data.settings);
      setError(null);
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'Error loading dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update project count (10 to 50)
  const handleProjectCountChange = async (count: number) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectCount: count }),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        fetchDashboardData(true);
        showToast(`Exhibition count set to ${count} projects`);
      }
    } catch (err) {
      console.error('Failed to change count:', err);
    }
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = project.name.toLowerCase().includes(q);
        const matchesHeading = project.customHeading?.toLowerCase().includes(q);
        const matchesId = project.id.toLowerCase().includes(q);
        const matchesCat = project.category.toLowerCase().includes(q);
        if (!matchesName && !matchesHeading && !matchesId && !matchesCat) {
          return false;
        }
      }

      if (filters.category !== 'All' && project.category !== filters.category) {
        return false;
      }

      return true;
    });
  }, [projects, filters]);

  // If in individual widget mode
  if (activeWidgetId) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0c1424] border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <WidgetPage
          projectId={activeWidgetId}
          onBackToDashboard={navigateToDashboard}
          onCopyLink={handleCopyWidgetLink}
        />

        {fallbackUrl && (
          <CopyFallbackModal
            url={fallbackUrl}
            projectName={fallbackProjectName}
            onClose={() => setFallbackUrl(null)}
          />
        )}
      </>
    );
  }

  // Fullscreen exhibition display mode
  if (isFullscreen) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#0c1424] border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <PresentationMode
          projects={filteredProjects}
          onExit={() => setIsFullscreen(false)}
          onViewWidget={handleOpenWidgetEditor}
          onCopyLink={handleCopyWidgetLink}
        />

        {fallbackUrl && (
          <CopyFallbackModal
            url={fallbackUrl}
            projectName={fallbackProjectName}
            onClose={() => setFallbackUrl(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0c1424] border border-cyan-500/50 text-cyan-300 text-xs font-mono shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Exhibition Live Dashboard Header */}
      <Header
        totalActive={projects.length}
        totalConfigured={totalConfigured}
        projectCount={settings?.projectCount || 15}
        onProjectCountChange={handleProjectCountChange}
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(true)}
        isCompactMode={isCompactMode}
        onToggleCompactMode={() => setIsCompactMode(!isCompactMode)}
        onOpenImageManager={() => setIsGlobalImageManagerOpen(true)}
      />

      {/* Full Dashboard Viewport (Pure Widgets Wall) */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {loading && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-10 h-10 rounded-xl border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
            <h3 className="text-base font-bold text-white">Loading Live Dashboard...</h3>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Empty Search / Filter State */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#090f1d] border border-slate-800 rounded-3xl max-w-xl mx-auto my-12">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Matching Widgets</h3>
            <button
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  category: 'All',
                })
              }
              className="mt-4 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Smartwatch-Inspired Bento Wall: Clean & Futuristic */
          <div
            className={`grid gap-4 ${
              isCompactMode
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
            }`}
          >
            {filteredProjects.map((project) => (
              <BentoCard
                key={project.id}
                project={project}
                onViewWidget={handleOpenWidgetEditor}
                onCopyLink={handleCopyWidgetLink}
                isCompactView={isCompactMode}
              />
            ))}
          </div>
        )}

      </main>

      {/* Clean Exhibition Wall Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a14] py-4 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">SUSTAINABILITY LIVE</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Innovation & Environmental Exhibition Command Wall</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-emerald-400">● LIVE DASHBOARD ENGINE</span>
          </div>
        </div>
      </footer>

      {/* Copy Action Modal (Opens right after copying link, offering Google Browser / HTML / Python) */}
      {copyActionProject && (
        <CopyActionModal
          isOpen={!!copyActionProject}
          onClose={() => setCopyActionProject(null)}
          project={copyActionProject}
          widgetUrl={new URL(`/widget/${copyActionProject.id}`, window.location.origin).href}
          onSelectOption={async (contentType, contentData, customHeading) => {
            if (contentType === 'html' || contentType === 'python') {
              // Open the editor modal on that specific tab
              setEditorProject(copyActionProject);
              setEditorInitialTab(contentType);
              setCopyActionProject(null);
            } else {
              // Direct save for Google Browser
              await handleSaveProjectContent(
                copyActionProject.id,
                contentType,
                contentData,
                customHeading
              );
            }
          }}
          onOpenInNewBrowser={(url) => {
            window.open(url, '_blank', 'noopener,noreferrer');
            setCopyActionProject(null);
          }}
        />
      )}

      {/* Simple Widget Editor Modal (Clean, fast, no clutter) */}
      {editorProject && (
        <SimpleWidgetEditorModal
          isOpen={!!editorProject}
          onClose={() => setEditorProject(null)}
          project={editorProject}
          initialTab={editorInitialTab}
          onSave={handleSaveProjectContent}
        />
      )}

      {/* Fallback Copy Modal */}
      {fallbackUrl && (
        <CopyFallbackModal
          url={fallbackUrl}
          projectName={fallbackProjectName}
          onClose={() => setFallbackUrl(null)}
        />
      )}

      {/* Global Image Manager Modal */}
      {isGlobalImageManagerOpen && (
        <ImageManagerModal
          isOpen={isGlobalImageManagerOpen}
          onClose={() => setIsGlobalImageManagerOpen(false)}
        />
      )}

    </div>
  );
}
