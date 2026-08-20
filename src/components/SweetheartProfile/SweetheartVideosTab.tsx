'use client';

import React, { useState, useMemo } from 'react';
import { Film, Play, Eye, Flame, Filter } from 'lucide-react';
import { MaiHoaMediaItem } from '@/types/maihoa';
import { SweetheartCategory } from '@/types/sweetheart';

interface SweetheartVideosTabProps {
  videos: MaiHoaMediaItem[];
  categories?: SweetheartCategory[];
  onOpenVideo: (item: MaiHoaMediaItem) => void;
}

export const SweetheartVideosTab: React.FC<SweetheartVideosTabProps> = ({
  videos,
  categories = [],
  onOpenVideo,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'reels' | 'popular'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  const filteredVideos = useMemo(() => {
    let list = videos;
    if (selectedFolder !== 'all') {
      list = list.filter((v) => v.folder === selectedFolder || v.relPath?.startsWith(selectedFolder + '/'));
    }
    if (activeFilter === 'popular') {
      // Return top viewed or prioritized clips
      list = [...list].reverse();
    }
    return list;
  }, [videos, selectedFolder, activeFilter]);

  return (
    <div className="neo-box p-4 sm:p-5 bg-white space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div>
          <h2 className="text-xl font-black font-kiru text-black flex items-center gap-2">
            <Film className="w-5 h-5 text-neo-yellow fill-black" /> Video & Reels Bé Thảo
          </h2>
          <p className="text-xs font-mono text-zinc-500">
            {filteredVideos.length} / {videos.length} clip quay cận cảnh trong phòng ngủ, nhà tắm & dã ngoại
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 border-2 border-black rounded-lg w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded whitespace-nowrap transition-all ${
              activeFilter === 'all' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Tất cả ({videos.length})
          </button>
          <button
            onClick={() => setActiveFilter('reels')}
            className={`px-3 py-1 text-xs font-bold rounded whitespace-nowrap transition-all ${
              activeFilter === 'reels' ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Reels / Shorts
          </button>
          <button
            onClick={() => setActiveFilter('popular')}
            className={`px-3 py-1 text-xs font-bold rounded whitespace-nowrap flex items-center gap-1 transition-all ${
              activeFilter === 'popular' ? 'bg-neo-pink text-white' : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Flame className="w-3 h-3" /> Thịnh hành
          </button>
        </div>
      </div>

      {/* Category Pills for Videos */}
      {categories.some((c) => c.videoCount > 0) && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`neo-badge shrink-0 cursor-pointer transition-all ${
              selectedFolder === 'all'
                ? 'bg-black text-white scale-105'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Tất cả clip ({videos.length})
          </button>
          {categories
            .filter((c) => c.videoCount > 0)
            .map((c) => {
              const isSelected = selectedFolder === c.folder;
              return (
                <button
                  key={c.folder}
                  onClick={() => setSelectedFolder(isSelected ? 'all' : c.folder)}
                  className={`neo-badge shrink-0 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neo-yellow text-black scale-105 shadow-neo-sm'
                      : 'bg-white text-zinc-700 hover:bg-neo-yellow hover:text-black'
                  }`}
                >
                  🎬 {c.title} ({c.videoCount})
                </button>
              );
            })}
        </div>
      )}

      {/* Videos 9:16 Reels Grid */}
      {filteredVideos.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 font-mono text-xs">
          Không có video clip trong danh mục này.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredVideos.map((item, idx) => {
            const fakeViews = ((idx * 9 + 18) * 1420).toLocaleString();
            return (
              <div
                key={item.id}
                onClick={() => onOpenVideo(item)}
                className="neo-box aspect-[9/16] relative group overflow-hidden cursor-pointer bg-zinc-950 hover:-translate-y-1.5 hover:shadow-neo-lg transition-all duration-200 select-none flex flex-col justify-between"
              >
                {/* Thumbnail Background */}
                <img
                  src={item.thumbUrl}
                  alt={item.filename}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                />

                {/* Gradient Scrims */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                {/* Top Badges */}
                <div className="relative z-10 p-2 flex items-center justify-between">
                  <span className="neo-badge bg-neo-yellow text-black text-[9px] font-black py-0.5 px-1 shadow-none border border-black">
                    REELS
                  </span>
                  <span className="neo-badge bg-black/80 text-white text-[9px] font-mono py-0.5 px-1 border border-white/60">
                    {item.duration || 15}s
                  </span>
                </div>

                {/* Central Play Button */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-neo-pink border-2 border-black text-white flex items-center justify-center shadow-neo-sm group-hover:scale-110 group-hover:bg-neo-yellow group-hover:text-black transition-all">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>

                {/* Bottom Info & Views Counter */}
                <div className="relative z-10 p-2.5 text-white space-y-1">
                  <p className="text-[11px] font-bold truncate drop-shadow">
                    {item.folderTitle || `Clip #${idx + 1}`}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-300 font-mono">
                    <Eye className="w-3 h-3 text-neo-yellow" />
                    <span>{fakeViews} lượt xem</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
