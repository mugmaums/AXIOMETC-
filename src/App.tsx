import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PenLine,
  Plus,
  Layers,
  Upload,
  Zap,
  Trash2,
  FolderDown,
  Radio,
  BellRing,
  Globe,
  ExternalLink,
  Sparkles,
  Volume2,
  Search,
} from 'lucide-react';
import type {
  SiteData,
  Block,
  BlockType,
  SiteSettings,
  ActiveButtonBlock,
  BroadcastNotification,
} from './types';
import { Navbar } from './components/Navbar';
import { DeveloperUnlockModal } from './components/DeveloperUnlockModal';
import { DeveloperToolbar } from './components/DeveloperToolbar';
import { BlockModal } from './components/BlockModal';
import { BlockCard } from './components/BlockCard';
import { SiteSettingsModal } from './components/SiteSettingsModal';
import { ContactTransmissionModal } from './components/ContactTransmissionModal';
import { InboxModal } from './components/InboxModal';
import { FileUploadModal } from './components/FileUploadModal';
import { DynamicButtonActionModal } from './components/DynamicButtonActionModal';
import { AddContentChoiceModal } from './components/AddContentChoiceModal';
import { VaelourixAssistantWidget } from './components/VaelourixAssistantWidget';
import { AxiometicBubbleGraphic, AxiometicLogo } from './components/AxiometicBubbleGraphic';
import { DeveloperDashboard } from './components/DeveloperDashboard';
import { NotificationBroadcastModal } from './components/NotificationBroadcastModal';
import { ForcedTransmissionModal } from './components/ForcedTransmissionModal';
import { isWithinRadius } from './utils/geoUtils';
import { WRIContainer } from './components/wri/WRIContainer';
import { AxioBrowserContainer } from './components/AxioBrowser/AxioBrowserContainer';
import { XioMailContainer } from './components/XioMail/XioMailContainer';
import { SocioContainer } from './components/socio/SocioContainer';
import { ApiPortalContainer } from './components/api/ApiPortalContainer';
import { GameXContainer } from './components/gamex/GameXContainer';
import { useRoyalAudio } from './hooks/useRoyalAudio';
import { AmbientAudio } from './components/AmbientAudio';
import { GeminiSparkBackground } from './components/GeminiSparkBackground';
import { AuthGate } from './components/auth/AuthGate';
import { usePresence } from './hooks/usePresence';

const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const playCyberChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.14); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.55);
  } catch {}
};

interface ActiveNotificationToast {
  id?: string;
  title: string;
  message: string;
  creator?: string;
  timestamp?: string;
  targetBlockId?: string;
}

const defaultFallbackData: SiteData = {
  settings: {
    siteTitle: 'AXIOMETIC AI',
    tagline: 'Real-Time Dynamic Systems & Knowledge Publishing',
    bio: 'Dynamic living canvas powered by Vaelourix AXIOMETIC AI.',
    creatorName: 'Axiometic Architect',
    creatorAvatar: '/src/assets/images/avatar_creator_profile_1792207572261.jpg',
    headerBanner: '/src/assets/images/hero_axiometic_workspace_1792207571017.jpg',
    themeAccent: 'blue',
    lastUpdated: new Date().toISOString(),
  },
  blocks: [],
  messages: [],
  uploadedFiles: [],
  formSubmissions: [],
  liveUrls: [],
  broadcasts: [],
};

