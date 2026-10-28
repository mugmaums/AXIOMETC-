import React, { useState } from 'react';
import { Search, Mic, Camera, Sparkles, Plus, Globe, Trash2, ArrowUpRight } from 'lucide-react';
import type { Bookmark } from './types';

interface AxioNewTabPageProps {
  onSearch: (query: string, mode?: string) => void;
  onNavigateUrl: (url: string) => void;
  bookmarks: Bookmark[];
  onAddBookmark: (title: string, url: string) => void;
  isIncognito?: boolean;
}

const defaultShortcuts = [
  { id: '1', title: 'Google', url: 'https://google.com', favicon: 'https://www.google.com/favicon.ico' },
  { id: '2', title: 'YouTube', url: 'https://youtube.com', favicon: 'https://www.youtube.com/favicon.ico' },
  { id: '3', title: 'GitHub', url: 'https://github.com', favicon: 'https://github.githubassets.com/favicons/favicon.svg' },
  { id: '4', title: 'Wikipedia', url: 'https://wikipedia.org', favicon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' },
  { id: '5', title: 'Reddit', url: 'https://reddit.com', favicon: 'https://www.redditstatic.com/shreddit/assets/favicon/192x192.png' },
  { id: '6', title: 'ArXiv', url: 'https://arxiv.org', favicon: 'https://arxiv.org/favicon.ico' },
  { id: '7', title: 'OpenAI', url: 'https://openai.com', favicon: 'https://openai.com/favicon.ico' },
  { id: '8', title: 'WRI Studio', url: 'axio://wri', favicon: '/src/assets/images/axiometic_holographic_logo_1792234516124.jpg' },
];

export const AxioNewTabPage: React.FC<AxioNewTabPageProps> = ({
  onSearch,
  onNavigateUrl,
  bookmarks,
  onAddBookmark,
  isIncognito = false,
}) => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'web' | 'ai_deep' | 'academic'>('web');
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), searchMode);
    }
  };

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newUrl.trim()) {
      const formattedUrl = newUrl.startsWith('http://') || newUrl.startsWith('https://') 
        ? newUrl 
        : `https://${newUrl}`;
      const newShortcut = {
        id: `sc_${Date.now()}`,
        title: newTitle.trim(),
        url: formattedUrl,
        favicon: `${formattedUrl}/favicon.ico`,
      };
      setShortcuts(prev => [...prev, newShortcut]);
      setNewTitle('');
      setNewUrl('');
      setShowAddModal(false);
    }
  };

  const removeShortcut = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShortcuts(prev => prev.filter(sc => sc.id !== id));
  };

  return (
    <div 
      className="min-h-full flex flex-col items-center justify-center px-4 py-12 select-none relative font-serif text-ivory overflow-y-auto"
      style={{
        backgroundImage: 'url("/src/assets/images/mahogany_wood_texture_1792941904763.jpg")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Ambient Vignette & Grain */}
      <div className="absolute inset-0 bg-mahogany-950/70 z-0 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-3xl flex flex-col items-center z-10">
        {/* Wordmark */}
        <div className="mb-8 flex flex-col items-center text-center">
          {isIncognito ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-mahogany-900 border border-purple-500/50 flex items-center justify-center text-3xl shadow-2xl">
                🕶️
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-purple-300">
                Incognito Private Session
              </h1>
              <p className="text-xs text-ivory/60 max-w-md font-serif italic">
                Ephemeral vault protocol active. Ephemeral browsing traces and cookies are vaporized upon exit.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 text-5xl sm:text-6xl font-black tracking-tight drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]">
                <span className="text-gold-accent font-serif">AXIO</span>
                <span className="text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded-lg bg-gold-accent text-mahogany-950 font-black shadow-md border border-gold-accent">
                  AI CHROME
                </span>
              </div>
              <span className="text-[11px] text-gold-accent/70 font-mono tracking-widest uppercase">
                Grounded by Gemini 3.8 Flash Neural Knowledge Mesh
              </span>
            </div>
          )}
        </div>

        {/* Carved Mahogany Search Bar Well */}
        <form onSubmit={handleSearchSubmit} className="w-full relative group">
          <div className="flex items-center w-full h-13 px-4 rounded-2xl bg-mahogany-950/95 border-2 border-gold-accent/40 hover:border-gold-accent focus-within:border-gold-accent shadow-2xl transition-all brass-border">
            <Search className="w-5 h-5 text-gold-accent/70 group-focus-within:text-gold-accent shrink-0 mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or enter URL into the AXIOMETIC index..."
              className="w-full bg-transparent text-sm text-ivory placeholder-ivory/40 focus:outline-none font-serif"
              autoFocus
            />

            {/* Quick Action Buttons inside Search Bar */}
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <button
                type="button"
                onClick={() => setSearchMode(prev => prev === 'ai_deep' ? 'web' : 'ai_deep')}
                className={`px-3 py-1 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  searchMode === 'ai_deep'
                    ? 'bg-gold-accent text-mahogany-950 shadow-md font-black'
                    : 'text-gold-accent hover:bg-gold-accent/15 border border-gold-accent/30'
                }`}
                title="Toggle AI Grounded Synthesis"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Mode</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Voice search active in AXIO.')}
                className="p-1.5 text-gold-accent/60 hover:text-gold-accent rounded-lg transition-colors cursor-pointer"
                title="Search by voice"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="p-1.5 text-gold-accent/60 hover:text-gold-accent rounded-lg transition-colors cursor-pointer"
                title="Search by image"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Search Mode Quick Selectors in Brass */}
        <div className="flex items-center gap-2 mt-4 text-xs font-serif text-ivory/70">
          <span>Search Index:</span>
          <button
            onClick={() => setSearchMode('web')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              searchMode === 'web' 
                ? 'bg-gold-accent text-mahogany-950 font-black shadow-md' 
                : 'bg-mahogany-900/80 text-ivory/80 hover:text-gold-accent border border-gold-accent/20'
            }`}
          >
            All Web
          </button>
          <button
            onClick={() => setSearchMode('ai_deep')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
              searchMode === 'ai_deep' 
                ? 'bg-gold-accent text-mahogany-950 font-black shadow-md' 
                : 'bg-mahogany-900/80 text-ivory/80 hover:text-gold-accent border border-gold-accent/20'
            }`}
          >
            <Sparkles className="w-3 h-3 text-gold-accent" />
            Gemini 3.8 Flash
          </button>
          <button
            onClick={() => setSearchMode('academic')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              searchMode === 'academic' 
                ? 'bg-gold-accent text-mahogany-950 font-black shadow-md' 
                : 'bg-mahogany-900/80 text-ivory/80 hover:text-gold-accent border border-gold-accent/20'
            }`}
          >
            Academic / ArXiv
          </button>
        </div>

        {/* Polished Wood Shortcut Medallions Grid */}
        <div className="w-full mt-10">
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 justify-items-center">
            {shortcuts.map((sc) => (
              <div
                key={sc.id}
                onClick={() => onNavigateUrl(sc.url)}
                className="group relative flex flex-col items-center cursor-pointer p-2 rounded-xl hover:bg-gold-accent/10 transition-all w-20"
              >
                <button
                  onClick={(e) => removeShortcut(sc.id, e)}
                  className="absolute -top-1 -right-1 p-1 bg-mahogany-950 hover:bg-red-700 rounded-full text-gold-accent hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-gold-accent/30"
                  title="Remove shortcut"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Carved Wood Tile with Brass Bezel */}
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-mahogany-800 to-mahogany-950 group-hover:from-mahogany-700 group-hover:to-mahogany-900 flex items-center justify-center mb-2 shadow-xl border-2 border-gold-accent/40 group-hover:border-gold-accent transition-all group-hover:scale-105">
                  {sc.favicon.startsWith('http') || sc.favicon.startsWith('/') ? (
                    <img
                      src={sc.favicon}
                      alt={sc.title}
                      className="w-6 h-6 rounded-sm object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Globe className="w-5 h-5 text-gold-accent" />
                  )}
                </div>

                <span className="text-[11px] font-medium text-ivory/80 group-hover:text-gold-accent truncate max-w-full text-center">
                  {sc.title}
                </span>
              </div>
            ))}

            {/* Add Shortcut Tile */}
            <div
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center cursor-pointer p-2 rounded-xl hover:bg-gold-accent/10 transition-all w-20 group"
            >
              <div className="w-13 h-13 rounded-2xl bg-mahogany-950/80 group-hover:bg-mahogany-900 flex items-center justify-center mb-2 shadow-xl border-2 border-dashed border-gold-accent/30 group-hover:border-gold-accent transition-all group-hover:scale-105">
                <Plus className="w-5 h-5 text-gold-accent/70 group-hover:text-gold-accent" />
              </div>
              <span className="text-[11px] text-ivory/60 group-hover:text-gold-accent text-center font-medium">
                Add Tile
              </span>
            </div>
          </div>
        </div>

        {/* Guided Research Prompts on Wooden Shelf */}
        <div className="w-full mt-10 pt-6 border-t border-gold-accent/20 flex flex-col items-center">
          <div className="text-[11px] uppercase tracking-widest text-gold-accent mb-3 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Research Queries</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Quantum computing benchmarks in 2026',
              'Next.js 16 vs React 19 architecture',
              'Global financial index & commodities live',
              'Axiometic neural architecture explanation',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => onSearch(chip, 'ai_deep')}
                className="px-3.5 py-1.5 rounded-xl text-xs bg-mahogany-950/90 hover:bg-gold-accent hover:text-mahogany-950 text-ivory/90 border border-gold-accent/30 transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>{chip}</span>
                <ArrowUpRight className="w-3 h-3 text-gold-accent" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Shortcut Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-mahogany-950 border border-gold-accent/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl brass-border text-ivory">
            <h3 className="text-base font-bold text-gold-accent uppercase tracking-wider mb-4 font-serif">Add Library Shortcut</h3>
            <form onSubmit={handleAddShortcut} className="space-y-4">
              <div>
                <label className="text-xs text-gold-accent/80 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenAI"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-mahogany-900 border border-gold-accent/30 text-sm text-ivory focus:outline-none focus:border-gold-accent"
                />
              </div>
              <div>
                <label className="text-xs text-gold-accent/80 block mb-1">URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-mahogany-900 border border-gold-accent/30 text-sm text-ivory focus:outline-none focus:border-gold-accent"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-ivory/70 hover:bg-gold-accent/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 shadow-md cursor-pointer uppercase tracking-wider"
                >
                  Save Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
