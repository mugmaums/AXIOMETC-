import React, { useState } from 'react';
import { auth, db, storage } from '../../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Lock, Phone, Calendar, Upload, AtSign, ArrowRight, MapPin, Briefcase, Building2, CheckCircle2, Globe, Compass } from 'lucide-react';

interface RegistrationFormProps {
  onSwitch: () => void;
  onComplete: () => void;
  initialAccountType?: 'personal' | 'business';
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  onSwitch, 
  onComplete,
  initialAccountType = 'personal'
}) => {
  const [accountType, setAccountType] = useState<'personal' | 'business'>(initialAccountType);
  const [axiometicId, setAxiometicId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  
  // Business Account specific required fields
  const [companyName, setCompanyName] = useState('');
  const [businessTarget, setBusinessTarget] = useState('');
  const [officialAddress, setOfficialAddress] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Business Account Validations
    if (accountType === 'business') {
      if (!companyName.trim()) {
        setError('Company Name is required for Business Account.');
        setIsLoading(false);
        return;
      }
      if (!businessTarget.trim()) {
        setError('Target (audience, industry, or business target) is required.');
        setIsLoading(false);
        return;
      }
      if (!officialAddress.trim()) {
        setError('Official Address is required.');
        setIsLoading(false);
        return;
      }
      if (!websiteUrl.trim()) {
        setError('Website URL is required.');
        setIsLoading(false);
        return;
      }
      if (!contactNumber.trim()) {
        setError('Contact Number is required.');
        setIsLoading(false);
        return;
      }
    } else {
      if (!phone.trim()) {
        setError('Phone number is required.');
        setIsLoading(false);
        return;
      }
      if (!address.trim()) {
        setError('Address is required.');
        setIsLoading(false);
        return;
      }
      if (!dob.trim()) {
        setError('Date of birth is required.');
        setIsLoading(false);
        return;
      }
    }

    // Normalize Axiometic ID
    let rawHandle = axiometicId.trim();
    if (rawHandle.includes('@')) {
      rawHandle = rawHandle.split('@')[0];
    }
    const cleanHandle = rawHandle.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!cleanHandle) {
      setError('Please provide a valid Axiometic ID (e.g. example@axiometic)');
      setIsLoading(false);
      return;
    }

    const fullAxiometicId = `${cleanHandle}@axiometic`;
    const firebaseAuthEmail = `${cleanHandle}@axiometic.com`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, firebaseAuthEmail, password);
      const user = userCredential.user;

      let photoUrl = '';
      if (photo) {
        try {
          const photoRef = ref(storage, `profiles/${user.uid}/avatar`);
          await uploadBytes(photoRef, photo);
          photoUrl = await getDownloadURL(photoRef);
        } catch (uploadErr) {
          console.warn('Storage upload fallback:', uploadErr);
          photoUrl = photoPreview || '';
        }
      }

      try {
        await updateProfile(user, {
          displayName: accountType === 'business' ? `${companyName} (${fullAxiometicId})` : fullAxiometicId,
          photoURL: photoUrl
        });
      } catch (e) {}

      // Public Profile
      try {
        await setDoc(doc(db, 'users', user.uid), {
          axiometicId: fullAxiometicId,
          photoUrl,
          displayName: accountType === 'business' ? `${companyName} (${fullAxiometicId})` : fullAxiometicId,
          accountType,
          ...(accountType === 'business' ? {
            companyName,
            businessTarget,
            officialAddress,
            websiteUrl,
            contactNumber,
          } : {}),
          lastSeenAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not write public profile document:', err);
      }

      // Private Data
      try {
        await setDoc(doc(db, 'users', user.uid, 'private', 'info'), {
          phoneNumber: accountType === 'business' ? contactNumber : phone,
          address: accountType === 'business' ? officialAddress : address,
          dob: accountType === 'business' ? '' : dob,
          email: firebaseAuthEmail,
          accountType,
          ...(accountType === 'business' ? {
            companyName,
            businessTarget,
            officialAddress,
            websiteUrl,
            contactNumber,
          } : {}),
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not write private info document:', err);
      }

      // Store active session profile in localStorage for instant access
      localStorage.setItem('axiometic_active_id', fullAxiometicId);
      localStorage.setItem('axiometic_account_type', accountType);
      if (accountType === 'business') {
        localStorage.setItem('axiometic_company_name', companyName);
      }

      onComplete();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError(`This Axiometic ID (${fullAxiometicId}) is already registered. Please sign in.`);
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-mahogany-900/95 border border-gold-accent/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-ivory">
      {/* Account Type Selector Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gold-accent/20">
        <button
          type="button"
          onClick={() => setAccountType('personal')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            accountType === 'personal'
              ? 'bg-gold-accent text-mahogany-950 shadow-md font-black'
              : 'text-ivory/60 hover:text-gold-accent hover:bg-gold-accent/10'
          }`}
        >
          <span>Personal Account</span>
        </button>

        <div className="w-[1px] h-6 bg-gold-accent/20 mx-2" />

        <button
          type="button"
          onClick={() => setAccountType('business')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            accountType === 'business'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400 font-black'
              : 'text-blue-300 hover:text-white hover:bg-blue-600/15 border border-blue-500/20'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Buisness Account!!</span>
        </button>
      </div>

      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-14 h-14 bg-gold-accent rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-gold-accent/20 text-mahogany-950 font-black text-2xl">
          {accountType === 'business' ? <Briefcase className="w-7 h-7" /> : <AtSign className="w-7 h-7" />}
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-ivory tracking-tight">
          {accountType === 'business' ? 'Create Business Account' : 'Create Identity'}
        </h2>
        <p className="text-gold-accent/70 text-[11px] uppercase tracking-widest mt-0.5 font-mono">
          {accountType === 'business' ? 'AXIOMETIC ENTERPRISE SUITE' : 'AXIOMETIC ENROLLMENT'}
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center font-mono">
            {error}
          </div>
        )}

        {/* Profile Avatar Upload */}
        <div className="flex flex-col items-center mb-4">
          <label className="relative group cursor-pointer">
            <div className={`w-16 h-16 rounded-full border-2 border-dashed border-gold-accent/30 flex items-center justify-center overflow-hidden transition-all ${photoPreview ? 'border-solid border-gold-accent' : 'hover:border-gold-accent'}`}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="text-gold-accent/40 w-5 h-5" />
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <div className="absolute -bottom-1 -right-1 bg-gold-accent p-1 rounded-full shadow-lg">
              <Upload className="text-mahogany-950 w-2.5 h-2.5" />
            </div>
          </label>
          <span className="text-[9px] text-ivory/50 mt-1 uppercase tracking-widest">
            {accountType === 'business' ? 'Company Logo' : 'Profile Picture'}
          </span>
        </div>

        {/* Form Inputs matching exact user specification */}
        <div className="space-y-3">
          {accountType === 'business' ? (
            <>
              {/* Company Name */}
              <div>
                <label className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-1">
                  Company Name <span className="text-red-400 font-black">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corporation Ltd."
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-blue-400 transition-all text-xs"
                  />
                </div>
              </div>

              {/* Target (Market, Industry, or Business Goal) */}
              <div>
                <label className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-1">
                  Target (Audience / Industry / Goal) <span className="text-red-400 font-black">*</span>
                </label>
                <div className="relative">
                  <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    required
                    value={businessTarget}
                    onChange={(e) => setBusinessTarget(e.target.value)}
                    placeholder="e.g. Enterprise AI, Cloud Infra, FinTech"
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-blue-400 transition-all text-xs"
                  />
                </div>
              </div>

              {/* Official Address */}
              <div>
                <label className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-1">
                  Official Address <span className="text-red-400 font-black">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    required
                    value={officialAddress}
                    onChange={(e) => setOfficialAddress(e.target.value)}
                    placeholder="HQ Tower, 100 Main St, Tech District"
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-blue-400 transition-all text-xs"
                  />
                </div>
              </div>

              {/* Website URL */}
              <div>
                <label className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-1">
                  Website URL <span className="text-red-400 font-black">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://company.example.com"
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-blue-400 transition-all text-xs font-mono"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-1">
                  Contact Number <span className="text-red-400 font-black">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+1 (800) 555-0199"
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-blue-400 transition-all text-xs font-mono"
                  />
                </div>
              </div>

              {/* Axiometic ID */}
              <div>
                <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
                  Axiometic ID:- <span className="text-red-400 font-black">*</span>
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
                  <input
                    type="text"
                    required
                    value={axiometicId}
                    onChange={(e) => setAxiometicId(e.target.value)}
                    placeholder="company@axiometic"
                    className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-all text-xs font-mono"
                  />
                </div>
                <span className="text-[9px] text-gold-accent/50 ml-1 font-mono">Format: company@axiometic</span>
              </div>

              {/* Secret Password */}
              <div>
                <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
                  Master Password <span className="text-red-400 font-black">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-all text-xs"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Axiometic ID */}
              <div>
                <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
                  Axiometic ID:-
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
                  <input
                    type="text"
                    required
                    value={axiometicId}
                    onChange={(e) => setAxiometicId(e.target.value)}
                    placeholder="example@axiometic"
                    className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-all text-xs font-mono"
                  />
                </div>
                <span className="text-[9px] text-gold-accent/50 ml-1 font-mono">Format: handle@axiometic</span>
              </div>

              {/* Phone no. */}
              <div>
                <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
                  Phone no.
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-all text-xs font-mono"
                  />
                </div>
              </div>

              {/* Address. */}
              <div>
                <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
                  Address.
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, City, State / Country"
                    className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-all text-xs"
                  />
                </div>
              </div>

              {/* D.O.B:- */}
              <div>
                <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
                  D.O.B:-
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-2.5 pl-10 pr-4 text-ivory focus:outline-none focus:border-gold-accent transition-all text-xs [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Secret Password */}
              <div>
                <label className="text-[11px] font-bold text-gold-accent uppercase tracking-wider block mb-1">
                  Secret Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-accent/50" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-gold-accent/25 rounded-xl py-2.5 pl-10 pr-4 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent transition-all text-xs"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl mt-4 ${
            accountType === 'business'
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
              : 'bg-gold-accent hover:bg-gold-accent/90 text-mahogany-950 shadow-gold-accent/15'
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account!</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-gold-accent/15 flex items-center justify-between text-xs font-serif">
          <span className="text-ivory/50">Already have an identity?</span>
          <button 
            type="button" 
            onClick={onSwitch} 
            className="text-gold-accent hover:underline font-bold uppercase tracking-wider cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};
