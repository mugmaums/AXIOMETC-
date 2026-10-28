import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Send,
  Sparkles,
  CheckCircle2,
  Users,
  BellRing,
  Globe,
  Loader2,
  Copy,
  Check,
  Rss,
  Volume2,
  Share2,
  Clock,
  ExternalLink,
  Flame,
  Layers,
  MapPin,
  Compass,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import type { BroadcastNotification } from '../types';

interface NotificationBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerPassword?: string;
  broadcasts?: BroadcastNotification[];
  onTriggerToast?: (notif: { id?: string; title: string; message: string; creator?: string; timestamp?: string; targetBlockId?: string; radiusKm?: number; location?: any; forceTransmission?: boolean; priority?: string }) => void;
  onBroadcastSuccess?: (broadcast: any) => void;
}

export const NotificationBroadcastModal: React.FC<NotificationBroadcastModalProps> = ({
  isOpen,
  onClose,
  developerPassword = '',
  broadcasts: propBroadcasts = [],
  onTriggerToast,
  onBroadcastSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'feed'>('compose');
  const [title, setTitle] = useState('New Creation by AXIOMETIC');
  const [message, setMessage] = useState(
    'A new creation has been materialized and deployed live by AXIOMETIC. Explore the updated interactive blocks now.'
  );
  const [creatorName, setCreatorName] = useState('AXIOMETIC AI');
  const [radiusKm, setRadiusKm] = useState<number>(0); // 0 = Global (All Users & Non-Users)
  const [epicenter, setEpicenter] = useState<{ lat: number; lng: number; name: string }>({
    lat: 37.7749,
    lng: -122.4194,
    name: 'San Francisco, CA (Default Hub)',
  });
  const [isLocating, setIsLocating] = useState(false);
  const [forceTransmission, setForceTransmission] = useState(true);
  const [priority, setPriority] = useState<'normal' | 'high' | 'critical'>('high');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [liveBroadcasts, setLiveBroadcasts] = useState<BroadcastNotification[]>(propBroadcasts);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Auto-detect current geolocation if available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setEpicenter({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            name: `Current Position (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`,
          });
        },
        () => {
          // Keep default if permission denied
        },
        { timeout: 6000 }
      );
    }
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorStatus('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEpicenter({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
          name: `GPS Detected (${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°)`,
        });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setErrorStatus(`GPS detection note: ${err.message}. Using manual epicenter.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Sync prop broadcasts
  useEffect(() => {
    if (propBroadcasts && propBroadcasts.length > 0) {
      setLiveBroadcasts(propBroadcasts);
    }
  }, [propBroadcasts]);

  // Fetch fresh broadcasts when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchBroadcasts = async () => {
      setIsLoadingFeed(true);
      try {
        const res = await fetch('/api/broadcasts');
        const data = await res.json();
        if (data.success && Array.isArray(data.broadcasts)) {
          setLiveBroadcasts(data.broadcasts);
        }
      } catch (e) {
        console.error('Failed to load broadcasts feed:', e);
      } finally {
        setIsLoadingFeed(false);
      }
    };

    fetchBroadcasts();
  }, [isOpen]);

  if (!isOpen) return null;

  // Futuristic cyber synthesizer chime for broadcast confirmation and test
  const playCyberChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.3); // D6

      gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);
    } catch {}
  };

  const handleTestNotification = () => {
    playCyberChime();
    if (onTriggerToast) {
      onTriggerToast({
        id: `test_${Date.now()}`,
        title: title.trim() || 'AXIOMETIC System Broadcast',
        message: message.trim() || 'This is a real-time live test of the holographic notification alert.',
        creator: creatorName || 'AXIOMETIC AI',
        timestamp: new Date().toISOString(),
      });
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title || 'AXIOMETIC Live Alert', {
            body: message || 'Broadcasting alert test.',
            icon: '/src/assets/images/axiometic_holographic_logo_1792234516124.jpg',
          });
        } catch {}
      } else if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorStatus(null);
    setSuccessStatus(null);

    try {
      const res = await fetch('/api/admin/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${developerPassword || 'Developer@AXIOMETIC'}`,
          'x-developer-password': developerPassword || 'Developer@AXIOMETIC',
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          creator: creatorName.trim() || 'AXIOMETIC AI',
          password: developerPassword || 'Developer@AXIOMETIC',
          radiusKm,
          location: epicenter,
          forceTransmission,
          priority,
          type: priority === 'critical' ? 'emergency' : 'creation',
        }),
      });

      const data = await res.json();
      if (data.success && data.broadcast) {
        playCyberChime();
        setSuccessStatus(
          radiusKm > 0
            ? `Transmitted & forced onto all screens within ${radiusKm}km radius!`
            : 'Transmitted worldwide to all users & non-users globally!'
        );
        
        // Update local list
        setLiveBroadcasts((prev) => [data.broadcast, ...prev.filter((b) => b.id !== data.broadcast.id)]);

        if (onBroadcastSuccess) {
          onBroadcastSuccess(data.broadcast);
        }
        if (onTriggerToast) {
          onTriggerToast({
            id: data.broadcast.id,
            title: data.broadcast.title,
            message: data.broadcast.message,
            creator: data.broadcast.creator,
            timestamp: data.broadcast.timestamp,
            targetBlockId: data.broadcast.targetBlockId,
            radiusKm: data.broadcast.radiusKm,
            location: data.broadcast.location,
            forceTransmission: data.broadcast.forceTransmission,
            priority: data.broadcast.priority,
          });
        }

        setTimeout(() => {
          setSuccessStatus(null);
        }, 3000);
      } else {
        setErrorStatus(data.message || 'Broadcast transmission failed.');
      }
    } catch (err: any) {
      setErrorStatus(err.message || 'Network error broadcasting notification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = (presetTitle: string, presetMessage: string) => {
    setTitle(presetTitle);
    setMessage(presetMessage);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/#canvas`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const copyFormattedBroadcast = () => {
    const formatted = `🌐 WORLD TRANSMISSION FROM AXIOMETIC AI 🌐\n\n✨ ${title}\n${message}\n\n📍 Experience live on the canvas: ${window.location.origin}/#canvas`;
    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 text-[#F8FAFC] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Holographic Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-sm">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#F8FAFC] tracking-wide">World Broadcast Center</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-300 font-semibold">
                  LIVE STREAM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Broadcast notifications to active sessions, Chrome subscribers & future visitors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#F8FAFC] rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-4 mb-4 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'compose'
                ? 'bg-[#2563EB] text-[#F8FAFC] shadow-sm shadow-blue-500/25'
                : 'text-slate-400 hover:text-[#F8FAFC]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transmit New</span>
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'feed'
                ? 'bg-[#2563EB] text-[#F8FAFC] shadow-sm shadow-blue-500/25'
                : 'text-slate-400 hover:text-[#F8FAFC]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>World Transmissions Feed ({liveBroadcasts.length})</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'compose' ? (
            <>
              {/* Universal Delivery Matrix Info & Audio Test */}
              <div className="p-3.5 bg-sky-950/30 border border-sky-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Real-Time Broadcast Pipeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestNotification}
                      className="px-2.5 py-1 text-[11px] font-semibold text-cyan-300 hover:text-white bg-sky-900/50 hover:bg-sky-800/60 border border-sky-400/30 rounded-lg flex items-center gap-1.5 transition-colors"
                      title="Test holographic alert & chime sound"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Test Alert & Audio</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Dispatches immediately over WebSockets & SSE to all open tabs, persists in database for newly arriving visitors, and triggers desktop notifications on Chrome.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] text-sky-300 font-mono">
                  <div className="p-1.5 rounded bg-sky-900/40 border border-sky-500/20 text-center">
                    <span className="block text-white font-bold">1. Active Sessions</span>
                    <span>WebSocket Push</span>
                  </div>
                  <div className="p-1.5 rounded bg-sky-900/40 border border-sky-500/20 text-center">
                    <span className="block text-white font-bold">2. Desktop</span>
                    <span>Chrome Push</span>
                  </div>
                  <div className="p-1.5 rounded bg-sky-900/40 border border-sky-500/20 text-center">
                    <span className="block text-white font-bold">3. Memory</span>
                    <span>30-Day Storage</span>
                  </div>
                  <div className="p-1.5 rounded bg-sky-900/40 border border-sky-500/20 text-center">
                    <span className="block text-white font-bold">4. Syndication</span>
                    <span>Direct Share</span>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                  Quick Creation Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset(
                        'New Creation by AXIOMETIC',
                        'A new creation has been materialized and deployed live by AXIOMETIC. Explore the updated interactive blocks now.'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/40 rounded-md text-slate-300 transition-colors"
                  >
                    Creation Release
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset(
                        'Neural Matrix Expansion by AXIOMETIC',
                        'AXIOMETIC has orchestrated fresh analytical architectures and interactive components directly on the living canvas.'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/40 rounded-md text-slate-300 transition-colors"
                  >
                    Matrix Expansion
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset(
                        'Autonomous System Upgrade by AXIOMETIC',
                        'New high-performance blocks and tools deployed with real-time collaborative synchronization worldwide.'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/40 rounded-md text-slate-300 transition-colors"
                  >
                    System Upgrade
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset(
                        'Vaelourix Astra AI Synthesis',
                        'Vaelourix Astra generated production blocks with 30-day Chrome live URLs and high-weight reasoning.'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/40 rounded-md text-slate-300 transition-colors"
                  >
                    Astra Synthesis
                  </button>
                </div>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. New Creation by AXIOMETIC"
                    className="w-full px-3.5 py-2.5 bg-[#050811] border border-slate-700 focus:border-sky-400 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Transmission Message
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Describe what has been created by AXIOMETIC..."
                    className="w-full px-3.5 py-2.5 bg-[#050811] border border-slate-700 focus:border-sky-400 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 leading-relaxed font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Broadcasting Entity / Sender Label
                  </label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="AXIOMETIC AI"
                    className="w-full px-3.5 py-2 bg-[#050811] border border-slate-700 focus:border-sky-400 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 font-sans"
                  />
                </div>

                {/* Geofence Radius & Forced Transmission Section */}
                <div className="p-4 bg-gradient-to-br from-[#07132e]/90 to-[#04091a]/95 border border-sky-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white tracking-wide">
                        Transmission Radius & Forced Delivery
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-400/30 font-semibold">
                      USERS & NON-USERS
                    </span>
                  </div>

                  {/* Radius Preset Pills */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                      Target Radius:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {[
                        { label: '🌐 Global', km: 0, desc: 'All Users & Non-Users' },
                        { label: '🎯 5 km', km: 5, desc: 'Immediate Vicinity' },
                        { label: '🏙️ 25 km', km: 25, desc: 'Metro City' },
                        { label: '🗺️ 100 km', km: 100, desc: 'Regional' },
                        { label: '📡 500 km', km: 500, desc: 'State / Province' },
                      ].map((preset) => (
                        <button
                          key={preset.km}
                          type="button"
                          onClick={() => setRadiusKm(preset.km)}
                          className={`p-2 rounded-lg text-left transition-all border ${
                            radiusKm === preset.km
                              ? 'bg-blue-600/30 border-cyan-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.25)] font-bold'
                              : 'bg-neutral-900/80 border-neutral-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="block text-xs">{preset.label}</span>
                          <span className="block text-[9px] text-slate-400 font-mono">{preset.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom slider when not global */}
                    {radiusKm > 0 && (
                      <div className="mt-2.5 p-2.5 bg-neutral-950/60 rounded-lg border border-neutral-800 flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">Radius:</span>
                        <input
                          type="range"
                          min="1"
                          max="1000"
                          value={radiusKm}
                          onChange={(e) => setRadiusKm(Number(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-cyan-300 min-w-[65px] text-right">
                          {radiusKm} km
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Epicenter Coordinates & GPS Detection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>Broadcast Epicenter:</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2"
                      >
                        {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : '📍 Detect My GPS'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={epicenter.name}
                        onChange={(e) => setEpicenter({ ...epicenter, name: e.target.value })}
                        placeholder="Location Name / Landmark"
                        className="w-full px-3 py-1.5 bg-[#050811] border border-slate-700 focus:border-sky-400 rounded-lg text-xs text-white font-sans"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.0001"
                          value={epicenter.lat}
                          onChange={(e) => setEpicenter({ ...epicenter, lat: Number(e.target.value) })}
                          placeholder="Latitude"
                          className="w-1/2 px-2.5 py-1.5 bg-[#050811] border border-slate-700 focus:border-sky-400 rounded-lg text-xs text-white font-mono"
                        />
                        <input
                          type="number"
                          step="0.0001"
                          value={epicenter.lng}
                          onChange={(e) => setEpicenter({ ...epicenter, lng: Number(e.target.value) })}
                          placeholder="Longitude"
                          className="w-1/2 px-2.5 py-1.5 bg-[#050811] border border-slate-700 focus:border-sky-400 rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Forced Transmission & Priority Settings */}
                  <div className="pt-2 border-t border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={forceTransmission}
                        onChange={(e) => setForceTransmission(e.target.checked)}
                        className="w-4 h-4 rounded text-cyan-500 bg-neutral-900 border-neutral-700 focus:ring-0 cursor-pointer"
                      />
                      <span className="font-semibold text-white">
                        Force Screen Transmission Modal onto Recipients in Radius
                      </span>
                    </label>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPriority('high')}
                        className={`px-2 py-1 text-[10px] font-mono rounded font-bold transition-colors ${
                          priority === 'high'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        HIGH PRIORITY
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriority('critical')}
                        className={`px-2 py-1 text-[10px] font-mono rounded font-bold transition-colors ${
                          priority === 'critical'
                            ? 'bg-red-950 text-red-300 border border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🚨 EMERGENCY
                      </button>
                    </div>
                  </div>
                </div>

                {/* Non-Visitors & Share Tools */}
                <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-sky-300 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Reach Subscribers & Outside Visitors:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={copyShareLink}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-slate-200 rounded-md transition-colors"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Direct World Link'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={copyFormattedBroadcast}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-slate-200 rounded-md transition-colors"
                    >
                      {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Sparkles className="w-3 h-3 text-cyan-400" />}
                      <span>{copiedText ? 'Dispatched Text Copied!' : 'Copy Formatted Text'}</span>
                    </button>
                    <a
                      href="/api/broadcasts/feed"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-slate-300 rounded-md transition-colors"
                    >
                      <Rss className="w-3 h-3 text-amber-400" />
                      <span>RSS Feed</span>
                    </a>
                  </div>
                </div>

                {successStatus && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{successStatus}</span>
                  </div>
                )}

                {errorStatus && (
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                    {errorStatus}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Preview Alert</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !title.trim() || !message.trim()}
                      className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-[#F8FAFC] bg-[#2563EB] hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-all shadow-sm shadow-blue-500/25 active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Broadcasting Worldwide...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Transmit Broadcast</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            /* Broadcasts Feed Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Recent transmissions dispatched to all world visitors</span>
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoadingFeed(true);
                    try {
                      const res = await fetch('/api/broadcasts');
                      const data = await res.json();
                      if (data.success && Array.isArray(data.broadcasts)) {
                        setLiveBroadcasts(data.broadcasts);
                      }
                    } catch {}
                    setIsLoadingFeed(false);
                  }}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  {isLoadingFeed ? <Loader2 className="w-3 h-3 animate-spin" /> : '↻ Refresh'}
                </button>
              </div>

              {liveBroadcasts.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs">
                  <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <span>No broadcasts dispatched yet. Use the Transmit tab to broadcast to all visitors.</span>
                </div>
              ) : (
                liveBroadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-sky-500/20 hover:border-sky-400/40 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-cyan-300 border border-sky-400/30">
                          {b.creator || 'AXIOMETIC AI'}
                        </span>
                        <h4 className="text-xs font-bold text-white">{b.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-sky-100/80 leading-relaxed">{b.message}</p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onTriggerToast) {
                              onTriggerToast({
                                id: b.id,
                                title: b.title,
                                message: b.message,
                                creator: b.creator,
                                timestamp: b.timestamp,
                                targetBlockId: b.targetBlockId,
                              });
                            }
                            playCyberChime();
                          }}
                          className="text-cyan-400 hover:text-cyan-200 underline underline-offset-2 flex items-center gap-1 font-mono text-[10px]"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Re-test Alert</span>
                        </button>
                      </div>

                      {b.targetBlockId && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            const el = document.getElementById(b.targetBlockId!);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-sky-300 hover:text-white flex items-center gap-1 font-mono text-[10px] underline underline-offset-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Jump to Content</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
