import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, ArrowRight, ShieldCheck, AtSign, Building2 } from 'lucide-react';

interface LoginFormProps {
  onSwitch: () => void;
  onSwitchToBusiness?: () => void;
  onComplete: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitch, onSwitchToBusiness, onComplete }) => {
  const [axiometicId, setAxiometicId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    let inputVal = axiometicId.trim();
    let authEmail = inputVal;

    // Normalize Axiometic ID to Firebase Auth format
    if (inputVal.includes('@axiometic') || !inputVal.includes('@')) {
      const handle = inputVal.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '');
      authEmail = `${handle}@axiometic.com`;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
      const user = userCredential.user;
      
      // Store session identity
      const displayId = inputVal.includes('@axiometic') ? inputVal : `${inputVal}@axiometic`;
      localStorage.setItem('axiometic_active_id', displayId);

      // Smart Session System
      const deviceId = localStorage.getItem('axiometic_device_id') || Math.random().toString(36).substring(2);
      localStorage.setItem('axiometic_device_id', deviceId);
      
      const knownAccounts = JSON.parse(localStorage.getItem('axiometic_known_accounts') || '[]');
      if (!knownAccounts.includes(user.uid)) {
        knownAccounts.push(user.uid);
        localStorage.setItem('axiometic_known_accounts', JSON.stringify(knownAccounts));
      }
      
      if (knownAccounts.length > 1) {
        localStorage.setItem('axiometic_force_reauth', 'true');
      } else {
        localStorage.removeItem('axiometic_force_reauth');
      }

      onComplete();
    } catch (err: any) {
      setError('Invalid identity credentials. Please check your Axiometic ID and password.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const forceReauth = localStorage.getItem('axiometic_force_reauth') === 'true';
    if (!forceReauth && auth.currentUser) {
      onComplete();
    }
  }, [onComplete]);

  return (
    <div className="bg-mahogany-900/95 border border-gold-accent/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-ivory">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-16 h-16 bg-gold-accent rounded-full flex items-center justify-center mb-4 shadow-lg shadow-gold-accent/20">
          <ShieldCheck className="text-mahogany-950 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-ivory tracking-tight">Access Archives</h2>
        <p className="text-gold-accent/70 text-xs uppercase tracking-widest mt-1 font-mono">
          AXIOMETIC AUTHENTICATION
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center font-mono">
            {error}
          </div>
        )}

        {/* Axiometic ID Input */}
        <div>
          <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
            Axiometic ID:-
          </label>
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
            <input
              type="text"
              required
              value={axiometicId}
              onChange={(e) => setAxiometicId(e.target.value)}
              placeholder="example@axiometic"
              className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-3 pl-12 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-all text-xs font-mono"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
            Secret Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-3 pl-12 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-all text-xs"
            />
          </div>
        </div>

        {/* Authorize Access Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gold-accent hover:bg-gold-accent/90 disabled:opacity-50 text-mahogany-950 font-black py-4 rounded-xl shadow-xl shadow-gold-accent/15 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs mt-4 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-mahogany-950/20 border-t-mahogany-950 rounded-full animate-spin" />
          ) : (
            <>
              <span>Authorize Access</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* User Specified Footer Layout:
            New to axiometic?                     Buisness Account!!
            Create account!
        */}
        <div className="pt-6 border-t border-gold-accent/20 mt-6 flex items-start justify-between">
          <div className="flex flex-col text-left">
            <span className="text-ivory/50 text-xs font-serif">New to axiometic?</span>
            <button
              type="button"
              onClick={onSwitch}
              className="text-gold-accent hover:underline font-bold text-xs uppercase tracking-wider text-left mt-0.5 cursor-pointer"
            >
              Create account!
            </button>
          </div>

          <button
            type="button"
            onClick={onSwitchToBusiness || onSwitch}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/40 text-blue-300 hover:text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Buisness Account!!</span>
          </button>
        </div>
      </form>
    </div>
  );
};
