import React, { useState } from 'react';
import { X, Check, ShieldCheck, User, AtSign, Globe, Phone, MapPin, Building, Sparkles } from 'lucide-react';
import type { SocioProfile } from './types';
import { motion } from 'framer-motion';

interface SocioProfileModalProps {
  profile: SocioProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<SocioProfile>) => void;
}

export const SocioProfileModal: React.FC<SocioProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [handlePrefix, setHandlePrefix] = useState(() => {
    return profile.axiometicId.replace(/@axiometic$/, '');
  });
  const [bio, setBio] = useState(profile.bio);
  const [companyName, setCompanyName] = useState(profile.companyName || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || '');
  const [officialAddress, setOfficialAddress] = useState(profile.officialAddress || '');
  const [contactNumber, setContactNumber] = useState(profile.contactNumber || '');
  const [accountType, setAccountType] = useState(profile.accountType || 'personal');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrefix = handlePrefix.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    if (!cleanPrefix) {
      setError('AXIOMETIC ID handle prefix is required.');
      return;
    }

    if (accountType === 'business') {
      if (!companyName.trim() || !websiteUrl.trim() || !officialAddress.trim() || !contactNumber.trim()) {
        setError('For Business Accounts: Company name, website URL, official address, and contact number are required.');
        return;
      }
    }

    onSave({
      displayName: displayName.trim(),
      axiometicId: `${cleanPrefix}@axiometic`,
      bio: bio.trim(),
      accountType,
      companyName: companyName.trim(),
      websiteUrl: websiteUrl.trim(),
      officialAddress: officialAddress.trim(),
      contactNumber: contactNumber.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-mahogany-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-mahogany-900 border-2 border-gold-accent/40 rounded-2xl shadow-2xl brass-border text-ivory overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-mahogany-950 to-mahogany-900 border-b border-gold-accent/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold-accent/20 border border-gold-accent/40 flex items-center justify-center text-gold-accent font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gold-accent font-serif">Socio/X Profile & AXIOMETIC ID</h3>
              <p className="text-[10px] text-ivory/50 font-mono">Auto-transferred credentials with custom handle editing</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-ivory/40 hover:text-gold-accent rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Account Type Selector */}
          <div>
            <label className="text-xs font-bold text-gold-accent/90 block mb-1.5 uppercase font-mono tracking-wider">
              Profile Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['personal', 'creator', 'business'] as const).map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setAccountType(type)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    accountType === type 
                      ? 'bg-gold-accent text-mahogany-950 shadow-md font-black' 
                      : 'bg-black/30 text-ivory/60 hover:text-gold-accent border border-gold-accent/20'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-xs font-bold text-gold-accent/90 block mb-1 font-mono uppercase tracking-wider">
              Display Name
            </label>
            <input 
              type="text" 
              required
              value={displayName} 
              onChange={e => setDisplayName(e.target.value)} 
              className="w-full bg-mahogany-950 border border-gold-accent/30 rounded-xl px-3.5 py-2 text-xs text-ivory focus:outline-none focus:border-gold-accent font-serif"
            />
          </div>

          {/* AXIOMETIC ID Handle (Auto-generated with edit option) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gold-accent/90 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-gold-accent" />
                <span>AXIOMETIC ID Handle</span>
              </label>
              <span className="text-[10px] text-ivory/50 font-mono">Editable Network Identifier</span>
            </div>
            <div className="flex items-center bg-mahogany-950 border border-gold-accent/30 rounded-xl overflow-hidden focus-within:border-gold-accent">
              <input 
                type="text" 
                required
                value={handlePrefix} 
                onChange={e => {
                  setHandlePrefix(e.target.value);
                  setError('');
                }} 
                placeholder="yourhandle"
                className="flex-1 bg-transparent px-3.5 py-2 text-xs text-ivory font-mono focus:outline-none"
              />
              <span className="px-3 py-2 bg-gold-accent/15 text-gold-accent font-mono text-xs font-bold border-l border-gold-accent/20">
                @axiometic
              </span>
            </div>
            <p className="text-[10px] text-ivory/50 italic mt-1 font-serif">
              This identifier binds your books, messages, and social posts across all AXIOMETIC nodes.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-gold-accent/90 block mb-1 font-mono uppercase tracking-wider">
              Bio / Motto
            </label>
            <textarea 
              rows={2} 
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              placeholder="Tell the AXIOMETIC community about your craft..."
              className="w-full bg-mahogany-950 border border-gold-accent/30 rounded-xl p-3 text-xs text-ivory focus:outline-none focus:border-gold-accent font-serif resize-none"
            />
          </div>

          {/* Business Details (If Business selected) */}
          {accountType === 'business' && (
            <div className="p-3.5 rounded-xl bg-black/30 border border-gold-accent/20 space-y-3">
              <span className="text-[10px] font-bold text-gold-accent font-mono uppercase tracking-widest block border-b border-gold-accent/10 pb-1">
                Required Business Credentials
              </span>

              <div>
                <label className="text-[11px] text-ivory/70 block mb-1 font-serif">Company Name *</label>
                <input 
                  type="text" 
                  required
                  value={companyName} 
                  onChange={e => setCompanyName(e.target.value)} 
                  className="w-full bg-mahogany-950 border border-gold-accent/25 rounded-lg px-3 py-1.5 text-xs text-ivory focus:outline-none focus:border-gold-accent"
                />
              </div>

              <div>
                <label className="text-[11px] text-ivory/70 block mb-1 font-serif">Official Website URL *</label>
                <input 
                  type="url" 
                  required
                  value={websiteUrl} 
                  onChange={e => setWebsiteUrl(e.target.value)} 
                  className="w-full bg-mahogany-950 border border-gold-accent/25 rounded-lg px-3 py-1.5 text-xs text-ivory focus:outline-none focus:border-gold-accent"
                />
              </div>

              <div>
                <label className="text-[11px] text-ivory/70 block mb-1 font-serif">Official Address *</label>
                <input 
                  type="text" 
                  required
                  value={officialAddress} 
                  onChange={e => setOfficialAddress(e.target.value)} 
                  className="w-full bg-mahogany-950 border border-gold-accent/25 rounded-lg px-3 py-1.5 text-xs text-ivory focus:outline-none focus:border-gold-accent"
                />
              </div>

              <div>
                <label className="text-[11px] text-ivory/70 block mb-1 font-serif">Contact Number *</label>
                <input 
                  type="tel" 
                  required
                  value={contactNumber} 
                  onChange={e => setContactNumber(e.target.value)} 
                  className="w-full bg-mahogany-950 border border-gold-accent/25 rounded-lg px-3 py-1.5 text-xs text-ivory focus:outline-none focus:border-gold-accent"
                />
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gold-accent/20">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-xl text-xs font-bold text-ivory/60 hover:text-ivory transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 rounded-xl bg-gold-accent text-mahogany-950 font-black text-xs uppercase tracking-wider hover:bg-gold-accent/90 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
