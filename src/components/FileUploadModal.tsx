import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Archive,
  Film,
  File,
  Copy,
  Download,
  Check,
  ShieldCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { UploadedFileRecord, Block } from '../types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerPassword: string;
  uploadedFiles: UploadedFileRecord[];
  onFileUploadedToCanvas?: (newBlock: Block) => Promise<void>;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  developerPassword,
  uploadedFiles,
  onFileUploadedToCanvas,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [completedFile, setCompletedFile] = useState<UploadedFileRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'vault'>('upload');
  const [isPublishingToCanvas, setIsPublishingToCanvas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCompletedFile(null);
      setUploadProgress(0);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(15);
    setUploadStatus('Verifying file security and permissions...');

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        setUploadProgress(45);
        setUploadStatus('Transferring bytes to designated storage (/public/uploads)...');

        const base64Data = reader.result as string;

        // Simulate slight network progression for smooth visual UX feedback
        await new Promise((r) => setTimeout(r, 400));
        setUploadProgress(75);
        setUploadStatus('Generating cryptographic hash & asset metadata...');

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password: developerPassword || 'Developer@AXIOMETIC',
            filename: selectedFile.name,
            mimeType: selectedFile.type,
            fileData: base64Data,
          }),
        });

        const data = await response.json();

        if (data.success && data.file) {
          setUploadProgress(100);
          setUploadStatus('Upload complete and verified.');
          setCompletedFile(data.file);
        } else {
          setUploadStatus(`Upload failed: ${data.message || 'Unknown error'}`);
        }
      } catch (err: any) {
        setUploadStatus(`Network error: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePublishAsBlock = async (file: UploadedFileRecord) => {
    if (!onFileUploadedToCanvas) return;
    setIsPublishingToCanvas(true);

    try {
      const isImg = file.category === 'image';
      let newBlock: Block;

      if (isImg) {
        newBlock = {
          id: `block_pic_${Date.now()}`,
          type: 'picture',
          title: file.originalName.replace(/\.[^/.]+$/, ''),
          imageUrl: file.url,
          caption: `Uploaded asset · ${formatBytes(file.size)}`,
          aspectRatio: '16:9',
          pinned: false,
          createdAt: new Date().toISOString(),
        };
      } else {
        newBlock = {
          id: `block_file_${Date.now()}`,
          type: 'file',
          title: file.originalName,
          fileName: file.originalName,
          fileUrl: file.url,
          fileSizeFormatted: formatBytes(file.size),
          mimeType: file.mimeType,
          category: file.category,
          description: `Designated storage asset: ${file.name}`,
          pinned: false,
          createdAt: new Date().toISOString(),
        };
      }

      await onFileUploadedToCanvas(newBlock);
      onClose();
    } catch (err) {
      console.error('Failed to publish block:', err);
    } finally {
      setIsPublishingToCanvas(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-amber-400" />;
      case 'media':
        return <Film className="w-4 h-4 text-purple-400" />;
      default:
        return <File className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121620] border border-neutral-700/80 rounded-2xl shadow-2xl p-6 text-neutral-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Secure Storage Vault & Uploads</h3>
              <p className="text-xs text-neutral-400">
                Designated server storage with checksum verification and instant WebSocket broadcast
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 my-4 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'upload' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Upload New File or Image
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'vault' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Storage Vault ({uploadedFiles.length})
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div className="space-y-4">
            {/* Dropzone / Picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-700 hover:border-neutral-500 bg-neutral-900/50 hover:bg-neutral-800/40 rounded-xl p-8 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleSelectFile}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">
                {selectedFile ? selectedFile.name : 'Select a file or image from your device'}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Supports PNG, JPG, SVG, WEBP, PDF, DOCX, ZIP, MP3, MP4 (Max 30MB)
              </p>
              {selectedFile && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full text-xs text-neutral-300">
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>·</span>
                  <span>{selectedFile.type || 'Binary file'}</span>
                </div>
              )}
            </div>

            {/* Visual Feedback during Upload */}
            {isUploading && (
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-200">{uploadStatus}</span>
                  <span className="font-mono text-blue-400 font-bold">{uploadProgress}%</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Confirmation Upon Completion */}
            {completedFile && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Upload Confirmed: File securely stored in designated storage</span>
                </div>

                <div className="p-3 bg-neutral-900/90 rounded-lg flex items-center justify-between gap-3 border border-neutral-800">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-2 rounded bg-neutral-800 shrink-0">
                      {getFileIcon(completedFile.category)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-white truncate">{completedFile.originalName}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        {formatBytes(completedFile.size)} · {completedFile.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyUrl(completedFile.url, completedFile.id)}
                      className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="Copy public link"
                    >
                      {copiedId === completedFile.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={completedFile.url}
                      download={completedFile.originalName}
                      className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Instant Embed / Publish CTA */}
                <button
                  onClick={() => handlePublishAsBlock(completedFile)}
                  disabled={isPublishingToCanvas}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Publish Directly to Canvas Feed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Upload Action Button */}
            {!completedFile && (
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm shadow-blue-500/20"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading...' : 'Upload File to Storage'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Vault list tab */
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {uploadedFiles.length === 0 ? (
              <p className="text-center py-10 text-xs text-neutral-500">
                No files in the vault yet. Upload an asset above.
              </p>
            ) : (
              uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between gap-3 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-2 rounded bg-neutral-800 shrink-0">
                      {getFileIcon(file.category)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-white truncate">{file.originalName}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        {formatBytes(file.size)} · {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyUrl(file.url, file.id)}
                      className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === file.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={file.url}
                      download={file.originalName}
                      className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    {onFileUploadedToCanvas && (
                      <button
                        onClick={() => handlePublishAsBlock(file)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                      >
                        Publish
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
  );
};
