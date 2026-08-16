'use client';

import React from 'react';
import { Zap } from 'lucide-react';

export const KiruLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2.5 group select-none cursor-pointer">
      {/* Brutalist Lightning Badge */}
      <div className="relative">
        <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-none" />
        <div className="relative bg-neo-yellow border-3 border-black p-2 flex items-center justify-center -rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-200">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-black fill-black stroke-black stroke-[1.5]" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-neo-cyan border border-black rotate-12" />
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex items-center">
        <span className="font-kiru text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center leading-none">
          KIRU
          <span className="inline-block w-2.5 h-2.5 bg-neo-pink border-2 border-black rounded-full ml-1 animate-pulse" />
        </span>
      </div>
    </div>
  );
};
