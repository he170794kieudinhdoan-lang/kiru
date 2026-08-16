'use client';

import React, { useState, useEffect } from 'react';
import { X, Dices, FolderPlus, ArrowRight, Loader2 } from 'lucide-react';
import { sanitizeKey, isValidKey, generateRandomKey } from '@/lib/utils';
import { createVault, checkVaultExists, generateUniqueRandomKey } from '@/lib/supabase';

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyCreated: (key: string) => void;
}

export const CreateKeyModal: React.FC<CreateKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyCreated,
}) => {
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const unique = await generateUniqueRandomKey();
      setNewKey(unique);
    } catch {
      setNewKey(generateRandomKey());
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = sanitizeKey(newKey);
    if (!isValidKey(clean)) {
      setError('Vui lòng nhập đúng 4 chữ số!');
      return;
    }

    try {
      setLoading(true);
      const { exists } = await checkVaultExists(clean);
      if (!exists) {
        await createVault(clean);
      }
      onKeyCreated(clean);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo mã Key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="neo-box-lg max-w-sm w-full bg-[#FFFDF9] p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-neo-cyan border-2 border-black shadow-neo-sm">
              <FolderPlus className="w-4 h-4 text-black" />
            </div>
            <h2 className="text-base font-black uppercase tracking-tight">Tạo Key Mới</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black bg-white hover:bg-neo-pink hover:text-white shadow-neo-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={newKey}
              onChange={(e) => {
                setNewKey(sanitizeKey(e.target.value));
                setError('');
              }}
              placeholder="••••"
              className="neo-input text-3xl font-mono tracking-[0.3em] font-black text-center py-2.5 px-3 flex-1"
              autoFocus
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="neo-btn bg-neo-yellow hover:bg-yellow-300 text-black px-3.5 text-xs font-black shrink-0 flex items-center gap-1"
              title="Tạo 4 số ngẫu nhiên"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dices className="w-4 h-4" />}
              <span>Random</span>
            </button>
          </div>

          {error && (
            <div className="p-2 border-2 border-black bg-neo-pink text-white font-mono text-xs font-bold shadow-neo-sm">
              {error}
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading || generating}
              className="neo-btn w-full bg-neo-lime hover:bg-green-400 text-black py-3 text-sm font-black flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Đang khởi tạo...</span>
              ) : (
                <>
                  <span>Tạo & Mở ({newKey || '....'})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
