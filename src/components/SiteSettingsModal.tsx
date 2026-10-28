import React, { useState, useEffect } from 'react';
import { X, Check, SlidersHorizontal, Image, Trash2 } from 'lucide-react';
import type { SiteSettings } from '../types';

interface SiteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onSave: (updatedSettings: Partial<SiteSettings>) => Promise<void>;
  onClearAll: () => void;
}

export const SiteSettingsModal: React.FC<SiteSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onClearAll,
}) => {
  const [siteTitle, setSiteTitle] = useState(settings.siteTitle || 'AXIOMETIC');
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [bio, setBio] = useState(settings.bio || '');
  const [creatorName, setCreatorName] = useState(settings.creatorName || '');
  const [headerBanner, setHeaderBanner] = useState(settings.headerBanner || '');
  const [announcement, setAnnouncement] = useState(settings.announcement || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSiteTitle(settings.siteTitle || 'AXIOMETIC');
      setTagline(settings.tagline || '');
      setBio(settings.bio || '');
      setCreatorName(settings.creatorName || '');
      setHeaderBanner(settings.headerBanner || '');
      setAnnouncement(settings.announcement || '');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        siteTitle: siteTitle.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        creatorName: creatorName.trim(),
        headerBanner: headerBanner.trim(),
        announcement: announcement.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#121620] border border-neutral-700/80 rounded-2xl shadow-2xl p-6 text-neutral-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Studio Canvas Settings</h3>
              <p className="text-xs text-neutral-400">Configure global branding and page presence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Site Brand Title
              </label>
              <input
                type="text"
                required
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Creator / Studio Name
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Tagline / Sub-Proposition
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Bio / Page Description
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Header Banner URL / Asset
            </label>
            <input
              type="text"
              value={headerBanner}
              onChange={(e) => setHeaderBanner(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setHeaderBanner('/src/assets/images/hero_axiometic_workspace_1792207571017.jpg')}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <Image className="w-3 h-3" /> Use Workspace Banner
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Live Announcement Ticker Bar (Optional)
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to erase all present contents on the canvas?')) {
                  onClearAll();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/30 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Erase All Contents</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Broadcasting...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
