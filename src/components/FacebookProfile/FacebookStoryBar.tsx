'use client';

import React from 'react';
import { Plus, Play } from 'lucide-react';
import { FacebookStory } from '@/types/maihoa';

interface FacebookStoryBarProps {
  stories: FacebookStory[];
  avatar: string;
  onOpenStory: (story: FacebookStory) => void;
}

export const FacebookStoryBar: React.FC<FacebookStoryBarProps> = ({
  stories,
  avatar,
  onOpenStory,
}) => {
  return (
    <div className="neo-box p-3 bg-white overflow-hidden">
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {/* Create Story Card */}
        <div className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-xl border-3 border-black bg-zinc-100 flex flex-col justify-between overflow-hidden shrink-0 group cursor-pointer shadow-neo-sm hover:-translate-y-1 transition-all select-none">
          <div className="h-32 sm:h-36 overflow-hidden">
            <img
              src={avatar}
              alt="Create Story"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="absolute top-28 sm:top-32 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-neo-yellow border-2 border-black flex items-center justify-center shadow-neo-sm">
            <Plus className="w-5 h-5 text-black stroke-[3]" />
          </div>
          <div className="h-12 bg-white flex items-end justify-center pb-2 px-1 text-center">
            <span className="text-[11px] font-black font-kiru leading-none">Tạo tin</span>
          </div>
        </div>

        {/* Story Cards */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => onOpenStory(story)}
            className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-xl border-3 border-black bg-zinc-900 overflow-hidden shrink-0 group cursor-pointer shadow-neo-sm hover:-translate-y-1 hover:shadow-neo transition-all select-none"
          >
            {/* Background Preview */}
            <img
              src={story.thumbUrl}
              alt={story.author}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-85 group-hover:opacity-100"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

            {/* Author Avatar Ring */}
            <div className="absolute top-2.5 left-2.5 z-10 w-9 h-9 rounded-full border-2 border-black bg-neo-pink p-0.5 shadow-neo-sm">
              <img
                src={story.avatar}
                alt={story.author}
                className="w-full h-full rounded-full object-cover border border-white"
              />
            </div>

            {/* Video Play Badge */}
            {story.isVideo && (
              <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-black/60 border border-white/80 flex items-center justify-center text-white">
                <Play className="w-3 h-3 fill-current translate-x-0.5" />
              </div>
            )}

            {/* Author Name */}
            <div className="absolute bottom-2.5 inset-x-2 z-10">
              <p className="text-white text-xs font-black drop-shadow-md truncate">
                {story.author}
              </p>
              <p className="text-[10px] text-zinc-300 font-mono font-medium">
                {story.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
