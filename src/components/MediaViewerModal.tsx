'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, Film, Image as ImageIcon, Calendar, HardDrive, Trash2, Loader2 } from 'lucide-react';
import { VaultFileItem } from '@/lib/supabase';
import { formatBytes, formatDate } from '@/lib/utils';

interface MediaViewerModalProps {
  file: VaultFileItem | null;
  onClose: () => void;
  onDelete?: (file: VaultFileItem) => Promise<void> | void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ file, onClose, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName || file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      // Fallback direct link
      window.open(file.url, '_blank');
    }
  };

  const handleDelete = async () => {
    if (!file || !onDelete) return;
    const confirmDelete = window.confirm(`Bạn có chắc muốn xoá vĩnh viễn tệp "${file.originalName}" khỏi máy chủ?`);
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await onDelete(file);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi khi xoá tệp khỏi máy chủ');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="neo-box-lg max-w-4xl w-full bg-[#FFFDF9] max-h-[95vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-black p-4 bg-white">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <div className="p-1.5 bg-neo-yellow border-2 border-black shadow-neo-sm shrink-0">
              {file.isVideo ? <Film className="w-4 h-4 text-black" /> : <ImageIcon className="w-4 h-4 text-black" />}
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-black truncate text-black">{file.originalName}</h3>
              <p className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <span>{formatDate(file.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="neo-btn bg-white hover:bg-neo-cyan px-2.5 py-1.5 text-xs font-bold flex items-center gap-1"
              title="Copy đường dẫn trực tiếp"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Đã copy' : 'Copy link'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="neo-btn bg-neo-lime text-black px-3 py-1.5 text-xs font-bold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải về</span>
            </button>

            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="neo-btn bg-neo-pink hover:bg-red-500 text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1 shadow-neo-sm transition-colors"
                title="Xoá vĩnh viễn khỏi máy chủ"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{deleting ? 'Đang xoá...' : 'Xoá'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 border-2 border-black bg-white hover:bg-neo-pink hover:text-white shadow-neo-sm transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Preview Body */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-950/90 min-h-[300px]">
          {file.isVideo ? (
            <video
              src={file.url}
              controls
              autoPlay
              playsInline
              className="max-h-[65vh] w-auto max-w-full rounded-none border-2 border-white shadow-neo-lg"
            />
          ) : (
            <img
              src={file.url}
              alt={file.originalName}
              className="max-h-[65vh] w-auto max-w-full object-contain border-2 border-white shadow-neo-lg bg-black/40"
            />
          )}
        </div>

        {/* Footer Info Strip */}
        <div className="border-t-3 border-black p-3 bg-white flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-4 text-zinc-600">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" />
              {formatBytes(file.size)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(file.createdAt)}
            </span>
          </div>

          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-black hover:underline font-bold"
          >
            <span>Mở link gốc tab mới</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
