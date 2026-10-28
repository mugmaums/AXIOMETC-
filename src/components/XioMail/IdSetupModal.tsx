import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { XioUserProfile } from './types';
import { auth } from '../../firebase';

interface IdSetupModalProps {
  onComplete: (profile: XioUserProfile) => void;
  initialProfile?: XioUserProfile | null;
}

export const IdSetupModal: React.FC<IdSetupModalProps> = ({ onComplete, initialProfile }) => {
  const user = auth.currentUser;
  const defaultEmail = user?.email || 'mugmaums@gmail.com';
  const autoHandle = defaultEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');

  const [username, setUsername] = useState(
    initialProfile?.axiometicId.replace('@axiometic', '') || autoHandle || 'user'
  );
  const [displayName, setDisplayName] = useState(
    initialProfile?.displayName || user?.displayName || autoHandle || 'Scholar'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    const profile: XioUserProfile = {
      axiometicId: `${cleanUsername}@axiometic`,
      displayName: displayName.trim() || 'Axiometic Scholar',
      avatarUrl: user?.photoURL || ''
    };
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-mahogany-950 border border-gold-accent/40 rounded-2xl max-w-md w-full p-8 shadow-2xl brass-border animate-in fade-in zoom-in-95 text-ivory">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gold-accent/20 border border-gold-accent/40 flex items-center justify-center text-gold-accent text-3xl mb-3 shadow-inner">
            ✉️
          </div>
          <h2 className="text-2xl font-black text-gold-accent uppercase tracking-tight">Configure XIO ID</h2>
          <p className="text-xs text-ivory/70 font-serif italic mt-1">
            Secure decentralized messaging on the AXIOMETIC network. Linked to your verified session.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
              AXIOMETIC Handle
            </label>
            <div className="flex items-center rounded-xl bg-mahogany-900 border border-gold-accent/30 overflow-hidden focus-within:border-gold-accent">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full px-4 py-3 bg-transparent text-sm text-ivory focus:outline-none font-mono"
              />
              <span className="px-4 py-3 bg-mahogany-950 text-gold-accent font-mono text-xs font-bold border-l border-gold-accent/20">
                @axiometic
              </span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Scholar"
              className="w-full px-4 py-3 rounded-xl bg-mahogany-900 border border-gold-accent/30 text-sm text-ivory focus:outline-none focus:border-gold-accent font-serif"
            />
          </div>

          <div className="p-3 rounded-xl bg-gold-accent/10 border border-gold-accent/20 flex items-center gap-3 text-xs text-gold-accent">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>Encrypted transmission via @axiometic decentralized nodes.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer mt-2"
          >
            Save XIO ID
          </button>
        </form>
      </div>
    </div>
  );
};
