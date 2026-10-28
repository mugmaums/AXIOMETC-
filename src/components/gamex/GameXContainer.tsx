import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Search, 
  Sparkles, 
  Play, 
  Download, 
  RotateCcw, 
  CheckCircle, 
  Globe,
  Trash2,
  Maximize2,
  Tv,
  Layers,
  Flame,
  Trophy
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface InstalledGame {
  id: string;
  title: string;
  category: string;
  gameHtml: string;
  installedAt: string;
  plays: number;
}

interface GameXContainerProps {
  onOpenCanvas: () => void;
}

const STORAGE_KEY = 'gamex_installed_canvas_v1';

const defaultPresets = [
  { name: 'Subway Surfers Dash', category: 'Action / Runner', icon: '🏃‍♂️', prompt: 'Subway Surfers endless runner with jumping, obstacles, speed acceleration, and coin collection.' },
  { name: 'Temple Run Jungle Dash', category: 'Adventure', icon: '🗿', prompt: 'Temple Run 3D-style obstacle runner through ancient jungle ruins with swipe and jump controls.' },
  { name: 'Pac-Man Neon Arcade', category: 'Classic Arcade', icon: '🟡', prompt: 'Pac-Man retro arcade maze game with ghost AI, power pellets, and score counter.' },
  { name: 'Space Shooter Galaxy', category: 'Shooter', icon: '🚀', prompt: 'Retro space shooter arcade game with laser firing, alien swarms, and shield powerups.' },
];

