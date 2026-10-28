import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { RegistrationForm } from './RegistrationForm';
import { LoginForm } from './LoginForm';
import { DeveloperUnlockModal } from '../DeveloperUnlockModal';
import { motion, AnimatePresence } from 'motion/react';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerAccountType, setRegisterAccountType] = useState<'personal' | 'business'>('personal');
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  useEffect(() => {
    const devKey = sessionStorage.getItem('axiometic_dev_key');
    if (devKey === 'Developer@AXIOMETIC') {
      setIsDeveloper(true);
      setHasProfile(true);
    }

    // Safety timeout: Never stay stuck in loading state longer than 2 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      const forceReauth = localStorage.getItem('axiometic_force_reauth') === 'true';
      
      if (currentUser) {
        try {
          const profileRef = doc(db, 'users', currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          const exists = profileSnap.exists();
          
          if (!forceReauth && exists) {
            setHasProfile(true);
          } else {
            setHasProfile(exists);
          }
        } catch (err) {
          console.warn('Profile fetch warning (granting access to authenticated user):', err);
          setHasProfile(true);
        }
      } else {
        if (!sessionStorage.getItem('axiometic_dev_key')) {
          setHasProfile(false);
        }
      }
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-mahogany-950 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
          <p className="text-gold-accent font-serif tracking-widest uppercase text-xs">Authenticating...</p>
        </div>
      </div>
    );
  }

  const handleDeveloperBypass = (password: string) => {
    sessionStorage.setItem('axiometic_dev_key', password);
    setIsDeveloper(true);
    setHasProfile(true);
    setIsUnlockModalOpen(false);
  };

  if (isDeveloper || (user && hasProfile)) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-mahogany-950 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
      
      <button 
        onClick={() => setIsUnlockModalOpen(true)}
        className="mb-8 relative z-20 group transition-transform active:scale-95 cursor-pointer"
        title="AXIOMETIC Developer Access"
      >
        <h1 className="text-5xl sm:text-7xl font-black text-gold-accent uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,1)] tracking-tighter group-hover:text-gold-accent/80 transition-colors">
          AXIOMETIC
        </h1>
        <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gold-accent/0 group-hover:bg-gold-accent/20 transition-all scale-x-0 group-hover:scale-x-100" />
      </button>

      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md relative z-10"
          >
            <LoginForm 
              onSwitch={() => {
                setRegisterAccountType('personal');
                setMode('register');
              }} 
              onSwitchToBusiness={() => {
                setRegisterAccountType('business');
                setMode('register');
              }}
              onComplete={() => setHasProfile(true)} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md relative z-10"
          >
            <RegistrationForm 
              initialAccountType={registerAccountType}
              onSwitch={() => setMode('login')} 
              onComplete={() => setHasProfile(true)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <DeveloperUnlockModal 
        isOpen={isUnlockModalOpen} 
        onClose={() => setIsUnlockModalOpen(false)} 
        onSuccess={handleDeveloperBypass} 
      />
    </div>
  );
};
