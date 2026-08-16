'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { KeyEntryHero } from '@/components/KeyEntryHero';
import { KeyVaultView } from '@/components/KeyVaultView';
import { CreateKeyModal } from '@/components/CreateKeyModal';
import { sanitizeKey } from '@/lib/utils';

function VaultApp() {
  const searchParams = useSearchParams();

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const urlKey = searchParams.get('key');
    if (urlKey) {
      const sanitized = sanitizeKey(urlKey);
      if (sanitized) {
        setActiveKey(sanitized);
      }
    }
  }, [searchParams]);

  const handleSelectKey = (key: string) => {
    const clean = sanitizeKey(key);
    setActiveKey(clean);
    const url = new URL(window.location.href);
    url.searchParams.set('key', clean);
    window.history.pushState({}, '', url.toString());
  };

  const handleExitKey = () => {
    setActiveKey(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('key');
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navbar */}
      <Navbar
        currentKey={activeKey || undefined}
        onOpenCreateKey={() => setShowCreateModal(true)}
        onExitKey={handleExitKey}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col">
        {activeKey ? (
          <KeyVaultView
            vaultKey={activeKey}
            onExit={handleExitKey}
          />
        ) : (
          <KeyEntryHero
            onSelectKey={handleSelectKey}
            onOpenCreateKey={() => setShowCreateModal(true)}
          />
        )}
      </main>

      {/* Modals */}
      <CreateKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onKeyCreated={handleSelectKey}
      />
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
