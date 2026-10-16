import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Code,
  Trash2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export interface UploadedImage {
  filename: string;
  url: string;
  uploadedAt: number;
}

interface ImageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImageIntoHtml?: (imgTag: string) => void;
  onSelectProjectImage?: (imageUrl: string) => void;
  projectId?: string;
}

export const ImageManagerModal: React.FC<ImageManagerModalProps> = ({
  isOpen,
  onClose,
  onInsertImageIntoHtml,
  onSelectProjectImage,
  projectId,
}) => {
  if (!isOpen) return null;

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (err) {
      console.error('Failed to load images:', err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage('Uploading image...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            data: base64Data,
          }),
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();

        setStatusMessage('Image uploaded successfully!');
        fetchImages();

        // If selecting as project image
        if (onSelectProjectImage) {
          onSelectProjectImage(data.url);
        }

        setTimeout(() => setStatusMessage(null), 3000);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setStatusMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = new URL(url, window.location.origin).href;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const handleCopyTag = (url: string, filename: string) => {
    const tag = `<img src="${url}" alt="${filename}" style="max-width: 100%; border-radius: 14px; margin: 12px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" />`;
    navigator.clipboard.writeText(tag).then(() => {
      setCopiedTag(url);
      setTimeout(() => setCopiedTag(null), 2000);
    });
  };

  const handleInsert = (url: string, filename: string) => {
    const tag = `<img src="${url}" alt="${filename}" style="max-width: 100%; border-radius: 14px; margin: 12px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" />`;
    if (onInsertImageIntoHtml) {
      onInsertImageIntoHtml(tag);
      setStatusMessage('Inserted into HTML editor!');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c1424] border border-cyan-500/50 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col max-h-[88vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Upload & Manage Project Images
              </h3>
              <p className="text-xs text-slate-400">
                Upload photos, charts, and diagrams for your sustainability widgets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Action Box */}
        <div className="bg-[#060a14] border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-6 text-center mb-4 transition-colors shrink-0">
          <input
            type="file"
            id="image-file-input"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="image-file-input"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300 hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-white">
              {uploading ? 'Uploading Image...' : 'Click to Upload Image from Device'}
            </div>
            <p className="text-[11px] text-slate-400">
              Supports PNG, JPG, JPEG, SVG, WebP, GIF (up to 20MB)
            </p>
          </label>
        </div>

        {statusMessage && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono mb-3 shrink-0">
            {statusMessage}
          </div>
        )}

        {/* Image Gallery */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider">
              Uploaded Images ({images.length})
            </span>
          </div>

          {images.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-[#060a14] rounded-xl border border-slate-800">
              <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p>No images uploaded yet. Upload an image above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {images.map((img) => (
                <div
                  key={img.url}
                  className="bg-[#080f1e] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3 flex flex-col justify-between transition-all"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0 bg-black/40"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate" title={img.filename}>
                        {img.filename}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 truncate">
                        {img.url}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                    {onInsertImageIntoHtml && (
                      <button
                        onClick={() => handleInsert(img.url, img.filename)}
                        className="flex-1 px-2 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Code className="w-3 h-3" />
                        <span>Insert in HTML</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyTag(img.url, img.filename)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold rounded-lg transition-colors border border-slate-700 flex items-center gap-1"
                      title="Copy HTML <img> tag"
                    >
                      {copiedTag === img.url ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedTag === img.url ? 'Tag Copied' : 'Copy <img>'}</span>
                    </button>

                    <button
                      onClick={() => handleCopyUrl(img.url)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold rounded-lg transition-colors border border-slate-700 flex items-center gap-1"
                      title="Copy Image URL"
                    >
                      {copiedUrl === img.url ? <Check className="w-3 h-3 text-emerald-400" /> : <ExternalLink className="w-3 h-3" />}
                      <span>{copiedUrl === img.url ? 'URL Copied' : 'URL'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Images are saved on server and directly embeddable.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
