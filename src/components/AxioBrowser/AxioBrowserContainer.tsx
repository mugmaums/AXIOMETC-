import React, { useState, useEffect } from 'react';
import { ChromeTabBar } from './ChromeTabBar';
import { ChromeOmnibox } from './ChromeOmnibox';
import { AxioBookmarksBar } from './AxioBookmarksBar';
import { AxioNewTabPage } from './AxioNewTabPage';
import { AxioWebEngine } from './AxioWebEngine';
import { AxioAiSidebar } from './AxioAiSidebar';
import { Settings, History, Maximize2, Minimize2, X, ShieldCheck } from 'lucide-react';
import type { AxioTab, Bookmark, AxioExtension } from './types';

interface AxioBrowserContainerProps {
  onCloseBrowser?: () => void;
}

const initialBookmarks: Bookmark[] = [
  { id: '1', title: 'Google', url: 'https://google.com', favicon: 'https://www.google.com/favicon.ico' },
  { id: '2', title: 'YouTube', url: 'https://youtube.com', favicon: 'https://www.youtube.com/favicon.ico' },
  { id: '3', title: 'GitHub', url: 'https://github.com', favicon: 'https://github.githubassets.com/favicons/favicon.svg' },
  { id: '4', title: 'Wikipedia', url: 'https://wikipedia.org', favicon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' },
  { id: '5', title: 'Chrome Settings', url: 'chrome://settings', favicon: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' },
  { id: '6', title: 'Chrome History', url: 'chrome://history', favicon: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' },
];

const initialExtensions: AxioExtension[] = [
  { id: 'ext1', name: 'AXIO AI Copilot Pro', version: '3.8', description: 'Real-time neural web summarization', icon: '✨', enabled: true },
  { id: 'ext2', name: 'uBlock Stealth', version: '1.5', description: 'Advanced tracker and ad blocker', icon: '🛡️', enabled: true },
  { id: 'ext3', name: 'Google Account Sync', version: '124.0', description: 'Signed in as mugmaums@gmail.com', icon: '👤', enabled: true },
];

export const AxioBrowserContainer: React.FC<AxioBrowserContainerProps> = ({ onCloseBrowser }) => {
  const [tabs, setTabs] = useState<AxioTab[]>([
    {
      id: 'tab_1',
      title: 'New Tab',
      url: 'axio://newtab',
      isLoading: false,
      isPinned: false,
      isMuted: false,
      isIncognito: false,
      history: ['axio://newtab'],
      historyIndex: 0,
      mode: 'newtab'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab_1');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [extensions, setExtensions] = useState<AxioExtension[]>(initialExtensions);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isIncognitoActive, setIsIncognitoActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Automatic Fullscreen API triggering on launch
  useEffect(() => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      }
    } catch {}
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleNewTab = (incognito = false) => {
    const newId = `tab_${Date.now()}`;
    const newTab: AxioTab = {
      id: newId,
      title: incognito ? 'Incognito Tab' : 'New Tab',
      url: 'axio://newtab',
      isLoading: false,
      isPinned: false,
      isMuted: false,
      isIncognito: incognito,
      history: ['axio://newtab'],
      historyIndex: 0,
      mode: 'newtab'
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) {
      setTabs([{
        id: `tab_${Date.now()}`,
        title: 'New Tab',
        url: 'axio://newtab',
        isLoading: false,
        isPinned: false,
        isMuted: false,
        isIncognito: false,
        history: ['axio://newtab'],
        historyIndex: 0,
        mode: 'newtab'
      }]);
      setActiveTabId(tabs[0].id);
      return;
    }

    const nextTabs = tabs.filter(t => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
  };

  const handleNavigate = async (targetUrl: string, searchMode = 'web') => {
    const cleanTarget = targetUrl.trim();
    if (!cleanTarget) return;

    if (cleanTarget.startsWith('chrome://') || cleanTarget.startsWith('axio://')) {
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          const newHistory = [...t.history.slice(0, t.historyIndex + 1), cleanTarget];
          const pageTitle = cleanTarget === 'chrome://settings' ? 'Settings - Google Chrome' :
                            cleanTarget === 'chrome://history' ? 'History - Google Chrome' :
                            cleanTarget === 'chrome://downloads' ? 'Downloads - Google Chrome' :
                            cleanTarget === 'chrome://extensions' ? 'Extensions - Google Chrome' : 'New Tab';
          return {
            ...t,
            isLoading: false,
            url: cleanTarget,
            title: pageTitle,
            mode: cleanTarget === 'axio://newtab' ? 'newtab' : 'search',
            history: newHistory,
            historyIndex: newHistory.length - 1
          };
        }
        return t;
      }));
      return;
    }

    const isExplicitUrl = cleanTarget.startsWith('http://') || cleanTarget.startsWith('https://');
    const isDomain = !cleanTarget.includes(' ') && (
      cleanTarget.includes('.') && (
        cleanTarget.endsWith('.com') ||
        cleanTarget.endsWith('.org') ||
        cleanTarget.endsWith('.net') ||
        cleanTarget.endsWith('.edu') ||
        cleanTarget.endsWith('.gov') ||
        cleanTarget.endsWith('.io') ||
        cleanTarget.endsWith('.ai') ||
        cleanTarget.endsWith('.app') ||
        cleanTarget.endsWith('.dev') ||
        cleanTarget.endsWith('.co') ||
        cleanTarget.includes('/') ||
        /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(cleanTarget)
      )
    );

    if (isExplicitUrl || isDomain) {
      const finalUrl = isExplicitUrl ? cleanTarget : `https://${cleanTarget}`;
      let host = finalUrl;
      try {
        host = new URL(finalUrl).hostname;
      } catch {}

      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          const newHistory = [...t.history.slice(0, t.historyIndex + 1), finalUrl];
          return {
            ...t,
            isLoading: false,
            url: finalUrl,
            title: host,
            mode: 'web',
            searchData: undefined,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            favicon: `https://www.google.com/s2/favicons?domain=${host}&sz=32`
          };
        }
        return t;
      }));
      return;
    }

    // Search query path
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanTarget)}`;
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        return {
          ...t,
          isLoading: true,
          url: searchUrl,
          title: `${cleanTarget} - Google Search`
        };
      }
      return t;
    }));

    try {
      const res = await fetch('/api/axio/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanTarget, mode: searchMode })
      });
      const data = await res.json();

      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          const newHistory = [...t.history.slice(0, t.historyIndex + 1), searchUrl];
          return {
            ...t,
            isLoading: false,
            title: data.data?.query ? `${data.data.query} - Google Search` : `${cleanTarget} - Google Search`,
            mode: 'search',
            searchData: data.data,
            history: newHistory,
            historyIndex: newHistory.length - 1
          };
        }
        return t;
      }));
    } catch (err) {
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          return {
            ...t,
            isLoading: false,
            mode: 'web',
            url: searchUrl,
            title: `${cleanTarget} - Google Search`
          };
        }
        return t;
      }));
    }
  };

  // Listen for iframe navigation events and title updates
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'AXIO_NAVIGATE' && event.data.url) {
        handleNavigate(event.data.url);
      } else if (event.data.type === 'AXIO_PAGE_LOADED') {
        const { title: loadedTitle, url: loadedUrl } = event.data;
        setTabs(prev => prev.map(t => {
          if (t.id === activeTabId) {
            return {
              ...t,
              title: loadedTitle || t.title,
              url: loadedUrl || t.url
            };
          }
          return t;
        }));
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [activeTabId]);

  const handleGoBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const prevUrl = activeTab.history[newIndex];
      handleNavigate(prevUrl);
    }
  };

  const handleGoForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const nextUrl = activeTab.history[newIndex];
      handleNavigate(nextUrl);
    }
  };

  const handleReload = () => {
    handleNavigate(activeTab.url);
  };

  const handleGoHome = () => {
    handleNavigate('axio://newtab');
  };

  const handleToggleBookmark = () => {
    const exists = bookmarks.some(b => b.url === activeTab.url);
    if (exists) {
      setBookmarks(prev => prev.filter(b => b.url !== activeTab.url));
    } else {
      setBookmarks(prev => [
        ...prev,
        { id: `bm_${Date.now()}`, title: activeTab.title || activeTab.url, url: activeTab.url, favicon: 'https://www.google.com/favicon.ico' }
      ]);
    }
  };

  const isBookmarked = bookmarks.some(b => b.url === activeTab.url);

  return (
    <div className="fixed inset-0 z-50 bg-mahogany-950 flex flex-col h-screen w-screen select-none overflow-hidden shadow-2xl animate-in fade-in font-serif text-ivory">
      {/* Chrome Window Titlebar with Polished Mahogany Moulding and Brass Controls */}
      <div className="bg-gradient-to-r from-mahogany-950 via-mahogany-900 to-mahogany-950 px-4 py-1.5 flex items-center justify-between text-xs text-ivory/80 border-b border-gold-accent/30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full bg-gold-accent flex items-center justify-center text-mahogany-950 text-[10px] font-black shadow-sm">
            C
          </div>
          <span className="font-bold text-gold-accent tracking-tight">AXIO Chrome Engine</span>
          <span className="text-[10px] text-ivory/50 font-mono">mugmaums@gmail.com</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullscreen}
            className="p-1 hover:bg-gold-accent/20 rounded text-gold-accent transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {onCloseBrowser && (
            <button
              onClick={onCloseBrowser}
              className="p-1 hover:bg-red-900/60 rounded text-gold-accent/80 hover:text-white transition-colors cursor-pointer"
              title="Close AXIO Browser"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chrome Tab Bar */}
      <ChromeTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab(isIncognitoActive)}
        isIncognito={isIncognitoActive}
      />

      {/* Chrome Omnibox Address & Search Bar */}
      <ChromeOmnibox
        url={activeTab.url}
        isLoading={activeTab.isLoading}
        canGoBack={activeTab.historyIndex > 0}
        canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
        isBookmarked={isBookmarked}
        isReaderMode={activeTab.mode === 'reader'}
        isIncognito={activeTab.isIncognito || isIncognitoActive}
        extensions={extensions}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onGoHome={handleGoHome}
        onToggleBookmark={handleToggleBookmark}
        onToggleReaderMode={() => {
          setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, mode: t.mode === 'reader' ? 'search' : 'reader' } : t));
        }}
        onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
        isCopilotOpen={isCopilotOpen}
        onToggleExtension={(id) => {
          setExtensions(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
        }}
      />

      {/* Bookmarks Bar */}
      <AxioBookmarksBar
        bookmarks={bookmarks}
        onNavigateUrl={handleNavigate}
        isIncognito={isIncognitoActive}
      />

      {/* Browser Viewport & AI Side Panel Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab.url === 'chrome://settings' ? (
          <div 
            className="flex-1 p-8 overflow-y-auto space-y-6"
            style={{
              backgroundImage: 'url("/src/assets/images/mahogany_wood_texture_1792941904763.jpg")',
              backgroundSize: 'cover',
              backgroundAttachment: 'fixed'
            }}
          >
            <div className="max-w-4xl mx-auto space-y-6 bg-mahogany-900/95 border-2 border-gold-accent/40 rounded-2xl p-8 shadow-2xl brass-border">
              <h1 className="text-2xl font-black text-gold-accent flex items-center gap-3">
                <Settings className="w-7 h-7 text-gold-accent" />
                <span>AXIO Chrome Settings (Synchronized)</span>
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-mahogany-950 border border-gold-accent/30 space-y-3">
                  <h3 className="text-base font-bold text-gold-accent">Profile & Account Sync</h3>
                  <p className="text-xs text-ivory/70">Personal identity active within AXIOMETIC network.</p>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-mahogany-900 border border-gold-accent/20">
                    <div className="w-10 h-10 rounded-full bg-gold-accent text-mahogany-950 font-black text-base flex items-center justify-center">
                      A
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ivory">Axiometic Architect</div>
                      <div className="text-xs text-gold-accent font-mono">mugmaums@gmail.com</div>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-mahogany-950 border border-gold-accent/30 space-y-3">
                  <h3 className="text-base font-bold text-gold-accent">AI Neural Grounding</h3>
                  <p className="text-xs text-ivory/70">Connected directly with Gemini 3.8 Flash search model.</p>
                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-ivory/60">Neural Engine:</span>
                    <span className="text-gold-accent font-mono font-bold">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab.url === 'chrome://history' ? (
          <div 
            className="flex-1 p-8 overflow-y-auto space-y-6"
            style={{
              backgroundImage: 'url("/src/assets/images/mahogany_wood_texture_1792941904763.jpg")',
              backgroundSize: 'cover',
              backgroundAttachment: 'fixed'
            }}
          >
            <div className="max-w-4xl mx-auto space-y-6 bg-mahogany-900/95 border-2 border-gold-accent/40 rounded-2xl p-8 shadow-2xl brass-border">
              <h1 className="text-2xl font-black text-gold-accent flex items-center gap-3">
                <History className="w-7 h-7 text-gold-accent" />
                <span>Browsing Archive History</span>
              </h1>
              <div className="space-y-2">
                {activeTab.history.map((hUrl, hIdx) => (
                  <div key={hIdx} className="p-3.5 rounded-xl bg-mahogany-950 border border-gold-accent/25 flex items-center justify-between text-xs font-mono">
                    <span className="text-gold-accent">{hUrl}</span>
                    <span className="text-ivory/50">Verified Session</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab.mode === 'newtab' ? (
          <div className="flex-1 overflow-y-auto">
            <AxioNewTabPage
              onSearch={(q, mode) => handleNavigate(q, mode)}
              onNavigateUrl={handleNavigate}
              bookmarks={bookmarks}
              onAddBookmark={(title, url) => setBookmarks(prev => [...prev, { id: `bm_${Date.now()}`, title, url, favicon: 'https://www.google.com/favicon.ico' }])}
              isIncognito={activeTab.isIncognito || isIncognitoActive}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <AxioWebEngine
              tab={activeTab}
              onNavigateUrl={handleNavigate}
              onOpenCopilot={() => setIsCopilotOpen(true)}
            />
          </div>
        )}

        {/* AI Copilot Side Panel */}
        {isCopilotOpen && (
          <AxioAiSidebar
            activeTab={activeTab}
            onClose={() => setIsCopilotOpen(false)}
            onNavigateUrl={handleNavigate}
          />
        )}
      </div>
    </div>
  );
};
