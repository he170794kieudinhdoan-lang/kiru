'use client';

import React, { useState, useEffect, memo, useCallback } from 'react';
import { 
  Download, 
  Eye, 
  FileQuestion, 
  Play, 
  Clock,
  Trash2,
  Loader2
} from 'lucide-react';
import { VaultFileItem } from '@/lib/supabase';
import { formatBytes, formatRemainingTime } from '@/lib/utils';

interface MediaGalleryProps {
  vaultKey?: string;
  files: VaultFileItem[];
  loading: boolean;
  onSelectFile: (file: VaultFileItem) => void;
  onDeleteFile: (file: VaultFileItem) => Promise<void> | void;
  onDeleteAll?: () => Promise<void> | void;
}

// Isolated countdown badge: Only updates itself every second without re-rendering parent/media grid!
const CountdownBadge = memo(({ expiresAt }: { expiresAt: number }) => {
  const [text, setText] = useState(() => formatRemainingTime(expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setText(formatRemainingTime(expiresAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <span className="neo-badge bg-black/85 text-neo-yellow text-[9px] sm:text-[10px] px-1.5 py-0.5 border-black">
      ⏱️ {text}
    </span>
  );
});
CountdownBadge.displayName = 'CountdownBadge';

// Memoized MediaCard: Zero re-renders on timer ticks!
const MediaCard = memo(({
  file,
  onSelect,
  onDownload,
  onDelete,
}: {
  file: VaultFileItem;
  onSelect: (file: VaultFileItem) => void;
  onDownload: (file: VaultFileItem, e: React.MouseEvent) => void;
  onDelete: (file: VaultFileItem, e: React.MouseEvent) => Promise<void> | void;
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Bạn có chắc muốn xoá vĩnh viễn tệp "${file.originalName}" khỏi máy chủ?`);
    if (!confirmed) return;

    try {
      setDeleting(true);
      await onDelete(file, e);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(file)}
      className="neo-box group bg-white overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-neo-lg transition-all duration-100 flex flex-col"
    >
      {/* Thumbnail Box */}
      <div className="w-full aspect-square bg-zinc-900 border-b-2 border-black relative overflow-hidden flex items-center justify-center">
        {file.isImage ? (
          <img
            src={file.url}
            alt={file.originalName}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
          />
        ) : (
          <div className="relative w-full h-full bg-zinc-900 flex items-center justify-center">
            <video
              src={file.url}
              preload="none"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="w-9 h-9 bg-neo-yellow border-2 border-black flex items-center justify-center shadow-neo-sm z-10">
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            </div>
          </div>
        )}

        {/* Isolated Expiry Badge */}
        <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
          <CountdownBadge expiresAt={file.expiresAt} />
        </div>

        {/* View Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="neo-btn bg-white px-2.5 py-1 text-xs font-black shadow-neo-sm flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Xem</span>
          </span>
        </div>
      </div>

      {/* Info and Actions */}
      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between bg-white">
        <div>
          <h4 className="text-xs font-black truncate text-black mb-0.5" title={file.originalName}>
            {file.originalName}
          </h4>
          <p className="text-[10px] font-mono text-zinc-500">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Action Buttons: Tải Về & Xoá */}
        <div className="mt-2 pt-1.5 border-t border-black/10 grid grid-cols-2 gap-1.5">
          <button
            onClick={(e) => onDownload(file, e)}
            className="neo-btn bg-neo-lime hover:bg-green-400 text-black py-1.5 px-1 text-[11px] font-black flex items-center justify-center gap-1 shadow-neo-sm"
            title="Tải về máy"
          >
            <Download className="w-3 h-3" />
            <span>Tải Về</span>
          </button>

          <button
            onClick={handleDeleteClick}
            disabled={deleting}
            className="neo-btn bg-neo-pink hover:bg-red-500 text-white py-1.5 px-1 text-[11px] font-black flex items-center justify-center gap-1 shadow-neo-sm transition-colors"
            title="Xoá vĩnh viễn khỏi máy chủ"
          >
            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            <span>{deleting ? '...' : 'Xoá'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});
MediaCard.displayName = 'MediaCard';

export const MediaGallery: React.FC<MediaGalleryProps> = memo(({
  files,
  loading,
  onSelectFile,
  onDeleteFile,
  onDeleteAll,
}) => {
  const handleDownload = useCallback(async (file: VaultFileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(file.url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName || file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(file.url, '_blank');
    }
  }, []);

  return (
    <div className="w-full">
      {/* Header with 30m auto-expiry badge & Delete all */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-zinc-600">
            Danh sách tệp ({files.length})
          </span>

          {files.length > 0 && onDeleteAll && (
            <button
              onClick={onDeleteAll}
              className="text-[11px] font-bold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 cursor-pointer"
              title="Xoá tất cả tệp trong khoá khỏi máy chủ"
            >
              <Trash2 className="w-3 h-3" />
              <span>Xoá tất cả</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 border border-black/20">
          <Clock className="w-3 h-3 text-zinc-600" />
          <span>Tự động xoá sau 30 phút</span>
        </div>
      </div>

      {/* Empty State */}
      {!loading && files.length === 0 && (
        <div className="neo-box bg-white p-8 text-center my-4">
          <div className="w-12 h-12 mx-auto mb-2 bg-neo-yellow border-2 border-black flex items-center justify-center shadow-neo-sm rotate-2">
            <FileQuestion className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-sm font-black uppercase text-black mb-0.5">
            Chưa có tệp nào
          </h3>
          <p className="text-xs text-zinc-500 font-medium">
            Kéo thả hoặc bấm chọn ảnh/video ở trên để tải lên
          </p>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {files.map((file) => (
          <MediaCard
            key={file.id}
            file={file}
            onSelect={onSelectFile}
            onDownload={handleDownload}
            onDelete={onDeleteFile}
          />
        ))}
      </div>
    </div>
  );
});
MediaGallery.displayName = 'MediaGallery';

