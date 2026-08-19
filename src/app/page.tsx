'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { KeyEntryHero } from '@/components/KeyEntryHero';
import { KeyVaultView } from '@/components/KeyVaultView';
import { SweetheartGallery } from '@/components/SweetheartGallery';
import { FacebookProfileView } from '@/components/FacebookProfile/FacebookProfileView';
import { sanitizeKey } from '@/lib/utils';

function VaultApp() {
  const searchParams = useSearchParams();

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'maihoa' | 'vault' | 'sweetheart'>('vault');

  useEffect(() => {
    const urlKey = searchParams.get('key');
    if (urlKey) {
      const sanitized = sanitizeKey(urlKey);
      if (sanitized) {
        setActiveKey(sanitized);
        setCurrentView('vault');
      }
    }

    const viewParam = searchParams.get('view');
    if (viewParam === 'gallery' || viewParam === 'sweetheart' || viewParam === 'thao' || viewParam === 'tthaosbaby') {
      setCurrentView('sweetheart');
    } else if (viewParam === 'profile' || viewParam === 'maihoa') {
      setCurrentView('maihoa');
    } else if (viewParam === 'vault') {
      setCurrentView('vault');
    }
  }, [searchParams]);

  const handleSelectKey = (key: string) => {
    const clean = sanitizeKey(key);
    setActiveKey(clean);
    setCurrentView('vault');
    const url = new URL(window.location.href);
    url.searchParams.set('key', clean);
    url.searchParams.delete('view');
    window.history.pushState({}, '', url.toString());
  };

  const handleExitKey = () => {
    setActiveKey(null);
    setCurrentView('vault');
    const url = new URL(window.location.href);
    url.searchParams.delete('key');
    url.searchParams.delete('view');
    window.history.pushState({}, '', url.toString());
  };

  const handleToggleView = (view: 'maihoa' | 'vault' | 'sweetheart') => {
    setCurrentView(view);
    const url = new URL(window.location.href);
    if (view === 'sweetheart') {
      url.searchParams.set('view', 'sweetheart');
    } else if (view === 'maihoa') {
      url.searchParams.set('view', 'maihoa');
    } else {
      url.searchParams.delete('view');
    }
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navbar */}
      <Navbar
        currentKey={activeKey || undefined}
        onExitKey={handleExitKey}
        currentView={currentView}
        onToggleView={handleToggleView}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col">
        {currentView === 'maihoa' ? (
          <FacebookProfileView onBackToHome={() => handleToggleView('vault')} />
        ) : currentView === 'sweetheart' ? (
          <SweetheartGallery onBackToVault={() => handleToggleView('vault')} />
        ) : activeKey ? (
          <KeyVaultView
            vaultKey={activeKey}
            onExit={handleExitKey}
          />
        ) : (
          <KeyEntryHero
            onSelectKey={handleSelectKey}
          />
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono font-bold">Đang tải...</div>}>
      <VaultApp />
    </Suspense>
  );
}
