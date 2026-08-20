'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Heart,
  Search,
  Film,
  Image as ImageIcon,
  Maximize2,
  Edit3,
  X,
  Play,
} from 'lucide-react';
import { SweetheartItem, SweetheartApiResponse } from '@/types/sweetheart';
import { SweetheartViewerModal } from './SweetheartViewerModal';

interface SweetheartGalleryProps {
  onBackToVault?: () => void;
}

// Optimized Lazy-Loading Media Card with Skeleton placeholder
const LazyMediaCard = memo(({
  item,
  index,
  isFav,
  onToggleFav,
  onClick,
}: {
  item: SweetheartItem;
  index: number;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onClick: (index: number) => void;
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      onClick={() => onClick(index)}
      className="neo-box aspect-square group relative overflow-hidden cursor-pointer bg-zinc-100 hover:-translate-y-0.5 hover:shadow-neo-lg transition-all duration-150 select-none"
    >
      {/* Skeleton Shimmer Background while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 animate-pulse" />
      )}

      {/* Compressed Thumbnail Image (WebP ~10KB) */}
      <img
        src={item.thumbUrl || item.url}
        alt={item.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />

      {/* Video Badge & Play Icon Overlay */}
      {item.isVideo && (
        <>
          <span className="absolute top-1.5 left-1.5 z-10 neo-badge bg-neo-yellow text-black text-[9px] py-0.5 px-1 flex items-center gap-1 shadow-none border border-black font-bold">
            <Film className="w-2.5 h-2.5" /> CLIP
          </span>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 group-hover:bg-black/0 transition-colors">
            <div className="w-8 h-8 rounded-full bg-black/70 border border-white/80 text-white flex items-center justify-center shadow-neo-sm group-hover:scale-110 transition-transform">
              <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
            </div>
          </div>
        </>
      )}

      {/* Favorite Heart Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav(item.id);
        }}
        className={`absolute top-1.5 right-1.5 z-10 p-1 rounded-full border border-black shadow-neo-sm transition-all ${
          isFav
            ? 'bg-neo-pink text-white opacity-100 scale-100'
            : 'bg-white/85 text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-neo-pink hover:text-white'
        }`}
        title={isFav ? 'Bỏ thích' : 'Yêu thích bé'}
      >
        <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
      </button>

      {/* Quick Zoom Indicator on Hover */}
      <div className="absolute bottom-1.5 right-1.5 p-1 bg-neo-yellow text-black border border-black shadow-neo-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Maximize2 className="w-3 h-3" />
      </div>
    </div>
  );
});

LazyMediaCard.displayName = 'LazyMediaCard';

export const SweetheartGallery: React.FC<SweetheartGalleryProps> = ({ onBackToVault }) => {
  const [data, setData] = useState<SweetheartApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Custom Banner Title (Persisted)
  const [customTitle, setCustomTitle] = useState<string>('Kho Ảnh Bé Iu');
  const [customSubtitle, setCustomSubtitle] = useState<string>(
    'Bộ sưu tập khoảnh khắc xinh xắn & đáng yêu'
  );
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>('');
  const [tempSubtitle, setTempSubtitle] = useState<string>('');

  // 3 Rotating Hero Images State (3:4 ratio, changes every 5s)
  const [heroIndices, setHeroIndices] = useState<[number, number, number]>([0, 1, 2]);
  const [heroFading, setHeroFading] = useState<boolean>(false);

  // Filters & State
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Lightbox Modal
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  // Fetch Media Data
  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sweetheart');
      if (!res.ok) {
        throw new Error(`Lỗi tải dữ liệu: ${res.statusText}`);
      }
      const json: SweetheartApiResponse = await res.json();
      if (!json.success && json.error) {
        throw new Error(json.error);
      }
      setData(json);
    } catch (err: any) {
      console.error('Error fetching sweetheart gallery:', err);
      setError(err.message || 'Không thể tải kho ảnh');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();

    // Load custom title & favorites from localStorage
    try {
      const savedTitle = localStorage.getItem('sweetheart_custom_title');
      if (savedTitle) setCustomTitle(savedTitle);

      const savedSubtitle = localStorage.getItem('sweetheart_custom_subtitle');
      if (savedSubtitle) setCustomSubtitle(savedSubtitle);

      const savedFavs = localStorage.getItem('sweetheart_favs');
      if (savedFavs) {
        setFavorites(new Set(JSON.parse(savedFavs)));
      }
    } catch (e) {
      // Ignore
    }
  }, [loadMedia]);

  // List of images for rotating banner
  const imageItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((item) => !item.isVideo);
  }, [data?.items]);

  // Auto change 3 hero images every 5 seconds randomly
  useEffect(() => {
    if (imageItems.length <= 1) return;

    const interval = setInterval(() => {
      setHeroFading(true);
      setTimeout(() => {
        setHeroIndices(([prev1, prev2, prev3]) => {
          const total = imageItems.length;
          const pickDistinct = () => {
            const picks = new Set<number>();
            let attempts = 0;
            while (picks.size < Math.min(3, total) && attempts < 50) {
              picks.add(Math.floor(Math.random() * total));
              attempts++;
            }
            const arr = Array.from(picks);
            while (arr.length < 3) {
              arr.push(arr[0] || 0);
            }
            return [arr[0], arr[1], arr[2]] as [number, number, number];
          };
          return pickDistinct();
        });
        setHeroFading(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [imageItems]);

  const heroItem1 = imageItems[heroIndices[0]] || imageItems[0] || null;
  const heroItem2 = imageItems[heroIndices[1]] || imageItems[1] || imageItems[0] || null;
  const heroItem3 = imageItems[heroIndices[2]] || imageItems[2] || imageItems[0] || null;

  // Save Title Customization
  const handleSaveTitle = () => {
    const nextTitle = tempTitle.trim() || customTitle;
    const nextSub = tempSubtitle.trim();
    setCustomTitle(nextTitle);
    setCustomSubtitle(nextSub);
    try {
      localStorage.setItem('sweetheart_custom_title', nextTitle);
      localStorage.setItem('sweetheart_custom_subtitle', nextSub);
    } catch (e) {}
    setIsEditingTitle(false);
  };

  // Save favorites to localStorage
  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('sweetheart_favs', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  // Filter & Search items (Photos and Clips always together in one list)
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    let list = [...data.items];

    // Favorite toggle filter
    if (showOnlyFavorites) {
      list = list.filter((item) => favorites.has(item.id));
    }

    // Outfit / Category tag filter
    if (selectedTag !== 'all') {
      list = list.filter((item) => item.folderTitle.toLowerCase() === selectedTag.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          (item.name || item.filename || '').toLowerCase().includes(q) ||
          item.folderTitle.toLowerCase().includes(q) ||
          item.relPath.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data?.items, showOnlyFavorites, selectedTag, searchQuery, favorites]);

  // Open clicked banner image in Lightbox
  const handleOpenSpecificHero = (itemToOpen: SweetheartItem | null) => {
    if (!itemToOpen || !data?.items) return;
    const idx = filteredItems.findIndex((item) => item.id === itemToOpen.id);
    if (idx !== -1) {
      setModalIndex(idx);
    } else {
      const globalIdx = data.items.findIndex((item) => item.id === itemToOpen.id);
      if (globalIdx !== -1) {
        setSelectedTag('all');
        setShowOnlyFavorites(false);
        setSearchQuery('');
        setModalIndex(globalIdx);
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 pb-24 space-y-6">
      {/* ======================================================== */}
      {/* 🌟 VIBRANT BANNER WITH 3 ROTATING 3:4 PREVIEWS (5S) 🌟 */}
      {/* ======================================================== */}
      <section className="neo-box-lg bg-gradient-to-r from-[#FFFBE8] via-[#FFF1F2] to-[#F0F9FF] border-4 border-black relative overflow-hidden p-0 shadow-neo-lg">
        {/* Ambient background glow accents */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-neo-yellow/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/3 w-48 h-48 bg-neo-pink/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between p-5 sm:p-7 gap-6 min-h-[220px]">
          {/* Left: Custom Title & Personalized Area */}
          <div className="flex-1 flex flex-col justify-center space-y-3 w-full xl:w-auto">
            <div className="flex items-center gap-2">
              <span className="neo-badge bg-neo-pink text-white text-[11px] font-bold shadow-neo-sm">
                💖 Sweetheart
              </span>
              <span className="neo-badge bg-neo-yellow text-black text-[11px] font-bold shadow-neo-sm">
                ✨ Gallery
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black font-kiru tracking-tight leading-tight">
                  {customTitle}
                </h1>
                <button
                  onClick={() => {
                    setTempTitle(customTitle);
                    setTempSubtitle(customSubtitle);
                    setIsEditingTitle(true);
                  }}
                  className="p-1.5 border-2 border-black bg-white hover:bg-neo-yellow shadow-neo-sm transition-all"
                  title="Đổi tiêu đề banner"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {customSubtitle && (
                <p className="text-xs sm:text-sm font-mono text-zinc-700 max-w-lg">
                  {customSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: 3 Dynamic Rotating Compressed Previews in 3:4 Aspect Ratio (Changes every 5s) */}
          {heroItem1 && (
            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 shrink-0 w-full xl:w-auto overflow-x-auto py-1">
              {/* Photo 1 (3:4 ratio) */}
              <div
                onClick={() => handleOpenSpecificHero(heroItem1)}
                className="relative w-[100px] xs:w-[115px] sm:w-[135px] md:w-[145px] lg:w-[155px] aspect-[3/4] overflow-hidden cursor-pointer group border-3 border-black shadow-neo bg-zinc-950 transition-transform duration-200 hover:-translate-y-1 hover:shadow-neo-lg shrink-0"
                title="Nhấn để phóng to ảnh 1"
              >
                <img
                  src={heroItem1.thumbUrl || heroItem1.url}
                  alt={heroItem1.name}
                  loading="eager"
                  decoding="async"
                  className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                    heroFading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                  }`}
                />
                <div className="absolute top-1.5 right-1.5 z-20 p-1 bg-white/90 border border-black shadow-neo-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3 text-black" />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Photo 2 (3:4 ratio) */}
              {heroItem2 && (
                <div
                  onClick={() => handleOpenSpecificHero(heroItem2)}
                  className="relative w-[100px] xs:w-[115px] sm:w-[135px] md:w-[145px] lg:w-[155px] aspect-[3/4] overflow-hidden cursor-pointer group border-3 border-black shadow-neo bg-zinc-950 transition-transform duration-200 hover:-translate-y-1 hover:shadow-neo-lg shrink-0"
                  title="Nhấn để phóng to ảnh 2"
                >
                  <img
                    src={heroItem2.thumbUrl || heroItem2.url}
                    alt={heroItem2.name}
                    loading="eager"
                    decoding="async"
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                      heroFading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                    }`}
                  />
                  <div className="absolute top-1.5 right-1.5 z-20 p-1 bg-white/90 border border-black shadow-neo-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3 h-3 text-black" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              )}

              {/* Photo 3 (3:4 ratio) */}
              {heroItem3 && (
                <div
                  onClick={() => handleOpenSpecificHero(heroItem3)}
                  className="relative w-[100px] xs:w-[115px] sm:w-[135px] md:w-[145px] lg:w-[155px] aspect-[3/4] overflow-hidden cursor-pointer group border-3 border-black shadow-neo bg-zinc-950 transition-transform duration-200 hover:-translate-y-1 hover:shadow-neo-lg shrink-0"
                  title="Nhấn để phóng to ảnh 3"
                >
                  <img
                    src={heroItem3.thumbUrl || heroItem3.url}
                    alt={heroItem3.name}
                    loading="eager"
                    decoding="async"
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                      heroFading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                    }`}
                  />
                  <div className="absolute top-1.5 right-1.5 z-20 p-1 bg-white/90 border border-black shadow-neo-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3 h-3 text-black" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* ✏️ POPUP ĐỔI TIÊU ĐỀ ✏️ */}
      {/* ======================================================== */}
      {isEditingTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="neo-box-lg max-w-sm w-full bg-white p-5 space-y-4 relative">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-black text-base font-kiru">Đổi Tiêu Đề</h3>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1 border-2 border-black hover:bg-neo-pink hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1">
                  Tiêu đề chính:
                </label>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="Ví dụ: Kho Ảnh Bé Iu..."
                  className="neo-input text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1">
                  Mô tả phụ (không bắt buộc):
                </label>
                <input
                  type="text"
                  value={tempSubtitle}
                  onChange={(e) => setTempSubtitle(e.target.value)}
                  placeholder="Nhập mô tả..."
                  className="neo-input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                onClick={() => setIsEditingTitle(false)}
                className="neo-btn bg-white px-3 py-1.5 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveTitle}
                className="neo-btn bg-neo-yellow text-black px-4 py-1.5 text-xs font-black shadow-neo"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🔍 CONTROL BAR: SEARCH & THEME TAGS 🔍 */}
      {/* ======================================================== */}
      <div className="neo-box p-4 bg-white space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm trang phục, ảnh, video..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-black pl-9 pr-8 py-2 text-xs font-medium focus:bg-yellow-50 outline-none shadow-neo-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Favorite Filter Toggle */}
          {favorites.size > 0 && (
            <button
              onClick={() => setShowOnlyFavorites((prev) => !prev)}
              className={`neo-btn px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                showOnlyFavorites ? 'bg-neo-pink text-white shadow-neo' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current' : 'text-neo-pink'}`} />
              <span>Yêu Thích ({favorites.size})</span>
            </button>
          )}
        </div>

        {/* Outfit / Theme Tags Carousel */}
        {data?.categories && data.categories.length > 0 && (
          <div className="pt-2 border-t border-zinc-200">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => {
                  setSelectedTag('all');
                  setShowOnlyFavorites(false);
                }}
                className={`neo-badge shrink-0 cursor-pointer transition-colors ${
                  selectedTag === 'all' && !showOnlyFavorites
                    ? 'bg-black text-white'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Tất cả
              </button>

              {data.categories.map((cat) => {
                const isSelected = selectedTag.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedTag(isSelected ? 'all' : cat.name);
                      setShowOnlyFavorites(false);
                    }}
                    className={`neo-badge shrink-0 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neo-pink text-white scale-105'
                        : 'bg-white text-zinc-700 hover:bg-neo-yellow hover:text-black'
                    }`}
                  >
                    #{cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🖼️ COMPACT UNIFIED GRID: LAZY LOADING COMPRESSED PREVIEWS 🖼️ */}
      {/* ======================================================== */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 sm:gap-3">
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className="neo-box aspect-square bg-zinc-200 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="neo-box-lg p-8 bg-red-50 text-center space-y-3">
          <p className="text-red-600 font-bold">{error}</p>
          <button onClick={loadMedia} className="neo-btn bg-black text-white px-4 py-2 text-xs">
            Thử lại
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="neo-box-lg p-12 text-center bg-white space-y-4">
          <h3 className="text-lg font-black text-black">Không tìm thấy ảnh hoặc video nào</h3>
          <button
            onClick={() => {
              setSelectedTag('all');
              setShowOnlyFavorites(false);
              setSearchQuery('');
            }}
            className="neo-btn bg-neo-pink text-white px-4 py-2 text-xs font-bold"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        /* Permanent Compact Grid with LazyMediaCard Component */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 sm:gap-3">
          {filteredItems.map((item, index) => (
            <LazyMediaCard
              key={item.id}
              item={item}
              index={index}
              isFav={isFavorite(item.id)}
              onToggleFav={handleToggleFavorite}
              onClick={(idx) => setModalIndex(idx)}
            />
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 🔍 LIGHTBOX VIEWER MODAL WITH HIGH-RES ORIGINAL & DEEP ZOOM 🔍 */}
      {/* ======================================================== */}
      {modalIndex !== null && (
        <SweetheartViewerModal
          items={filteredItems}
          currentIndex={modalIndex}
          isOpen={modalIndex !== null}
          onClose={() => setModalIndex(null)}
          onSelectIndex={(idx) => setModalIndex(idx)}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};
