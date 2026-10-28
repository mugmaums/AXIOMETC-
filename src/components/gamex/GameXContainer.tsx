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
  Zap,
  Flame,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface InstalledGame {
  id: string;
  title: string;
  category: string;
  source: string;
  gameHtml: string;
  installedAt: string;
  plays: number;
}

interface GameXContainerProps {
  onOpenCanvas: () => void;
}

const STORAGE_KEY = 'gamex_installed_canvas_v1';

const defaultPresets = [
  { name: 'Subway Surfers', category: 'Action / Runner', source: 'Poki Direct Pipeline', icon: '🏃‍♂️', prompt: 'Subway Surfers' },
  { name: 'Temple Run 2', category: 'Adventure', source: 'CrazyGames Pipeline', icon: '🗿', prompt: 'Temple Run 2' },
  { name: 'Moto X3M Bike Race', category: 'Racing', source: 'Poki Pipeline', icon: '🏍️', prompt: 'Moto X3M' },
  { name: 'Basketball Stars', category: 'Sports', source: 'Funox Pipeline', icon: '🏀', prompt: 'Basketball Stars' },
  { name: 'Pac-Man Arcade', category: 'Classic Arcade', source: 'Poki Arcade', icon: '🟡', prompt: 'Pac-Man' },
];

export const GameXContainer: React.FC<GameXContainerProps> = ({ onOpenCanvas }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'canvas'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentGame, setCurrentGame] = useState<{ title: string; category: string; source: string; code: string } | null>(null);
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

    try {
      const q = query(collection(db, 'gamex_canvas_games'), orderBy('installedAt', 'desc'));
      const snapshot = await getDocs(q);
      const fsGames = snapshot.docs.map(d => ({
        id: d.id,
        title: d.data().title || 'Untitled Game',
        category: d.data().category || 'Arcade',
        source: d.data().source || 'Poki Pipeline',
        gameHtml: d.data().gameHtml || '',
        installedAt: d.data().installedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        plays: d.data().plays || 1
      }));

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
          source: data.source || 'Poki / CrazyGames / Funox Pipeline',
          code: data.gameHtml
        });
      } else {
        alert(data.message || 'Failed to establish game pipeline.');
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
      source: currentGame.source,
      gameHtml: currentGame.code,
      installedAt: new Date().toISOString(),
      plays: 1
    };

    const updated = [newGame, ...installedGames];
    saveInstalledGames(updated);

    try {
      await addDoc(collection(db, 'gamex_canvas_games'), {
        title: currentGame.title,
        category: currentGame.category,
        source: currentGame.source,
        gameHtml: currentGame.code,
        installedAt: serverTimestamp(),
        plays: 1
      });
    } catch (e) {
      console.warn('Firestore save note:', e);
    }

    setInstallSuccessMessage(`"${currentGame.title}" direct pipeline successfully installed on Dedicated GameX Canvas!`);
    setTimeout(() => setInstallSuccessMessage(''), 3500);
  };

  const handleUninstallGame = async (id: string) => {
    if (!confirm('Are you sure you want to remove this game pipeline from GameX Canvas?')) return;
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
              <span>GameX Direct Pipeline Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gold-accent text-mahogany-950 font-mono font-black uppercase">
                Poki · CrazyGames · Funox
              </span>
            </h1>
            <p className="text-[11px] text-ivory/60 font-serif">Direct stream pipeline for Poki, CrazyGames, & Funox without switching apps</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-mahogany-950 p-1 rounded-xl border border-gold-accent/30">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'search' ? 'bg-gold-accent text-mahogany-950 shadow-md font-black' : 'text-ivory/70 hover:text-gold-accent'}`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search & Pipeline</span>
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
              Go to Dedicated GameX Canvas →
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
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Direct Web Game Pipeline Search Bubble</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-gold-accent font-sans">
                  Type Any Game Name to Stream Directly
                </h2>
                <p className="text-xs sm:text-sm text-ivory/80 max-w-xl mx-auto font-serif">
                  Type any game prompt (e.g. Subway Surfers, Temple Run, Moto X3M). GameX searches Poki, CrazyGames, & Funox repositories and establishes a direct pipeline so you play the exact game inside GameX.
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
                    placeholder="Search game name (e.g. Subway Surfers, Temple Run, Moto X3M, Basketball Stars)..."
                    className="w-full bg-mahogany-950 border-2 border-gold-accent/40 rounded-2xl pl-12 pr-4 py-4 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold-accent font-sans shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-8 py-4 bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>{isLoading ? 'Connecting Pipeline...' : 'Search & Stream'}</span>
                </button>
              </form>

              {/* Fast Direct Catalog Shortcuts */}
              <div className="pt-4 border-t border-gold-accent/20 flex flex-wrap items-center justify-center gap-3 relative z-10">
                <span className="text-xs font-mono text-ivory/60">Verified Direct Pipelines:</span>
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

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-gold-accent border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-mono text-gold-accent">Searching Poki, CrazyGames, & Funox catalogs & establishing direct game pipeline stream...</p>
              </div>
            )}

            {/* Direct Game Pipeline Viewport */}
            {currentGame && !isLoading && (
              <div className="bg-mahogany-900/95 border-2 border-gold-accent/50 rounded-3xl p-6 shadow-2xl space-y-6 brass-border animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gold-accent/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-accent text-mahogany-950 flex items-center justify-center font-bold text-lg">
                      🎮
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gold-accent font-sans">{currentGame.title}</h3>
                      <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Pipeline Active: {currentGame.source}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleInstallToGameXCanvas}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Pipeline on GameX Canvas</span>
                  </button>
                </div>

                {/* Direct Playable Game Pipeline Frame */}
                <div className="w-full h-[580px] bg-black rounded-2xl overflow-hidden border border-gold-accent/30 shadow-2xl relative">
                  <iframe
                    srcDoc={currentGame.code}
                    title={currentGame.title}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms"
                    allow="autoplay; fullscreen; gamepad; focus-without-user-activation;"
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
                <p className="text-xs text-ivory/70 font-serif">Your permanent arcade inventory of installed game pipelines</p>
              </div>

              <button
                onClick={() => setActiveTab('search')}
                className="px-4 py-2 rounded-xl bg-gold-accent text-mahogany-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg cursor-pointer flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search & Connect Pipelines</span>
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
                      <p className="text-[10px] text-emerald-400 font-mono">Pipeline: {activeCabinetGame.source}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveCabinetGame(null)}
                    className="px-3 py-1.5 rounded-lg bg-mahogany-950 hover:bg-gold-accent hover:text-mahogany-950 border border-gold-accent/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    Close Cabinet ✕
                  </button>
                </div>

                <div className="w-full h-[600px] bg-black rounded-2xl overflow-hidden border border-gold-accent/40 shadow-2xl relative">
                  <iframe
                    srcDoc={activeCabinetGame.gameHtml}
                    title={activeCabinetGame.title}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms"
                    allow="autoplay; fullscreen; gamepad; focus-without-user-activation;"
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
                  Type any game name in the search bubble (Subway Surfers, Temple Run, Moto X3M) and click "Install Pipeline on GameX Canvas".
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-6 py-3 rounded-xl bg-gold-accent text-mahogany-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                  Search & Install Game Pipelines Now
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
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{game.source || 'Direct Pipeline'}</span>
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
                        Direct pipeline stream active. Installed {new Date(game.installedAt).toLocaleDateString()}.
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
                        <span>Play on Dedicated Canvas</span>
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
