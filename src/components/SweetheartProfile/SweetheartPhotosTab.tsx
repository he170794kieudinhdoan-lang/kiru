'use client';

import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, Maximize2, Filter } from 'lucide-react';
import { MaiHoaMediaItem } from '@/types/maihoa';
import { SweetheartCategory } from '@/types/sweetheart';

interface SweetheartPhotosTabProps {
  photos: MaiHoaMediaItem[];
  categories?: SweetheartCategory[];
  onOpenPhoto: (item: MaiHoaMediaItem) => void;
}

export const SweetheartPhotosTab: React.FC<SweetheartPhotosTabProps> = ({
  photos,
  categories = [],
  onOpenPhoto,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  const filteredPhotos = useMemo(() => {
    if (selectedFolder === 'all') return photos;
    return photos.filter((p) => p.folder === selectedFolder || p.relPath?.startsWith(selectedFolder + '/'));
  }, [photos, selectedFolder]);

  return (
    <div className="neo-box p-4 sm:p-5 bg-white space-y-4 sm:space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <h2 className="text-xl font-black font-kiru text-black flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-neo-pink" /> Album Ảnh Của Bé Thảo
          </h2>
          <p className="text-xs font-mono text-zinc-500">
            {filteredPhotos.length} / {photos.length} bức ảnh phân loại theo từng phong cách outfit
          </p>
        </div>

        {/* Category Filter Dropdown */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-zinc-600 shrink-0" />
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="neo-input text-xs font-bold py-1.5 px-3 rounded-lg border-2 border-black bg-yellow-50 focus:bg-white w-full sm:w-auto"
            >
              <option value="all">🌟 Tất cả album ({photos.length} ảnh)</option>
              {categories
                .filter((c) => c.imageCount > 0)
                .map((c) => (
                  <option key={c.folder} value={c.folder}>
                    📁 {c.title} ({c.imageCount} ảnh)
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Category Pills Quick Selector */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`neo-badge shrink-0 cursor-pointer transition-all ${
              selectedFolder === 'all'
                ? 'bg-black text-white scale-105'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Tất cả ({photos.length})
          </button>
          {categories
            .filter((c) => c.imageCount > 0)
            .map((c) => {
              const isSelected = selectedFolder === c.folder;
              return (
                <button
                  key={c.folder}
                  onClick={() => setSelectedFolder(isSelected ? 'all' : c.folder)}
                  className={`neo-badge shrink-0 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neo-pink text-white scale-105 shadow-neo-sm'
                      : 'bg-white text-zinc-700 hover:bg-neo-yellow hover:text-black'
                  }`}
                >
                  #{c.title} ({c.imageCount})
                </button>
              );
            })}
        </div>
      )}

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 font-mono text-xs">
          Không có ảnh trong album này.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          {filteredPhotos.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onOpenPhoto(item)}
              className="neo-box aspect-square relative group overflow-hidden cursor-pointer bg-zinc-100 hover:-translate-y-1 hover:shadow-neo transition-all duration-150 select-none"
            >
              <img
                src={item.thumbUrl || item.url}
                alt={item.filename}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                <span className="neo-badge bg-neo-yellow text-black text-[9px] py-0 px-1 font-bold truncate max-w-[110px]">
                  {item.folderTitle || `#${idx + 1}`}
                </span>
                <div className="p-1 bg-white border border-black shadow-neo-sm">
                  <Maximize2 className="w-3 h-3 text-black" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
