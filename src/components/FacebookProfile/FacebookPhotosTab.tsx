'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Grid, Sparkles, Maximize2 } from 'lucide-react';
import { MaiHoaMediaItem } from '@/types/maihoa';

interface FacebookPhotosTabProps {
  photos: MaiHoaMediaItem[];
  onOpenPhoto: (item: MaiHoaMediaItem) => void;
}

export const FacebookPhotosTab: React.FC<FacebookPhotosTabProps> = ({
  photos,
  onOpenPhoto,
}) => {
  const [photoFilter, setPhotoFilter] = useState<'all' | 'uploaded' | 'tagged'>('all');

  return (
    <div className="neo-box p-5 bg-white space-y-5">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <h2 className="text-xl font-black font-kiru text-black flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-neo-pink" /> Ảnh của Mai Hoa
          </h2>
          <p className="text-xs font-mono text-zinc-500">
            Tổng cộng {photos.length} tấm — có tấm hiền, có tấm dám
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 border-2 border-black rounded-lg">
          <button
            onClick={() => setPhotoFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded ${
              photoFilter === 'all' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Tất cả ảnh
          </button>
          <button
            onClick={() => setPhotoFilter('uploaded')}
            className={`px-3 py-1 text-xs font-bold rounded ${
              photoFilter === 'uploaded' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Ảnh tải lên ({photos.length})
          </button>
          <button
            onClick={() => setPhotoFilter('tagged')}
            className={`px-3 py-1 text-xs font-bold rounded ${
              photoFilter === 'tagged' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Album nổi bật
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {photos.map((item, idx) => (
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
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
              <span className="neo-badge bg-neo-yellow text-black text-[10px] py-0 px-1 font-bold">
                #{idx + 1}
              </span>
              <div className="p-1.5 bg-white border border-black shadow-neo-sm">
                <Maximize2 className="w-3.5 h-3.5 text-black" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
