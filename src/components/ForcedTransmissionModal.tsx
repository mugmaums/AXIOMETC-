import React, { useEffect, useState } from 'react';
import {
  Radio,
  X,
  Volume2,
  VolumeX,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Radar
} from 'lucide-react';
import type { BroadcastNotification } from '../types';
import { formatDistance } from '../utils/geoUtils';

interface ForcedTransmissionModalProps {
  broadcast: BroadcastNotification | null;
  isOpen: boolean;
  onClose: () => void;
  clientDistanceKm: number | null;
  isGlobalRadius?: boolean;
  onJumpToBlock?: (blockId: string) => void;
  onOpenFeed?: () => void;
}

export const ForcedTransmissionModal: React.FC<ForcedTransmissionModalProps> = ({
  broadcast,
  isOpen,
  onClose,
  clientDistanceKm,
  isGlobalRadius = false,
  onJumpToBlock,
  onOpenFeed,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Play audio alarm on initial open if not muted
  useEffect(() => {
    if (!isOpen || !broadcast || isMuted) return;

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Emergency dual-tone cyber warble
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // 880Hz (A5) -> 1320Hz (E6) warble
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.36);
      osc1.frequency.exponentialRampToValueAtTime(1174, now + 0.54);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(660, now + 0.36);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }, [isOpen, broadcast, isMuted]);

  if (!isOpen || !broadcast) return null;

  const copyBroadcast = () => {
    const text = `🚨 FORCED TRANSMISSION ALERT 🚨\nFrom: ${broadcast.creator}\nTitle: ${broadcast.title}\nMessage: ${broadcast.message}\nTimestamp: ${new Date(broadcast.timestamp).toLocaleString()}\nTarget: ${window.location.origin}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  const isEmergency = broadcast.type === 'emergency' || broadcast.priority === 'critical';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background Strobe Ambient Glow */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-40 transition-opacity ${
          isEmergency
            ? 'bg-[radial-gradient(ellipse_at_center,_rgba(239,68,68,0.25)_0%,_transparent_70%)]'
            : 'bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.25)_0%,_transparent_70%)]'
        }`}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="forced-transmission-title"
        className={`relative w-full max-w-2xl bg-[#0F172A] rounded-2xl shadow-2xl overflow-hidden border ${
          isEmergency
            ? 'border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.35)]'
            : 'border-slate-700 shadow-2xl shadow-black/80 ring-1 ring-blue-500/30'
        } text-[#F8FAFC] flex flex-col`}
      >
        {/* Animated Top Strobe Bar */}
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${
            isEmergency
              ? 'from-red-600 via-amber-400 to-red-600 animate-pulse'
              : 'from-[#2563EB] via-blue-400 to-[#2563EB] animate-pulse'
          }`}
        />

        {/* Header with Radar Icon & Zone Telemetry */}
        <div className="p-5 sm:p-6 border-b border-slate-700/80 flex items-start justify-between gap-4 bg-slate-800/90">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-xl shrink-0 relative overflow-hidden ${
                isEmergency
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
              }`}
            >
              {/* Radar pulse rings */}
              <div className="absolute inset-0 rounded-xl animate-ping opacity-25 bg-current pointer-events-none" />
              <Radio className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded tracking-widest uppercase ${
                    isEmergency
                      ? 'bg-red-950 text-red-300 border border-red-500/50'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-400/50'
                  }`}
                >
                  FORCED TRANSMISSION BROADCAST
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-sky-300 border border-sky-400/30">
                  ALL RECIPIENTS IN RADIUS
                </span>
                {broadcast.timestamp && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(broadcast.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                )}
              </div>

              <h2
                id="forced-transmission-title"
                className="text-lg sm:text-xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2"
              >
                <span>{broadcast.title}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title={isMuted ? 'Unmute Audio Alert' : 'Mute Alert'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Acknowledge and Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Geofence & Proximity Telemetry Banner */}
        <div className="px-5 sm:px-6 py-3 bg-[#050a17] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">
              {isGlobalRadius
                ? '🌐 GLOBAL TRANSMISSION · ALL RECIPIENTS REACHED'
                : '🎯 INSIDE TRANSMISSION RADIUS'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            {broadcast.radiusKm && broadcast.radiusKm > 0 ? (
              <span className="flex items-center gap-1 text-sky-300">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Radius Perimeter: {broadcast.radiusKm} km</span>
              </span>
            ) : (
              <span className="text-sky-300">Radius: Unlimited (Global)</span>
            )}

            {clientDistanceKm !== null && (
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Distance: {formatDistance(clientDistanceKm)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Transmission Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Broadcaster Info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xs text-white">
                AX
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-mono">BROADCASTING ENTITY</p>
                <p className="text-xs font-bold text-white">{broadcast.creator || 'AXIOMETIC AI'}</p>
              </div>
            </div>

            {broadcast.location?.name && (
              <div className="text-right">
                <p className="text-[11px] text-slate-400 font-mono">EPICENTER</p>
                <p className="text-xs text-cyan-300 font-semibold">{broadcast.location.name}</p>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-sky-400/20 text-slate-100 text-sm leading-relaxed whitespace-pre-line font-sans shadow-inner">
            {broadcast.message}
          </div>

          {/* Quick Share and Verification Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyBroadcast}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-mono">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Copy Transmission</span>
                  </>
                )}
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              Forced Delivery ID: {broadcast.id}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-[#060a16] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {broadcast.targetBlockId && onJumpToBlock && (
              <button
                type="button"
                onClick={() => {
                  onJumpToBlock(broadcast.targetBlockId!);
                  onClose();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-950 hover:bg-sky-900 text-cyan-300 border border-sky-400/30 text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span>Jump to Canvas Block</span>
              </button>
            )}

            {onOpenFeed && (
              <button
                type="button"
                onClick={() => {
                  onOpenFeed();
                  onClose();
                }}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                World Transmissions Feed
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#F8FAFC] shadow-lg transition-all active:scale-95 ${
              isEmergency
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                : 'bg-[#2563EB] hover:bg-blue-500 shadow-blue-600/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Acknowledge Transmission</span>
          </button>
        </div>
      </div>
    </div>
  );
};
