'use client';

import React from 'react';
import { KeyRound, LogOut, Sparkles, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { KiruLogo } from './KiruLogo';

interface NavbarProps {
  currentKey?: string;
  onExitKey?: () => void;
  currentView?: 'vault' | 'sweetheart' | 'maihoa';
  onToggleView?: (view: 'vault' | 'sweetheart' | 'maihoa') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentKey,
  onExitKey,
  currentView = 'vault',
  onToggleView,
}) => {
  return (
    <header className="w-full bg-neo-yellow border-b-4 border-black px-3 sm:px-4 py-2.5 sm:py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
        {/* Left: Brand Logo & Main Key Vault Tab */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onToggleView) {
                onToggleView('vault');
              }
            }}
            className="shrink-0"
          >
            <KiruLogo />
          </a>

          {/* Quick Tab: Key Vault */}
          <button
            onClick={() => onToggleView && onToggleView('vault')}
            className={`neo-btn px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all ${
              currentView === 'vault'
                ? 'bg-black text-white shadow-neo scale-105'
                : 'bg-white text-black hover:bg-zinc-100 shadow-none border-2 border-black'
            }`}
            title="Trang chủ Key Vault"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Key Vault</span>
          </button>
        </div>

        {/* Right: Side-by-side Profiles (Mai Hoa & Tthaosbaby_2k5) + Key PIN Status */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
          {/* Profile Mai Hoa (Thu gọn width, nằm cạnh Tthaosbaby_2k5) */}
          <button
            onClick={() => onToggleView && onToggleView('maihoa')}
            className={`neo-btn px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shrink-0 ${
              currentView === 'maihoa'
                ? 'bg-blue-600 text-white shadow-neo scale-105'
                : 'bg-white text-black hover:bg-blue-50 shadow-none border-2 border-black'
            }`}
            title="Trang cá nhân Facebook Mai Hoa 2k8"
          >
            <span className="text-sm">🌸</span>
            <span className="font-kiru">Mai Hoa</span>
          </button>

          {/* Tthaosbaby_2k5 Profile Tab */}
          <button
            onClick={() => onToggleView && onToggleView('sweetheart')}
            className={`neo-btn px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shrink-0 ${
              currentView === 'sweetheart'
                ? 'bg-neo-pink text-white ring-2 ring-black scale-105 shadow-neo'
                : 'bg-white hover:bg-neo-pink hover:text-white text-black shadow-none border-2 border-black'
            }`}
            title="Kho ảnh & video Tthaosbaby_2k5"
          >
            {/* Custom Icon Image */}
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-black overflow-hidden bg-neo-yellow shrink-0">
              <img
                src="/gallery-icon.png"
                alt="Tthaosbaby_2k5"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-neo-lime border border-black rounded-full" />
            </div>

            <span className="tracking-tight font-kiru">Tthaosbaby_2k5</span>
          </button>

          {/* Current Key Status & Actions (when in Vault view) */}
          {currentView === 'vault' && currentKey && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 bg-white px-2 sm:px-2.5 py-1 sm:py-1.5 border-2 border-black shadow-neo-sm">
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
