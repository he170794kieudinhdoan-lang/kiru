'use client';

import React from 'react';
import { KeyRound, LogOut, Sparkles, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { KiruLogo } from './KiruLogo';

interface NavbarProps {
  currentKey?: string;
  onExitKey?: () => void;
  currentView?: 'vault' | 'sweetheart';
  onToggleView?: (view: 'vault' | 'sweetheart') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentKey,
  onExitKey,
  currentView = 'vault',
  onToggleView,
}) => {
  return (
    <header className="w-full bg-neo-yellow border-b-4 border-black px-3 sm:px-4 py-2.5 sm:py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & View Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onToggleView) {
                onToggleView('vault');
              }
              if (onExitKey && currentView === 'vault') {
                onExitKey();
              }
            }}
            className="shrink-0"
          >
            <KiruLogo />
          </a>

          {/* Quick Tab: Vault */}
          <button
            onClick={() => onToggleView && onToggleView('vault')}
            className={`neo-btn px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold transition-all ${
              currentView === 'vault'
                ? 'bg-black text-white shadow-neo-sm'
                : 'bg-white text-black hover:bg-zinc-100 shadow-none border-2'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 mr-1" />
            <span>Key Vault</span>
          </button>
        </div>

        {/* Right: Sweetheart Dedicated Action Button & PIN status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dedicated Bé Iu Button with Custom Icon */}
          <button
            onClick={() => {
              if (onToggleView) {
                onToggleView(currentView === 'sweetheart' ? 'vault' : 'sweetheart');
              }
            }}
            className={`neo-btn px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-black flex items-center gap-2 shadow-neo transition-all ${
              currentView === 'sweetheart'
                ? 'bg-neo-pink text-white ring-2 ring-black scale-105'
                : 'bg-white hover:bg-neo-pink hover:text-white text-black'
            }`}
            title="Mở bộ sưu tập ảnh sáng tạo của bé"
          >
            {/* Custom Icon Image */}
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-black overflow-hidden bg-neo-yellow shrink-0">
              <img
                src="/gallery-icon.png"
                alt="Bé Iu"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-neo-lime border border-black rounded-full" />
            </div>

            <span className="tracking-tight font-kiru">Bé Iu</span>
          </button>

          {/* Current Key Status & Actions (when in Vault view) */}
          {currentView === 'vault' && currentKey && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 sm:py-1.5 border-2 border-black shadow-neo-sm">
                <KeyRound className="w-3.5 h-3.5 text-black" />
                <span className="font-mono font-bold text-xs sm:text-sm tracking-wide">{currentKey}</span>
              </div>

              {onExitKey && (
                <button
                  onClick={onExitKey}
                  className="neo-btn bg-white hover:bg-red-500 hover:text-white text-black p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold flex items-center gap-1 shadow-neo-sm transition-colors"
                  title="Đổi mã PIN khác"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đổi Key</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
