import React, { useState } from 'react';
import { X, Send, BellRing, Sparkles, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import type { ActiveButtonBlock } from '../types';

interface DynamicButtonActionModalProps {
  buttonBlock: ActiveButtonBlock | null;
  onClose: () => void;
  onSubmitForm: (buttonId: string, formType: string, formData: Record<string, string>) => Promise<boolean>;
}

export const DynamicButtonActionModal: React.FC<DynamicButtonActionModalProps> = ({
  buttonBlock,
  onClose,
  onSubmitForm,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!buttonBlock) return null;

  const isAlert = buttonBlock.buttonType === 'trigger_alert';
  const isForm = buttonBlock.buttonType === 'submit_form';

  if (!isAlert && !isForm) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ok = await onSubmitForm(
        buttonBlock.id,
        buttonBlock.formConfig?.formType || 'feedback',
        formData
      );

      if (ok) {
        setIsSuccess(true);
        setSuccessMessage(
          buttonBlock.formConfig?.submitSuccessMessage || 'Form submitted successfully over WebSockets.'
        );
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({});
          onClose();
        }, 1800);
      }
    } catch (err) {
      console.error('Form submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#121620] border border-neutral-700/80 rounded-2xl shadow-2xl p-6 text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ALERT MODAL */}
        {isAlert && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400">
                  Dynamic Button Alert
                </span>
                <h3 className="text-lg font-bold text-white">
                  {buttonBlock.alertConfig?.title || buttonBlock.title}
                </h3>
              </div>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                {buttonBlock.alertConfig?.message || buttonBlock.description || 'Action triggered successfully.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500 font-mono">
                Triggered via dynamic control · {buttonBlock.buttonText}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        )}

        {/* FORM MODAL */}
        {isForm && (
          <div>
            {isSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Submission Recorded</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400">
                      Dynamic Form Control
                    </span>
                    <h3 className="text-lg font-bold text-white">{buttonBlock.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-neutral-400">
                  {buttonBlock.formConfig?.promptLabel || buttonBlock.description || 'Complete the form below:'}
                </p>

                {buttonBlock.formConfig?.formType === 'newsletter' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Your Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="developer@example.com"
                        className="w-full px-3.5 py-2.5 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Role / Area of Interest
                      </label>
                      <input
                        type="text"
                        value={formData.role || ''}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        placeholder="e.g. Full-Stack Engineer / System Architect"
                        className="w-full px-3.5 py-2.5 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {buttonBlock.formConfig?.formType === 'feedback' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Your Feedback / Rating <span className="text-rose-400">*</span>
                      </label>
                      <select
                        required
                        value={formData.rating || '5 - Exceptional'}
                        onChange={(e) => handleInputChange('rating', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white"
                      >
                        <option value="5 - Exceptional">5 / 5 - Exceptional Architecture</option>
                        <option value="4 - Great">4 / 5 - Great Real-Time Flow</option>
                        <option value="3 - Good">3 / 5 - Solid Foundation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Comments / Note
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.comment || ''}
                        onChange={(e) => handleInputChange('comment', e.target.value)}
                        placeholder="Provide your thoughts or observations..."
                        className="w-full px-3.5 py-2.5 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {buttonBlock.formConfig?.formType === 'inquiry' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Alex Vance"
                        className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Inquiry Details
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.inquiry || ''}
                        onChange={(e) => handleInputChange('inquiry', e.target.value)}
                        placeholder="Detail your inquiry..."
                        className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm shadow-blue-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Transmitting...' : buttonBlock.buttonText}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
