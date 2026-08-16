'use client';

import React from 'react';
import { KeyRound, PlusCircle } from 'lucide-react';
import { KiruLogo } from './KiruLogo';

interface NavbarProps {
  currentKey?: string;
  onOpenCreateKey: () => void;
  onExitKey?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentKey,
  onOpenCreateKey,
  onExitKey,
}) => {
  return (
    <header className="w-full bg-neo-yellow border-b-4 border-black px-4 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              if (onExitKey) {
                e.preventDefault();
                onExitKey();
              }
            }}
          >
            <KiruLogo />
          </a>

          {currentKey && (
            <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1 border-2 border-black shadow-neo-sm">
              <KeyRound className="w-4 h-4 text-black" />
              <span className="font-mono font-bold text-sm tracking-wide">PIN: {currentKey}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Key Button */}
          <button
            onClick={onOpenCreateKey}
            className="neo-btn bg-white hover:bg-neo-cyan text-black px-3.5 py-2 text-xs md:text-sm font-black flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-black" />
            <span>Tạo Key Mới</span>
          </button>
        </div>
      </div>
    </header>
  );
};
