import React, { useState, useEffect } from 'react';
import {
  X,
  PenLine,
  ImagePlus,
  Link2,
  Sparkles,
  Upload,
  Check,
  ThumbsUp,
  Heart,
  Copy,
  Mail,
  ExternalLink,
  Rocket,
  Bookmark,
  Terminal,
  Play,
  Pin,
  FileText,
  BellRing,
  Send,
} from 'lucide-react';
import type {
  Block,
  BlockType,
  DynamicButtonActionType,
  ButtonVariant,
  AlertConfig,
  FormConfig,
} from '../types';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: Block) => Promise<void>;
  editingBlock?: Block | null;
  defaultType?: BlockType;
  developerPassword: string;
}

const AVAILABLE_ICONS = [
  { name: 'Sparkles', label: 'Sparkles / AI', Icon: Sparkles },
  { name: 'ThumbsUp', label: 'Like / Upvote', Icon: ThumbsUp },
  { name: 'Heart', label: 'Heart / Favorite', Icon: Heart },
  { name: 'BellRing', label: 'Alert / Notification', Icon: BellRing },
  { name: 'Mail', label: 'Form / Dispatch', Icon: Mail },
  { name: 'Copy', label: 'Copy Text', Icon: Copy },
  { name: 'ExternalLink', label: 'External URL', Icon: ExternalLink },
  { name: 'Rocket', label: 'Rocket / Launch', Icon: Rocket },
  { name: 'Bookmark', label: 'Save / Bookmark', Icon: Bookmark },
  { name: 'Terminal', label: 'Terminal / Code', Icon: Terminal },
  { name: 'Play', label: 'Play / Action', Icon: Play },
];

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBlock,
  defaultType = 'text',
  developerPassword,
}) => {
  const [selectedType, setSelectedType] = useState<BlockType>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Common fields
  const [title, setTitle] = useState('');
  const [pinned, setPinned] = useState(false);

  // Text block fields
  const [textContent, setTextContent] = useState('');
  const [textCategory, setTextCategory] = useState('Design & Systems');
  const [readTime, setReadTime] = useState('2 min read');

  // Picture block fields
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1' | 'natural'>('16:9');

  // Link block fields
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkBadge, setLinkBadge] = useState('Resource');

  // Dynamic Button fields
  const [buttonText, setButtonText] = useState('Trigger Dynamic Action');
  const [buttonType, setButtonType] = useState<DynamicButtonActionType>('action_link');
  const [buttonActionPayload, setButtonActionPayload] = useState('https://ai.google.dev');
  const [buttonVariant, setButtonVariant] = useState<ButtonVariant>('primary');
  const [buttonIcon, setButtonIcon] = useState('ExternalLink');
  const [buttonDescription, setButtonDescription] = useState('');

  // Alert Config
  const [alertTitle, setAlertTitle] = useState('System Notice');
  const [alertMessage, setAlertMessage] = useState('This dynamic button triggered a real-time event.');
  const [alertType, setAlertType] = useState<'info' | 'success' | 'announcement'>('announcement');

  // Form Config
  const [formType, setFormType] = useState<'newsletter' | 'feedback' | 'inquiry'>('newsletter');
  const [formPrompt, setFormPrompt] = useState('Subscribe to developer dispatches:');
  const [formSuccessMessage, setFormSuccessMessage] = useState('Thank you. Submission received over WebSockets.');

  // File Block fields
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeFormatted, setFileSizeFormatted] = useState('');
  const [fileCategory, setFileCategory] = useState<'image' | 'document' | 'archive' | 'media' | 'other'>('document');
  const [fileDescription, setFileDescription] = useState('');

  // Synchronize initial state
  useEffect(() => {
    if (editingBlock) {
      setSelectedType(editingBlock.type);
      setTitle(editingBlock.title || '');
      setPinned(!!editingBlock.pinned);

      if (editingBlock.type === 'text') {
        setTextContent(editingBlock.content || '');
        setTextCategory(editingBlock.category || 'Design & Systems');
        setReadTime(editingBlock.readTime || '2 min read');
      } else if (editingBlock.type === 'picture') {
        setImageUrl(editingBlock.imageUrl || '');
        setImageCaption(editingBlock.caption || '');
        setAspectRatio(editingBlock.aspectRatio || '16:9');
      } else if (editingBlock.type === 'link') {
        setLinkUrl(editingBlock.url || '');
        setLinkDescription(editingBlock.description || '');
        setLinkBadge(editingBlock.badgeText || 'Resource');
      } else if (editingBlock.type === 'button') {
        setButtonText(editingBlock.buttonText || '');
        setButtonType(editingBlock.buttonType || 'action_link');
        setButtonActionPayload(editingBlock.actionPayload || '');
        setButtonVariant(editingBlock.variant || 'primary');
        setButtonIcon(editingBlock.iconName || 'Sparkles');
        setButtonDescription(editingBlock.description || '');

        if (editingBlock.alertConfig) {
          setAlertTitle(editingBlock.alertConfig.title);
          setAlertMessage(editingBlock.alertConfig.message);
          setAlertType(editingBlock.alertConfig.alertType);
        }
        if (editingBlock.formConfig) {
          setFormType(editingBlock.formConfig.formType);
          setFormPrompt(editingBlock.formConfig.promptLabel);
          setFormSuccessMessage(editingBlock.formConfig.submitSuccessMessage);
        }
      } else if (editingBlock.type === 'file') {
        setFileUrl(editingBlock.fileUrl || '');
        setFileName(editingBlock.fileName || '');
        setFileSizeFormatted(editingBlock.fileSizeFormatted || '');
        setFileCategory(editingBlock.category || 'document');
        setFileDescription(editingBlock.description || '');
      }
    } else {
      setSelectedType(defaultType);
      setTitle('');
      setPinned(false);
      setTextContent('');
      setTextCategory('Design & Systems');
      setReadTime('2 min read');
      setImageUrl('');
      setImageCaption('');
      setAspectRatio('16:9');
      setLinkUrl('');
      setLinkDescription('');
      setLinkBadge('Resource');

      // Button defaults
      setButtonText('Trigger Dynamic Action');
      setButtonType('trigger_alert');
      setButtonActionPayload('');
      setButtonVariant('primary');
      setButtonIcon('BellRing');
      setButtonDescription('Configurable interactive control with dynamic behavior.');
      setAlertTitle('Architecture Update');
      setAlertMessage('Interactive alert event verified via WebSockets.');
      setAlertType('announcement');
      setFormType('newsletter');
      setFormPrompt('Subscribe to technical releases:');
      setFormSuccessMessage('Subscription confirmed. Updates stream live.');

      // File defaults
      setFileUrl('');
      setFileName('');
      setFileSizeFormatted('');
      setFileCategory('document');
      setFileDescription('');
    }
  }, [editingBlock, defaultType, isOpen]);

  if (!isOpen) return null;

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMediaBlock = true) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadProgress(20);

    const reader = new FileReader();

    reader.onload = async () => {
      setUploadProgress(60);
      const base64Data = reader.result as string;

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password: developerPassword || 'Developer@AXIOMETIC',
            filename: file.name,
            mimeType: file.type,
            fileData: base64Data,
          }),
        });

        const resData = await response.json();
        setUploadProgress(100);

        if (resData.success && resData.url) {
          if (isMediaBlock) {
            setImageUrl(resData.url);
            if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
          } else {
            setFileUrl(resData.url);
            setFileName(file.name);
            setFileSizeFormatted(resData.sizeFormatted || '1 MB');
            if (!title) setTitle(file.name);
          }
        }
      } catch (err) {
        console.error('File upload failed:', err);
        if (isMediaBlock) setImageUrl(base64Data);
      } finally {
        setIsUploadingImage(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      let blockToSave: Block;

      const baseInfo = {
        id: editingBlock ? editingBlock.id : `block_${Date.now()}`,
        title: title.trim(),
        pinned,
        createdAt: editingBlock ? editingBlock.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (selectedType === 'text') {
        blockToSave = {
          ...baseInfo,
          type: 'text',
          category: textCategory.trim(),
          content: textContent.trim(),
          readTime: readTime.trim() || '2 min read',
        };
      } else if (selectedType === 'picture') {
        blockToSave = {
          ...baseInfo,
          type: 'picture',
          imageUrl: imageUrl.trim(),
          caption: imageCaption.trim(),
          aspectRatio,
        };
      } else if (selectedType === 'link') {
        let domain = '';
        try {
          domain = new URL(linkUrl).hostname.replace('www.', '');
        } catch {
          domain = linkUrl;
        }

        blockToSave = {
          ...baseInfo,
          type: 'link',
          url: linkUrl.trim(),
          description: linkDescription.trim(),
          domain,
          badgeText: linkBadge.trim(),
          clicks: editingBlock && 'clicks' in editingBlock ? editingBlock.clicks : 0,
        };
      } else if (selectedType === 'file') {
        blockToSave = {
          ...baseInfo,
          type: 'file',
          fileName: fileName || title,
          fileUrl: fileUrl,
          fileSizeFormatted: fileSizeFormatted || '1.2 MB',
          mimeType: 'application/octet-stream',
          category: fileCategory,
          description: fileDescription.trim(),
        };
      } else {
        // Dynamic Button
        let alertCfg: AlertConfig | undefined;
        let formCfg: FormConfig | undefined;

        if (buttonType === 'trigger_alert') {
          alertCfg = {
            title: alertTitle.trim() || 'System Alert',
            message: alertMessage.trim() || 'Dynamic notification triggered.',
            alertType,
          };
        } else if (buttonType === 'submit_form') {
          formCfg = {
            formType,
            promptLabel: formPrompt.trim() || 'Complete the interactive form:',
            submitSuccessMessage: formSuccessMessage.trim() || 'Submission recorded.',
          };
        }

        blockToSave = {
          ...baseInfo,
          type: 'button',
          buttonText: buttonText.trim(),
          buttonType,
          actionPayload: buttonActionPayload.trim(),
          count: editingBlock && 'count' in editingBlock ? editingBlock.count : 0,
          variant: buttonVariant,
          iconName: buttonIcon,
          description: buttonDescription.trim(),
          alertConfig: alertCfg,
          formConfig: formCfg,
        };
      }

      await onSave(blockToSave);
      onClose();
    } catch (err) {
      console.error('Failed to save block:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121620] border border-neutral-700/80 rounded-2xl shadow-2xl p-6 text-neutral-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {editingBlock ? 'Edit Content Item' : 'Publish Content Item'}
            </h3>
            <p className="text-xs text-neutral-400">
              Updates broadcast automatically via WebSockets to all connected clients.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector (if creating new) */}
        {!editingBlock && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedType('text');
                setButtonIcon('PenLine');
              }}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedType === 'text'
                  ? 'bg-blue-600/15 border-blue-500 text-blue-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write Text</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType('picture');
                setButtonIcon('ImagePlus');
              }}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedType === 'picture'
                  ? 'bg-emerald-600/15 border-emerald-500 text-emerald-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ImagePlus className="w-3.5 h-3.5" />
              <span>Picture</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType('button');
                setButtonIcon('Sparkles');
              }}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedType === 'button'
                  ? 'bg-purple-600/15 border-purple-500 text-purple-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dynamic Button</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType('link');
                setButtonIcon('Link2');
              }}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedType === 'link'
                  ? 'bg-amber-600/15 border-amber-500 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Link</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType('file');
                setButtonIcon('FileText');
              }}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedType === 'file'
                  ? 'bg-cyan-600/15 border-cyan-500 text-cyan-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>File Asset</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Title / Headline <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descriptive title or headline"
              className="w-full px-3.5 py-2.5 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* DYNAMIC BUTTON CONFIGURATION */}
          {selectedType === 'button' && (
            <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Button Label <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Trigger Advisory, Submit Form, Open Link"
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Configurable Button Action <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={buttonType}
                    onChange={(e) => {
                      const t = e.target.value as DynamicButtonActionType;
                      setButtonType(t);
                      if (t === 'trigger_alert') setButtonIcon('BellRing');
                      else if (t === 'submit_form') setButtonIcon('Mail');
                      else if (t === 'action_link') setButtonIcon('ExternalLink');
                      else if (t === 'counter') setButtonIcon('ThumbsUp');
                      else if (t === 'copy_text') setButtonIcon('Copy');
                    }}
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                  >
                    <option value="action_link">Navigate to URL</option>
                    <option value="trigger_alert">Trigger Interactive Alert / Advisory</option>
                    <option value="submit_form">Submit In-Page Form</option>
                    <option value="counter">Real-Time WebSocket Counter</option>
                    <option value="copy_text">Copy Text / Command to Clipboard</option>
                    <option value="toggle_note">Expand Secret Note / Accordion</option>
                  </select>
                </div>
              </div>

              {/* ACTION: NAVIGATE TO URL */}
              {buttonType === 'action_link' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Target URL (Destination)
                  </label>
                  <input
                    type="url"
                    required
                    value={buttonActionPayload}
                    onChange={(e) => setButtonActionPayload(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              )}

              {/* ACTION: TRIGGER ALERT */}
              {buttonType === 'trigger_alert' && (
                <div className="space-y-3 p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Alert Title
                      </label>
                      <input
                        type="text"
                        required
                        value={alertTitle}
                        onChange={(e) => setAlertTitle(e.target.value)}
                        placeholder="e.g. Critical Release Advisory"
                        className="w-full px-3 py-1.5 bg-[#0a0d14] border border-neutral-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Alert Style
                      </label>
                      <select
                        value={alertType}
                        onChange={(e) => setAlertType(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-[#0a0d14] border border-neutral-700 rounded text-xs text-white"
                      >
                        <option value="announcement">Announcement (Purple)</option>
                        <option value="info">Information (Blue)</option>
                        <option value="success">Success / Verified (Emerald)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Alert Message Body
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={alertMessage}
                      onChange={(e) => setAlertMessage(e.target.value)}
                      placeholder="The modal alert content displayed to visitors upon click..."
                      className="w-full px-3 py-1.5 bg-[#0a0d14] border border-neutral-700 rounded text-xs text-white leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* ACTION: SUBMIT FORM */}
              {buttonType === 'submit_form' && (
                <div className="space-y-3 p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Form Template
                      </label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-[#0a0d14] border border-neutral-700 rounded text-xs text-white"
                      >
                        <option value="newsletter">Email Subscription & Role</option>
                        <option value="feedback">Interactive Rating & Feedback</option>
                        <option value="inquiry">Name & Direct Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Form Callout Prompt
                      </label>
                      <input
                        type="text"
                        required
                        value={formPrompt}
                        onChange={(e) => setFormPrompt(e.target.value)}
                        placeholder="e.g. Join developer dispatches:"
                        className="w-full px-3 py-1.5 bg-[#0a0d14] border border-neutral-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Confirmation Message on Submission
                    </label>
                    <input
                      type="text"
                      required
                      value={formSuccessMessage}
                      onChange={(e) => setFormSuccessMessage(e.target.value)}
                      placeholder="e.g. Submission confirmed and broadcasted over WebSockets."
                      className="w-full px-3 py-1.5 bg-[#0a0d14] border border-neutral-700 rounded text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* ACTION: COPY TEXT */}
              {buttonType === 'copy_text' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Text / Code to Copy
                  </label>
                  <input
                    type="text"
                    required
                    value={buttonActionPayload}
                    onChange={(e) => setButtonActionPayload(e.target.value)}
                    placeholder="e.g. Developer@AXIOMETIC or npm run deploy"
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              )}

              {/* ACTION: TOGGLE NOTE */}
              {buttonType === 'toggle_note' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Expandable Hidden Text
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={buttonActionPayload}
                    onChange={(e) => setButtonActionPayload(e.target.value)}
                    placeholder="Content smoothly revealed when visitor toggles the active button..."
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                  />
                </div>
              )}

              {/* Button Description */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Button Context / Sub-Text
                </label>
                <input
                  type="text"
                  value={buttonDescription}
                  onChange={(e) => setButtonDescription(e.target.value)}
                  placeholder="e.g. Configured to trigger real-time alert or form submission."
                  className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                />
              </div>

              {/* Styling and Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Button Visual Variant
                  </label>
                  <select
                    value={buttonVariant}
                    onChange={(e) => setButtonVariant(e.target.value as ButtonVariant)}
                    className="w-full px-3 py-1.5 bg-[#0a0d14] border border-neutral-700 rounded text-xs text-white"
                  >
                    <option value="primary">Primary (Electric Cobalt)</option>
                    <option value="accent">Accent (Purple / Vibrant)</option>
                    <option value="secondary">Secondary (Dark Slate Surface)</option>
                    <option value="outline">Outline (Crisp Hairline)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Button Icon
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_ICONS.map(({ name, Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setButtonIcon(name)}
                        className={`p-1.5 rounded border transition-colors ${
                          buttonIcon === name
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                        title={name}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEXT BLOCK CONFIGURATION */}
          {selectedType === 'text' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Topic / Category (Unboxed)
                  </label>
                  <input
                    type="text"
                    value={textCategory}
                    onChange={(e) => setTextCategory(e.target.value)}
                    placeholder="e.g. Architecture · Systems · AI"
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="e.g. 3 min read"
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Content (Multi-paragraph writing)
                </label>
                <textarea
                  rows={6}
                  required
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Write your article, research notes, technical updates, or thoughts here..."
                  className="w-full px-3.5 py-2.5 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 leading-relaxed"
                />
              </div>
            </>
          )}

          {/* PICTURE BLOCK CONFIGURATION */}
          {selectedType === 'picture' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-neutral-300">
                Image Source (Upload from device or enter URL)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-700 rounded-xl hover:border-neutral-500 hover:bg-neutral-800/40 cursor-pointer transition-colors text-center">
                  <Upload className="w-5 h-5 text-neutral-400 mb-1.5" />
                  <span className="text-xs font-medium text-neutral-200">
                    {isUploadingImage ? `Uploading (${uploadProgress}%)...` : 'Browse Device Photos'}
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-0.5">PNG, JPG, WEBP, SVG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, true)}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </label>

                <div className="flex flex-col justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <span className="text-xs text-neutral-400 font-medium">Or Use Generated Studio Presets:</span>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setImageUrl('/src/assets/images/hero_axiometic_workspace_1792207571017.jpg')}
                      className="px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 text-neutral-300"
                    >
                      Workspace
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl('/src/assets/images/card_showcase_tech_1792207571502.jpg')}
                      className="px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 text-neutral-300"
                    >
                      Prototype
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl('/src/assets/images/avatar_creator_profile_1792207572261.jpg')}
                      className="px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 text-neutral-300"
                    >
                      Portrait
                    </button>
                  </div>
                </div>
              </div>

              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste direct image URL (/uploads/... or https://...)"
                className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
              />

              {imageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-neutral-800 max-h-40 bg-neutral-950 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Upload Preview"
                    referrerPolicy="no-referrer"
                    className="max-h-40 w-auto object-contain"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="4:3">4:3 (Product Standard)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="natural">Natural Aspect</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="e.g. Minimalist design prototype"
                    className="w-full px-3 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* LINK BLOCK CONFIGURATION */}
          {selectedType === 'link' && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Target Destination URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/project"
                  className="w-full px-3.5 py-2.5 bg-[#0a0d14] border border-neutral-700 rounded-lg text-sm text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={linkBadge}
                    onChange={(e) => setLinkBadge(e.target.value)}
                    placeholder="e.g. Documentation, GitHub, Demo"
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Brief Description
                  </label>
                  <input
                    type="text"
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                    placeholder="Summary of destination"
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* FILE BLOCK CONFIGURATION */}
          {selectedType === 'file' && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-neutral-300">
                File Asset Upload
              </label>

              <label className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-700 rounded-xl hover:border-neutral-500 hover:bg-neutral-800/40 cursor-pointer transition-colors text-center">
                <Upload className="w-5 h-5 text-neutral-400 mb-1.5" />
                <span className="text-xs font-medium text-neutral-200">
                  {isUploadingImage ? `Uploading (${uploadProgress}%)...` : 'Browse Device Files (PDF, ZIP, DOCX, etc.)'}
                </span>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    File Public Path / URL
                  </label>
                  <input
                    type="text"
                    required
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="/uploads/my_file.pdf"
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    File Size Note
                  </label>
                  <input
                    type="text"
                    value={fileSizeFormatted}
                    onChange={(e) => setFileSizeFormatted(e.target.value)}
                    placeholder="e.g. 1.8 MB"
                    className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Asset Description
                </label>
                <input
                  type="text"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="e.g. Technical CAD drawings and architecture specification PDF"
                  className="w-full px-3.5 py-2 bg-[#0a0d14] border border-neutral-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Pinned checkbox */}
          <div className="pt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-blue-600 focus:ring-0"
              />
              <span className="flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-neutral-400" />
                Pin to top of canvas
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm shadow-blue-500/20"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Broadcasting...' : editingBlock ? 'Save Changes' : 'Publish Live'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