export default function App() {
  const [currentView, setCurrentView] = useState<'canvas' | 'wri' | 'axio' | 'xio' | 'socio' | 'api' | 'gamex'>('canvas');
  const [viewHistory, setViewHistory] = useState<('canvas' | 'wri' | 'axio' | 'xio' | 'socio' | 'api' | 'gamex')[]>(['canvas']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const navigateToView = useCallback((newView: 'canvas' | 'wri' | 'axio' | 'xio' | 'socio' | 'api' | 'gamex', recordHistory = true) => {
    setCurrentView(newView);
    if (recordHistory) {
      setViewHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        if (next[next.length - 1] !== newView) {
          next.push(newView);
        }
        return next;
      });
      setHistoryIndex((prev) => prev + 1);
    }
  }, [historyIndex]);

  const handleGoBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentView(viewHistory[prevIdx]);
    } else {
      setCurrentView('canvas');
    }
  }, [historyIndex, viewHistory]);

  const handleGoForward = useCallback(() => {
    if (historyIndex < viewHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCurrentView(viewHistory[nextIdx]);
    } else {
      setCurrentView('axio');
    }
  }, [historyIndex, viewHistory]);

  const handleGoHome = useCallback(() => {
    navigateToView('canvas');
  }, [navigateToView]);

  const [siteData, setSiteData] = useState<SiteData>(defaultFallbackData);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [developerPassword, setDeveloperPassword] = useState('');
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [recentlyUpdatedBlockId, setRecentlyUpdatedBlockId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'text' | 'picture' | 'button' | 'link' | 'file'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<ActiveNotificationToast | null>(null);
  const toastTimerRef = useRef<any>(null);
  
  // Modals and dialogs state
  const [isAddChoiceModalOpen, setIsAddChoiceModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<BlockType>('text');
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [activeDynamicButton, setActiveDynamicButton] = useState<ActiveButtonBlock | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Forced Transmission & Geofenced Radius State for all users & non-users
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeForcedBroadcast, setActiveForcedBroadcast] = useState<BroadcastNotification | null>(null);
  const [clientDistanceKm, setClientDistanceKm] = useState<number | null>(null);
  const [isGlobalRadius, setIsGlobalRadius] = useState(false);

  const { playWoodClick, playScratch } = useRoyalAudio();
  const { activeUserCount } = usePresence(isDeveloper);

  useEffect(() => {
    const handleTouchStart = () => playWoodClick();
    const handleMouseMove = (e: MouseEvent) => {
      const velocity = Math.sqrt(e.movementX ** 2 + e.movementY ** 2);
      if (velocity > 10) playScratch(velocity / 50);
    };
    const handleTouchMove = (e: TouchEvent) => {
      playScratch(1);
    };

    window.addEventListener('mousedown', handleTouchStart);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousedown', handleTouchStart);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [playWoodClick, playScratch]);

  // Auto-detect visitor geolocation on load for both authenticated users and non-users
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setClientLocation({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
          });
        },
        () => {
          // Fallback or permission denial: defaults to global delivery
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    }
  }, []);

  const triggerNotification = useCallback((notif: ActiveNotificationToast) => {
    playCyberChime();
    setNotification(notif);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 8500);
  }, []);

  const handleIncomingBroadcast = useCallback((broadcast: BroadcastNotification) => {
    triggerNotification({
      id: broadcast.id,
      title: broadcast.title,
      message: broadcast.message,
      creator: broadcast.creator,
      timestamp: broadcast.timestamp,
      targetBlockId: broadcast.targetBlockId,
    });
  }, [triggerNotification]);

  useEffect(() => {
    const savedPass = sessionStorage.getItem('axiometic_dev_key');
    if (savedPass === 'Developer@AXIOMETIC') {
      setIsDeveloper(true);
    }
  }, []);

  const wsRef = useRef<WebSocket | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/content');
      const json = await res.json();
      if (json.success && json.data) {
        setSiteData(json.data);
      }
    } catch (err) {
      console.error('Failed to load initial site data:', err);
    }
  }, []);

  useEffect(() => {
    fetchContent();

    // 1. Instant Real-Time SSE Stream for Broadcasts & Live State
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'INITIAL_SYNC' && parsed.data) {
            setSiteData(parsed.data);
          } else if (parsed.type === 'NOTIFICATION_EVENT' || parsed.type === 'WORLD_BROADCAST') {
            handleIncomingBroadcast(parsed);
          } else if (parsed.type === 'UPDATE' && parsed.data) {
            setSiteData(parsed.data);
          }
        } catch {}
      };
      eventSource.onerror = () => {
        setIsWsConnected(false);
      };
      eventSource.onopen = () => {
        setIsWsConnected(true);
      };
    } catch {}

    // 2. Continuous Polling Fallback (Every 4 seconds)
    const broadcastPollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/broadcasts');
        const data = await res.json();
        if (data.success && data.activeBroadcast) {
          const latest = data.activeBroadcast;
          const lastSeen = localStorage.getItem('axiometic_last_seen_broadcast');
          if (lastSeen !== latest.id) {
            localStorage.setItem('axiometic_last_seen_broadcast', latest.id);
            handleIncomingBroadcast(latest);
          }
        }
      } catch (e) {}
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(broadcastPollInterval);
    };
  }, [fetchContent, handleIncomingBroadcast]);

  const handleDeveloperAuthenticated = (password: string) => {
    setIsDeveloper(true);
    setDeveloperPassword(password);
    sessionStorage.setItem('axiometic_dev_key', password);
  };

  const handleDeveloperLogout = () => {
    setIsDeveloper(false);
    setDeveloperPassword('');
    sessionStorage.removeItem('axiometic_dev_key');
  };

  const handleOpenManualCreate = (type: BlockType = 'text') => {
    setEditingBlock(null);
    setModalDefaultType(type);
    setIsBlockModalOpen(true);
  };

  const handlePublishBlockToCanvas = async (block: Block): Promise<boolean> => {
    try {
      const res = await fetch('/api/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-developer-password': developerPassword || 'Developer@AXIOMETIC',
        },
        body: JSON.stringify({ block }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSiteData(json.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to publish block to canvas:', err);
      return false;
    }
  };

  const handleVaelourixAction = async (
    prompt: string,
    password?: string,
    fileData?: string | File,
    fileName?: string,
    fileType?: string,
    publish = false
  ): Promise<{ success: boolean; reply: string; block?: any; requiresAuth?: boolean }> => {
    setIsAiGenerating(true);
    try {
      let res: globalThis.Response;
      if (fileData instanceof File) {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('publish', String(publish));
        formData.append('file', fileData);
        if (password || developerPassword) {
          formData.append('password', password || developerPassword);
        }
        res = await fetch('/api/vaelourix/action', {
          method: 'POST',
          headers: {
            ...(password || developerPassword ? { 'x-developer-password': password || developerPassword } : {}),
          },
          body: formData,
        });
      } else {
        res = await fetch('/api/vaelourix/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(password || developerPassword ? { 'x-developer-password': password || developerPassword } : {}),
          },
          body: JSON.stringify({
            prompt,
            publish,
            password: password || developerPassword || undefined,
            fileData,
            fileName,
            fileType,
          }),
        });
      }
      const data = await res.json();
      return {
        success: data.success,
        reply: data.reply || 'Vaelourix executed your request.',
        block: data.block,
      };
    } catch (err: any) {
      return { success: false, reply: `Vaelourix notice: ${err.message}` };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleEditBlock = (block: Block) => {
    setEditingBlock(block);
    setModalDefaultType(block.type);
    setIsBlockModalOpen(true);
  };

  const handleSaveBlock = async (block: Block) => {
    try {
      const res = await fetch('/api/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-developer-password': developerPassword || 'Developer@AXIOMETIC',
        },
        body: JSON.stringify({ block }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSiteData(data.data);
      }
    } catch (err) {
      console.error('Error saving block:', err);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const res = await fetch(`/api/block/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-developer-password': developerPassword || 'Developer@AXIOMETIC',
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSiteData(data.data);
      }
    } catch (err) {
      console.error('Error deleting block:', err);
    }
  };

  const handleClearAllContent = async () => {
    if (!window.confirm('Clear all blocks on the page?')) return;
    try {
      const res = await fetch('/api/blocks/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSiteData(data.data);
      }
    } catch (err) {
      console.error('Failed to clear canvas:', err);
    }
  };

  const handleMoveUp = async (blockId: string) => {
    if (!siteData) return;
    const index = siteData.blocks.findIndex((b) => b.id === blockId);
    if (index <= 0) return;
    const newBlocks = [...siteData.blocks];
    const temp = newBlocks[index - 1];
    newBlocks[index - 1] = newBlocks[index];
    newBlocks[index] = temp;
    try {
      const res = await fetch('/api/blocks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: developerPassword || 'Developer@AXIOMETIC',
          blockIds: newBlocks.map((b) => b.id),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) setSiteData(data.data);
    } catch (err) {}
  };

  const handleMoveDown = async (blockId: string) => {
    if (!siteData) return;
    const index = siteData.blocks.findIndex((b) => b.id === blockId);
    if (index < 0 || index >= siteData.blocks.length - 1) return;
    const newBlocks = [...siteData.blocks];
    const temp = newBlocks[index + 1];
    newBlocks[index + 1] = newBlocks[index];
    newBlocks[index] = temp;
    try {
      const res = await fetch('/api/blocks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: developerPassword || 'Developer@AXIOMETIC',
          blockIds: newBlocks.map((b) => b.id),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) setSiteData(data.data);
    } catch (err) {}
  };

  const handleTogglePin = async (block: Block) => {
    const updated = { ...block, pinned: !block.pinned };
    await handleSaveBlock(updated);
  };

  const handleButtonInteraction = async (blockId: string, action?: string) => {
    try {
      const res = await fetch('/api/button/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId, action }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSiteData(data.data);
      }
    } catch (err) {}
  };

  const handleSubmitDynamicForm = async (
    buttonId: string,
    formType: string,
    formData: Record<string, string>
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/button/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buttonId, formType, formData }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSiteData(data.data);
        return true;
      }
      return !!data.success;
    } catch {
      return false;
    }
  };

  const handleSaveSettings = async (updatedSettings: Partial<SiteSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: developerPassword || 'Developer@AXIOMETIC',
          settings: updatedSettings,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSiteData(data.data);
      }
    } catch (err) {}
  };

  const settings: SiteSettings = siteData?.settings || {
    siteTitle: 'AXIOMETIC AI',
    tagline: 'Real-Time Dynamic Systems & Knowledge Publishing',
    bio: 'Dynamic living canvas powered by Vaelourix AXIOMETIC AI.',
    creatorName: 'Axiometic Architect',
    creatorAvatar: '/src/assets/images/avatar_creator_profile_1792207572261.jpg',
    headerBanner: '/src/assets/images/hero_axiometic_workspace_1792207571017.jpg',
    themeAccent: 'blue',
    lastUpdated: new Date().toISOString(),
  };

  const blocks = siteData?.blocks || [];
  const messages = siteData?.messages || [];
  const uploadedFiles = siteData?.uploadedFiles || [];

  const filteredBlocks = blocks.filter((b) => {
    const matchesFilter = activeFilter === 'all' || b.type === activeFilter;
    const matchesSearch = searchQuery === '' || b.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedBlocks = [...filteredBlocks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  if (!siteData) return null;

  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col selection:bg-gold-accent selection:text-mahogany-900 relative text-ivory overflow-x-hidden font-serif" style={{ backgroundImage: 'url("/src/assets/images/mahogany_wood_texture_1792941904763.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        <div className="absolute inset-0 bg-mahogany-950/60 z-0 pointer-events-none" />
      <GeminiSparkBackground />
      
      {notification && (
        <aside className="fixed top-14 right-4 z-[100] max-w-sm w-full bg-mahogany-900 border-2 border-gold-accent/40 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right-4 brass-border backdrop-blur-xl">
          <div className="flex items-start gap-3">
             <div className="p-2 rounded-lg bg-gold-accent/15 border border-gold-accent/30 text-gold-accent shrink-0">
               <Radio className="w-5 h-5 animate-pulse" />
             </div>
             <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gold-accent uppercase tracking-wider truncate font-serif">{notification.title}</h4>
                  <button 
                    onClick={() => setNotification(null)}
                    className="text-ivory/40 hover:text-gold-accent text-xs p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-ivory/90 leading-relaxed font-sans">{notification.message}</p>
                <span className="text-[9px] text-gold-accent/60 font-mono block pt-1">
                  DISPATCHED BY: {notification.creator || 'AXIOMETIC AI'}
                </span>
             </div>
          </div>
        </aside>
      )}

      <Navbar
        settings={settings}
        isDeveloper={isDeveloper}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        onLogoutDeveloper={handleDeveloperLogout}
        onOpenAddChoiceModal={() => setIsAddChoiceModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenInboxModal={() => setIsInboxModalOpen(true)}
        onOpenFileVaultModal={() => setIsFileUploadModalOpen(true)}
        unreadMessagesCount={messages.length}
        uploadedFilesCount={uploadedFiles.length}
        isWsConnected={isWsConnected}
        onOpenContactModal={() => setIsContactModalOpen(true)}
        onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
        onOpenWRI={() => navigateToView('wri')}
        onOpenCanvas={() => navigateToView('canvas')}
        onOpenAxio={() => navigateToView('axio')}
        onOpenXio={() => navigateToView('xio')}
        onOpenSocio={() => navigateToView('socio')}
        onOpenApiPortal={() => navigateToView('api')}
        onOpenGameX={() => navigateToView('gamex')}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onGoHome={handleGoHome}
        canGoBack={historyIndex > 0 || currentView !== 'canvas'}
        canGoForward={historyIndex < viewHistory.length - 1}
        currentView={currentView}
        broadcastCount={siteData?.broadcasts?.length || 0}
      />

      {isDeveloper && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <DeveloperToolbar
            onOpenCreateModal={handleOpenManualCreate}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenInbox={() => setIsInboxModalOpen(true)}
            onOpenFileVault={() => setIsFileUploadModalOpen(true)}
            onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
            onLogoutDeveloper={handleDeveloperLogout}
            onClearAll={handleClearAllContent}
            messageCount={messages.length}
            filesCount={uploadedFiles.length}
            activeUserCount={activeUserCount}
          />
        </div>
      )}

      <AmbientAudio />

      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {currentView === 'gamex' ? (
            <motion.div key="gamex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col min-h-[calc(100vh-3rem)]">
              <GameXContainer
                onOpenCanvas={() => navigateToView('canvas')}
              />
            </motion.div>
          ) : currentView === 'api' ? (
            <motion.div key="api" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col min-h-[calc(100vh-3rem)]">
              <ApiPortalContainer
                onOpenCanvas={() => navigateToView('canvas')}
                onOpenWri={() => navigateToView('wri')}
                onOpenSocio={() => navigateToView('socio')}
              />
            </motion.div>
          ) : currentView === 'socio' ? (
            <motion.div key="socio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col min-h-[calc(100vh-3rem)]">
              <SocioContainer
                onOpenWriBook={(bookId) => {
                  navigateToView('wri');
                }}
                onOpenCanvas={() => navigateToView('canvas')}
                onOpenWri={() => navigateToView('wri')}
                onOpenAxio={() => navigateToView('axio')}
                onOpenXio={() => navigateToView('xio')}
                books={siteData.publishedBooks || []}
              />
            </motion.div>
          ) : currentView === 'xio' ? (
            <motion.div key="xio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col h-[calc(100vh-3rem)]">
              <XioMailContainer />
            </motion.div>
          ) : currentView === 'axio' ? (
            <motion.div key="axio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
              <AxioBrowserContainer />
            </motion.div>
          ) : currentView === 'wri' ? (
            <motion.div key="wri" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.5 }}>
              <WRIContainer />
            </motion.div>
          ) : (
            <motion.div key="canvas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-7xl mx-auto px-4 py-12 text-center">
              <h1 className="text-7xl sm:text-9xl font-black text-gold-accent uppercase mb-2 drop-shadow-[0_10px_20px_rgba(0,0,0,1)] tracking-tighter">AXIOMETIC</h1>
              <p className="text-base sm:text-lg text-ivory/70 font-serif italic max-w-2xl mx-auto mb-8">
                {settings.tagline}
              </p>

              {/* High-Visibility WRI Studio Feature Banner */}
              <div className="max-w-3xl mx-auto mb-10 p-6 bg-mahogany-900/90 border border-gold-accent/40 rounded-2xl shadow-2xl backdrop-blur-xl brass-border flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gold-accent/15 border border-gold-accent/40 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                    📓
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-gold-accent uppercase tracking-wider font-sans">WRI Studio & Archives</h3>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold-accent text-mahogany-950 font-black font-mono uppercase">Interactive</span>
                    </div>
                    <p className="text-xs text-ivory/80 font-serif italic mt-1">
                      Explore the 3D interactive bookshelf, flip manuscript pages, and discover global books.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigateToView('wri')}
                  className="shrink-0 px-6 py-3 bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>ENTER WRI STUDIO</span>
                  <span>→</span>
                </button>
              </div>

              {/* Canvas Interactive Controls Bar */}
              <div className="max-w-5xl mx-auto mb-10 p-4 bg-mahogany-900/80 border border-gold-accent/25 rounded-2xl backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-72 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
                  <input
                    type="text"
                    placeholder="Search canvas artifacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-mahogany-950/80 border border-gold-accent/20 rounded-xl pl-10 pr-4 py-2 text-xs text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-colors font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ivory/40 hover:text-ivory"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto">
                  {(['all', 'text', 'picture', 'button', 'link', 'file'] as const).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setActiveFilter(filterType)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        activeFilter === filterType
                          ? 'bg-gold-accent text-mahogany-950 shadow-md font-bold'
                          : 'bg-mahogany-950/60 text-ivory/60 hover:text-gold-accent hover:bg-gold-accent/10 border border-gold-accent/10'
                      }`}
                    >
                      {filterType === 'button' ? 'action' : filterType}
                    </button>
                  ))}
                </div>

                {/* Add Content Button */}
                <button
                  onClick={() => setIsAddChoiceModalOpen(true)}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 bg-gold-accent text-mahogany-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-gold-accent/90 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Block</span>
                </button>
              </div>
              
              {sortedBlocks.length === 0 ? (
                <div className="max-w-md mx-auto my-16 p-8 bg-mahogany-900/60 border border-gold-accent/20 rounded-2xl text-center">
                  <Sparkles className="w-8 h-8 text-gold-accent mx-auto mb-3" />
                  <h3 className="text-base font-bold text-gold-accent uppercase tracking-wider">No Blocks Found</h3>
                  <p className="text-xs text-ivory/60 font-serif italic mt-1 mb-6">
                    {searchQuery ? `No artifacts matching "${searchQuery}".` : 'The canvas is ready for your first artifact.'}
                  </p>
                  <button
                    onClick={() => setIsAddChoiceModalOpen(true)}
                    className="px-5 py-2.5 bg-gold-accent text-mahogany-950 font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-all shadow-lg"
                  >
                    Create Canvas Block
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-8 mb-32">
                  {sortedBlocks.map((block) => (
                    <BlockCard
                      key={block.id}
                      block={block}
                      isDeveloper={isDeveloper}
                      onEdit={() => handleEditBlock(block)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onMoveUp={() => handleMoveUp(block.id)}
                      onMoveDown={() => handleMoveDown(block.id)}
                      onTogglePin={() => handleTogglePin(block)}
                      onTriggerContactModal={() => setIsContactModalOpen(true)}
                      onTriggerDynamicAlert={(btnBlock) => setActiveDynamicButton(btnBlock)}
                      onTriggerDynamicForm={(btnBlock) => setActiveDynamicButton(btnBlock)}
                      onButtonInteraction={handleButtonInteraction}
                      isJustUpdated={recentlyUpdatedBlockId === block.id}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals & Dialogs */}
      <DeveloperUnlockModal 
        isOpen={isUnlockModalOpen} 
        onClose={() => setIsUnlockModalOpen(false)} 
        onSuccess={handleDeveloperAuthenticated} 
      />

      <BlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onSave={handleSaveBlock}
        editingBlock={editingBlock}
        defaultType={modalDefaultType}
        developerPassword={developerPassword || 'Developer@AXIOMETIC'}
      />

      <DynamicButtonActionModal
        buttonBlock={activeDynamicButton}
        onClose={() => setActiveDynamicButton(null)}
        onSubmitForm={handleSubmitDynamicForm}
      />

      <AddContentChoiceModal
        isOpen={isAddChoiceModalOpen}
        onClose={() => setIsAddChoiceModalOpen(false)}
        onSelectManual={handleOpenManualCreate}
        onSelectAi={async (prompt) => {
          return await handleVaelourixAction(prompt, undefined, undefined, undefined, undefined, true);
        }}
        isAiGenerating={isAiGenerating}
      />

      <SiteSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onClearAll={handleClearAllContent}
      />

      <InboxModal
        isOpen={isInboxModalOpen}
        onClose={() => setIsInboxModalOpen(false)}
        messages={messages}
      />

      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onClose={() => setIsFileUploadModalOpen(false)}
        developerPassword={developerPassword || 'Developer@AXIOMETIC'}
        uploadedFiles={uploadedFiles}
        onFileUploadedToCanvas={async (newBlock) => {
          await handlePublishBlockToCanvas(newBlock);
        }}
      />

      <ContactTransmissionModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        creatorName={settings.creatorName}
      />

      <NotificationBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        developerPassword={developerPassword || 'Developer@AXIOMETIC'}
        broadcasts={siteData?.broadcasts || []}
        onTriggerToast={triggerNotification}
        onBroadcastSuccess={() => fetchContent()}
      />

      {/* Embedded Vaelourix AXIOMETIC AI Assistant */}
      <VaelourixAssistantWidget 
        onExecuteAction={handleVaelourixAction} 
        onPublishBlock={handlePublishBlockToCanvas}
        isDeveloper={isDeveloper} 
      />
    </div>
  </AuthGate>
  );
}
