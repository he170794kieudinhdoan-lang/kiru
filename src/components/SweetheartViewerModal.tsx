'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  Heart,
  Film,
  Sparkles,
} from 'lucide-react';
import { SweetheartItem } from '@/types/sweetheart';
import { formatBytes } from '@/lib/utils';

interface SweetheartViewerModalProps {
  items: SweetheartItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export const SweetheartViewerModal: React.FC<SweetheartViewerModalProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  isFavorite,
  onToggleFavorite,
}) => {
  const currentItem = items[currentIndex];

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan when index changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImageLoaded(false);
  }, [currentIndex]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current && showThumbnails) {
      const activeEl = thumbnailsRef.current.children[currentIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex, showThumbnails]);

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    onSelectIndex((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    onSelectIndex((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.35, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const nextZoom = Math.max(prev - 0.35, 0.6);
      if (nextZoom <= 1) {
        setPan({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (currentItem?.isVideo) return;
    if (zoom > 1.2) {
      handleResetZoom();
    } else {
      setZoom(2.5);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (currentItem?.isVideo) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setZoom((prev) => {
      const next = Math.max(0.6, Math.min(5, prev + delta));
      if (next <= 1) {
        setPan({ x: 0, y: 0 });
      }
      return parseFloat(next.toFixed(2));
    });
  };

  // Drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1 || currentItem?.isVideo) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation & controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen?.();
          } else {
            onClose();
          }
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          handlePrev();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose, handleNext, handlePrev, handleZoomIn, handleZoomOut, handleResetZoom]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCopyLink = () => {
    if (!currentItem) return;
    const fullUrl = window.location.origin + currentItem.url;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!currentItem) return;
    try {
      const res = await fetch(currentItem.url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = currentItem.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch {
      window.open(currentItem.url, '_blank');
    }
  };

  if (!isOpen || !currentItem) return null;

  const favorite = isFavorite(currentItem.id);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 text-white select-none backdrop-blur-md transition-all"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Floating Action Bar */}
      <header className="relative z-30 flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 bg-black/60 border-b border-zinc-800 backdrop-blur-md">
        {/* Left: Info & Tag */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-neo-yellow text-black font-mono font-black text-xs border-2 border-black shadow-neo-sm">
              {currentIndex + 1} / {items.length}
            </span>
            <span className="hidden sm:inline-block px-2.5 py-1 bg-zinc-800 text-zinc-200 font-bold text-xs border border-zinc-700 truncate max-w-[200px]">
              {currentItem.folderTitle}
            </span>
          </div>

          <div className="hidden md:block truncate max-w-sm">
            <p className="text-xs font-mono text-zinc-300 truncate">{currentItem.name}</p>
          </div>
        </div>

        {/* Center: Zoom Controls (for Images) */}
        {!currentItem.isVideo && (
          <div className="flex items-center gap-1 sm:gap-2 bg-zinc-900/90 border border-zinc-700 px-2 py-1 shadow-lg">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.6}
              className="p-1.5 hover:bg-zinc-800 disabled:opacity-30 transition-colors text-zinc-200"
              title="Thu nhỏ (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span
              onClick={handleResetZoom}
              className="cursor-pointer px-2 py-0.5 text-xs font-mono font-bold text-neo-yellow hover:underline"
              title="Nhấn để đưa về 100%"
            >
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 5}
              className="p-1.5 hover:bg-zinc-800 disabled:opacity-30 transition-colors text-zinc-200"
              title="Phóng to (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white ml-1"
              title="Đặt lại góc nhìn (0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Favorite Toggle */}
          <button
            onClick={() => onToggleFavorite(currentItem.id)}
            className={`p-2 border-2 border-black shadow-neo-sm transition-transform active:scale-95 ${
              favorite ? 'bg-neo-pink text-white' : 'bg-zinc-900 text-zinc-300 hover:text-neo-pink'
            }`}
            title={favorite ? 'Bỏ thích' : 'Yêu thích bé'}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="p-2 border-2 border-black bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white shadow-neo-sm transition-colors"
            title="Copy link ảnh"
          >
            {copied ? <Check className="w-4 h-4 text-neo-lime" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 border-2 border-black bg-neo-lime text-black hover:brightness-110 shadow-neo-sm transition-colors"
            title="Tải ảnh gốc về máy"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 border-2 border-black bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white shadow-neo-sm hidden sm:inline-flex"
            title="Toàn màn hình (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 border-2 border-black bg-neo-pink hover:bg-red-600 text-white shadow-neo-sm transition-transform active:scale-95 ml-1"
            title="Đóng (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <div
        className={`relative flex-1 flex items-center justify-center overflow-hidden ${
          zoom > 1 && !currentItem.isVideo
            ? isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-default'
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 z-20 p-3 sm:p-4 bg-black/70 hover:bg-neo-yellow hover:text-black text-white border-2 border-black shadow-neo-lg transition-all hover:scale-110 active:scale-95"
              title="Ảnh trước (Mũi tên trái)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 z-20 p-3 sm:p-4 bg-black/70 hover:bg-neo-yellow hover:text-black text-white border-2 border-black shadow-neo-lg transition-all hover:scale-110 active:scale-95"
              title="Ảnh tiếp theo (Mũi tên phải)"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </>
        )}

        {/* Media Content */}
        {currentItem.isVideo ? (
          <div className="max-w-[92vw] max-h-[80vh] flex items-center justify-center p-2">
            <video
              key={currentItem.url}
              src={currentItem.url}
              controls
              autoPlay
              playsInline
              loop
              className="max-w-full max-h-[78vh] object-contain border-2 border-neo-yellow shadow-neo-2xl bg-black"
            />
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-4 transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Loading shimmer */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-neo-yellow border-t-transparent animate-spin" />
              </div>
            )}

            <img
              ref={imageRef}
              src={currentItem.url}
              alt={currentItem.name}
              onLoad={() => setImageLoaded(true)}
              className={`max-w-[90vw] max-h-[78vh] object-contain select-none shadow-2xl transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              draggable={false}
            />
          </div>
        )}

        {/* Quick Hint Toast on Zoom */}
        {zoom > 1 && !currentItem.isVideo && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 px-3 py-1.5 text-[11px] font-mono text-zinc-300 border border-zinc-700 pointer-events-none rounded-full flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-neo-yellow animate-spin" />
            <span>Kéo chuột để di chuyển • Cuộn chuột để phóng to/thu nhỏ</span>
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {showThumbnails && items.length > 1 && (
        <div className="relative z-30 bg-black/80 border-t border-zinc-800 p-2 backdrop-blur-md">
          <div
            ref={thumbnailsRef}
            className="flex items-center gap-2 overflow-x-auto py-1 px-2 scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {items.map((item, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectIndex(idx)}
                  className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden border-2 transition-all ${
                    isSelected
                      ? 'border-neo-yellow scale-105 shadow-neo-sm ring-2 ring-neo-yellow'
                      : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                  }`}
                >
                  {item.isVideo ? (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                      <Film className="w-5 h-5 text-neo-cyan" />
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {isFavorite(item.id) && (
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-neo-pink ring-1 ring-black" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