export const GameXContainer: React.FC<GameXContainerProps> = ({ onOpenCanvas }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'canvas'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentGame, setCurrentGame] = useState<{ title: string; category: string; code: string } | null>(null);
  const [installedGames, setInstalledGames] = useState<InstalledGame[]>([]);
  const [activeCabinetGame, setActiveCabinetGame] = useState<InstalledGame | null>(null);
  const [installSuccessMessage, setInstallSuccessMessage] = useState('');

  // Load installed canvas games from localStorage and Firestore on mount
  useEffect(() => {
    loadInstalledCanvasGames();
  }, []);

  const loadInstalledCanvasGames = async () => {
    let localGames: InstalledGame[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        localGames = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load local canvas games:', e);
    }

    // Try fetching from Firestore collection `gamex_canvas_games`
    try {
      const q = query(collection(db, 'gamex_canvas_games'), orderBy('installedAt', 'desc'));
      const snapshot = await getDocs(q);
      const fsGames = snapshot.docs.map(d => ({
        id: d.id,
        title: d.data().title || 'Untitled Game',
        category: d.data().category || 'Arcade',
        gameHtml: d.data().gameHtml || '',
        installedAt: d.data().installedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        plays: d.data().plays || 1
      }));

      // Combine local and firestore, removing duplicates
      const map = new Map<string, InstalledGame>();
      [...localGames, ...fsGames].forEach(g => map.set(g.id, g));
      const merged = Array.from(map.values());
      setInstalledGames(merged);
    } catch (err) {
      console.warn('Firestore fetch note, using local canvas games:', err);
      setInstalledGames(localGames);
    }
  };

  const saveInstalledGames = (games: InstalledGame[]) => {
    setInstalledGames(games);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch (e) {
      console.error('Failed to write local canvas games:', e);
    }
  };

  const handleSearchGame = async (queryToSearch: string) => {
    if (!queryToSearch.trim() || isLoading) return;

    setIsLoading(true);
    setCurrentGame(null);
    setInstallSuccessMessage('');

    try {
      const res = await fetch('/api/gamex/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSearch.trim() })
      });
      const data = await res.json();
      if (data.success && data.gameHtml) {
        setCurrentGame({
          title: data.title || queryToSearch,
          category: data.category || 'Arcade',
          code: data.gameHtml
        });
      } else {
        alert(data.message || 'Failed to synthesize game.');
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallToGameXCanvas = async () => {
    if (!currentGame) return;

    const newGame: InstalledGame = {
      id: `gamex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: currentGame.title,
      category: currentGame.category,
      gameHtml: currentGame.code,
      installedAt: new Date().toISOString(),
      plays: 1
    };

    const updated = [newGame, ...installedGames];
    saveInstalledGames(updated);

    // Save to Firestore permanently
    try {
      await addDoc(collection(db, 'gamex_canvas_games'), {
        title: currentGame.title,
        category: currentGame.category,
        gameHtml: currentGame.code,
        installedAt: serverTimestamp(),
        plays: 1
      });
    } catch (e) {
      console.warn('Firestore save note:', e);
    }

    setInstallSuccessMessage(`"${currentGame.title}" successfully installed on dedicated GameX Canvas!`);
    setTimeout(() => setInstallSuccessMessage(''), 3500);
  };

  const handleUninstallGame = async (id: string) => {
    if (!confirm('Are you sure you want to remove this game from GameX Canvas?')) return;
    const updated = installedGames.filter(g => g.id !== id);
    saveInstalledGames(updated);

    try {
      await deleteDoc(doc(db, 'gamex_canvas_games', id));
    } catch (e) {}

    if (activeCabinetGame?.id === id) {
      setActiveCabinetGame(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-mahogany-950 text-ivory font-serif">
      {/* GameX Top Header */}
      <header className="h-16 bg-mahogany-900/95 border-b border-gold-accent/35 px-6 flex items-center justify-between shadow-2xl z-20 brass-border-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-accent via-amber-600 to-amber-800 flex items-center justify-center text-mahogany-950 font-black text-xl shadow-lg">
            🎮
          </div>
          <div>
            <h1 className="text-lg font-black text-gold-accent font-sans tracking-wide flex items-center gap-2">
              <span>GameX Arcade & Canvas Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gold-accent text-mahogany-950 font-mono font-black uppercase">
                Gemini 3.8 Flash
              </span>
            </h1>
            <p className="text-[11px] text-ivory/60 font-serif">Synthesize Poki, CrazyGames & Funox catalogs & install on dedicated GameX Canvas</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-mahogany-950 p-1 rounded-xl border border-gold-accent/30">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'search' ? 'bg-gold-accent text-mahogany-950 shadow-md font-black' : 'text-ivory/70 hover:text-gold-accent'}`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search & Synthesize</span>
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'canvas' ? 'bg-gold-accent text-mahogany-950 shadow-md font-black' : 'text-ivory/70 hover:text-gold-accent'}`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Dedicated GameX Canvas ({installedGames.length})</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
        {installSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-sans flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{installSuccessMessage}</span>
            </div>
            <button
              onClick={() => setActiveTab('canvas')}
              className="px-3 py-1 rounded-lg bg-emerald-400 text-mahogany-950 font-black text-[11px] hover:scale-105 transition-all cursor-pointer"
            >
              Go to GameX Canvas →
            </button>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-8">
            {/* Search Bubble Hero Banner */}
            <div className="bg-mahogany-900/90 border-2 border-gold-accent/40 rounded-3xl p-8 shadow-2xl brass-border text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12)_0%,transparent_70%)] pointer-events-none" />

              <div className="space-y-2 relative z-10">
                <span className="text-xs font-mono font-bold text-gold-accent uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Universal Game Search Bubble</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-gold-accent font-sans">
                  Type Any Web Game Name
                </h2>
                <p className="text-xs sm:text-sm text-ivory/80 max-w-xl mx-auto font-serif">
                  GameX searches Poki, CrazyGames, & Funox repositories, synthesizes code using Gemini 3.8 Flash, and lets you play & install it directly onto your Dedicated GameX Canvas.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchGame(searchQuery);
                }}
                className="max-w-2xl mx-auto flex items-center gap-3 relative z-10"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-accent/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search game name (e.g., Subway Surfers, Temple Run, Pac-Man, Space Shooter)..."
                    className="w-full bg-mahogany-950 border-2 border-gold-accent/40 rounded-2xl pl-12 pr-4 py-4 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold-accent font-sans shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-8 py-4 bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>{isLoading ? 'Synthesizing...' : 'Search & Fetch'}</span>
                </button>
              </form>

              {/* Popular Arcade Catalog Shortcuts */}
              <div className="pt-4 border-t border-gold-accent/20 flex flex-wrap items-center justify-center gap-3 relative z-10">
                <span className="text-xs font-mono text-ivory/60">Fast Catalog Shortcuts:</span>
                {defaultPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(preset.name);
                      handleSearchGame(preset.prompt);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-mahogany-950/80 hover:bg-gold-accent hover:text-mahogany-950 text-xs font-bold text-ivory/90 border border-gold-accent/25 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="text-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-gold-accent border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-mono text-gold-accent">Connecting to Poki & CrazyGames repositories via Gemini 3.8 Flash...</p>
              </div>
            )}

            {/* Generated Game Preview */}
            {currentGame && !isLoading && (
              <div className="bg-mahogany-900/95 border-2 border-gold-accent/50 rounded-3xl p-6 shadow-2xl space-y-6 brass-border animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gold-accent/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-accent text-mahogany-950 flex items-center justify-center font-bold text-lg">
                      🎮
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gold-accent font-sans">{currentGame.title}</h3>
                      <p className="text-xs text-ivory/70 font-mono">{currentGame.category} · Ready to Play & Install</p>
                    </div>
                  </div>

                  <button
                    onClick={handleInstallToGameXCanvas}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install on Dedicated GameX Canvas</span>
                  </button>
                </div>

                {/* Sandbox Frame */}
                <div className="w-full h-[520px] bg-black rounded-2xl overflow-hidden border border-gold-accent/30 shadow-2xl relative">
                  <iframe
                    srcDoc={currentGame.code}
                    title={currentGame.title}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEDICATED GAMEX CANVAS TAB */}
        {activeTab === 'canvas' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-gold-accent/30">
              <div>
                <h2 className="text-2xl font-black text-gold-accent font-sans tracking-wide flex items-center gap-2">
                  <Tv className="w-6 h-6 text-gold-accent" />
                  <span>Dedicated GameX Canvas</span>
                </h2>
                <p className="text-xs text-ivory/70 font-serif">Your permanent arcade inventory of installed canvas games</p>
              </div>

              <button
                onClick={() => setActiveTab('search')}
                className="px-4 py-2 rounded-xl bg-gold-accent text-mahogany-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg cursor-pointer flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search & Add Games</span>
              </button>
            </div>

            {/* Active Cabinet Player Viewport */}
            {activeCabinetGame && (
              <div className="bg-mahogany-900/95 border-2 border-gold-accent/60 rounded-3xl p-6 shadow-2xl space-y-4 brass-border relative">
                <div className="flex items-center justify-between pb-3 border-b border-gold-accent/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold-accent text-mahogany-950 flex items-center justify-center font-bold">
                      🕹️
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gold-accent font-sans">{activeCabinetGame.title}</h3>
                      <p className="text-[10px] text-ivory/60 font-mono">Running on GameX Canvas Engine</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveCabinetGame(null)}
                    className="px-3 py-1.5 rounded-lg bg-mahogany-950 hover:bg-gold-accent hover:text-mahogany-950 border border-gold-accent/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    Close Cabinet ✕
                  </button>
                </div>

                <div className="w-full h-[580px] bg-black rounded-2xl overflow-hidden border border-gold-accent/40 shadow-2xl relative">
                  <iframe
                    srcDoc={activeCabinetGame.gameHtml}
                    title={activeCabinetGame.title}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                  />
                </div>
              </div>
            )}

            {/* Installed Games Grid */}
            {installedGames.length === 0 ? (
              <div className="text-center py-20 bg-mahogany-900/60 border border-gold-accent/20 rounded-3xl p-8 space-y-4">
                <Tv className="w-12 h-12 text-gold-accent/40 mx-auto" />
                <h3 className="text-lg font-bold text-gold-accent font-sans">No Games Installed on GameX Canvas</h3>
                <p className="text-xs text-ivory/60 font-serif italic max-w-md mx-auto">
                  Search any game in the search bubble (e.g. Subway Surfers, Pac-Man) and click "Install on Dedicated GameX Canvas".
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-6 py-3 rounded-xl bg-gold-accent text-mahogany-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                  Search & Install Games Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {installedGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-mahogany-900/90 border border-gold-accent/30 rounded-2xl p-5 shadow-xl brass-border flex flex-col justify-between space-y-4 hover:border-gold-accent transition-all group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-gold-accent/20 text-gold-accent border border-gold-accent/30 font-bold uppercase">
                          {game.category || 'Arcade'}
                        </span>
                        <button
                          onClick={() => handleUninstallGame(game.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-ivory/50 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove from GameX Canvas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-gold-accent font-sans group-hover:text-white transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-xs text-ivory/60 font-serif italic line-clamp-2">
                        HTML5 game playable on GameX Canvas. Installed {new Date(game.installedAt).toLocaleDateString()}.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gold-accent/15 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setActiveCabinetGame(game);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="w-full py-2.5 rounded-xl bg-gold-accent text-mahogany-950 font-black text-xs uppercase tracking-wider hover:scale-[1.02] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Launch on Cabinet</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
