'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, PlusCircle, FolderOpen, History, Trash2, AlertCircle, Dices, Loader2 } from 'lucide-react';
import { checkVaultExists, generateUniqueRandomKey } from '@/lib/supabase';
import { sanitizeKey, isValidKey, generateRandomKey } from '@/lib/utils';

interface KeyEntryHeroProps {
  onSelectKey: (key: string) => void;
  onOpenCreateKey: () => void;
}

const LS_RECENT_KEYS = 'supavault_recent_keys';

export const KeyEntryHero: React.FC<KeyEntryHeroProps> = ({
  onSelectKey,
  onOpenCreateKey,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [recentKeys, setRecentKeys] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_RECENT_KEYS);
      if (saved) {
        setRecentKeys(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveRecentKey = (k: string) => {
    try {
      const updated = [k, ...recentKeys.filter((item) => item !== k)].slice(0, 5);
      setRecentKeys(updated);
      localStorage.setItem(LS_RECENT_KEYS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const removeRecentKey = (k: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentKeys.filter((item) => item !== k);
    setRecentKeys(updated);
    localStorage.setItem(LS_RECENT_KEYS, JSON.stringify(updated));
  };

  const handleRandomize = async () => {
    setGenerating(true);
    setError('');
    try {
      const unique = await generateUniqueRandomKey();
      setInputKey(unique);
    } catch {
      setInputKey(generateRandomKey());
    } finally {
      setGenerating(false);
    }
  };

  const handleAccessKey = async (e?: React.FormEvent, directKey?: string) => {
    if (e) e.preventDefault();
    setError('');

    const targetKey = sanitizeKey(directKey || inputKey);
    if (!isValidKey(targetKey)) {
      setError('Vui lòng nhập đúng 4 chữ số!');
      return;
    }

    try {
      setLoading(true);
      await checkVaultExists(targetKey);
      saveRecentKey(targetKey);
      onSelectKey(targetKey);
    } catch (err: any) {
      saveRecentKey(targetKey);
      onSelectKey(targetKey);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-12 sm:py-20 flex-1 flex flex-col justify-center">
      {/* Clean Box */}
      <div className="neo-box-lg bg-white p-6 sm:p-8">
        {/* Title + Circular ! Info Button */}
        <div className="flex items-center justify-center gap-2 mb-6 relative">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black flex items-center">
            Nhập <span className="bg-neo-yellow px-2 border-2 border-black inline-block -rotate-1 shadow-neo-sm mx-1.5">Key</span> Để Mở
          </h1>

          {/* Circular ! Guide Button */}
          <div 
            className="relative group/guide cursor-pointer"
            onMouseEnter={() => setShowGuide(true)}
            onMouseLeave={() => setShowGuide(false)}
            onClick={() => setShowGuide(!showGuide)}
          >
            <div className="w-7 h-7 rounded-full bg-white hover:bg-neo-cyan border-2 border-black flex items-center justify-center font-black text-sm text-black shadow-neo-sm transition-all duration-150 group-hover/guide:scale-110 group-hover/guide:rotate-6">
              !
            </div>

            {/* Floating Step Guide Card */}
            <div className={`absolute top-full mt-2.5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-72 sm:w-80 bg-[#FFFDF9] border-3 border-black p-4 shadow-neo-lg z-50 transition-all duration-150 text-left ${
              showGuide ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95 pointer-events-none'
            }`}>
              <div className="flex items-center gap-1.5 border-b-2 border-black pb-2 mb-2.5">
                <span className="p-1 bg-neo-yellow border border-black font-black text-xs">📖</span>
                <h4 className="text-xs font-black uppercase tracking-tight text-black">Hướng Dẫn Sử Dụng</h4>
              </div>

              <div className="space-y-2.5 text-xs font-medium text-black">
                <div className="flex items-start gap-2">
                  <span className="font-mono font-black text-[11px] bg-black text-white px-1.5 py-0.5 shrink-0">B1</span>
                  <span>Nhập <strong>mã 4 số</strong> hoặc bấm <strong>Random</strong> để mở thư mục.</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-mono font-black text-[11px] bg-black text-white px-1.5 py-0.5 shrink-0">B2</span>
                  <span>Kéo thả <strong>ảnh & video</strong> để tải lên lưu trữ.</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-mono font-black text-[11px] bg-black text-white px-1.5 py-0.5 shrink-0">B3</span>
                  <span>Bấm <strong>Chia sẻ link</strong> gửi cho bạn bè để xem & tải về.</span>
                </div>

                <div className="mt-2 pt-2 border-t border-black/15 text-[11px] text-zinc-600 font-mono flex items-center gap-1 font-bold">
                  <span>⏱️ Tệp sẽ tự động xoá vĩnh viễn sau 30 phút.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleAccessKey(e)} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={inputKey}
              onChange={(e) => {
                setInputKey(sanitizeKey(e.target.value));
                setError('');
              }}
              placeholder="••••"
              className="neo-input text-3xl font-mono tracking-[0.4em] text-center py-3 font-black placeholder:text-zinc-300 flex-1"
              autoFocus
            />
            <button
              type="button"
              onClick={handleRandomize}
              disabled={generating}
              className="neo-btn bg-neo-yellow hover:bg-yellow-300 text-black px-3.5 text-xs font-black shrink-0 flex items-center gap-1"
              title="Tạo ngẫu nhiên 4 số"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dices className="w-4 h-4" />}
              <span>Random</span>
            </button>
          </div>

          {error && (
            <div className="p-2.5 border-2 border-black bg-neo-pink text-white font-mono text-xs font-bold shadow-neo-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 2 Main Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="neo-btn bg-neo-lime hover:bg-green-400 text-black py-3 text-sm font-black flex items-center justify-center gap-1.5"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Mở</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onOpenCreateKey}
              className="neo-btn bg-neo-cyan hover:bg-cyan-300 text-black py-3 text-sm font-black flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Key Mới</span>
            </button>
          </div>
        </form>

        {/* Recent Keys (Minimal) */}
        {recentKeys.length > 0 && (
          <div className="mt-6 pt-4 border-t-2 border-black/10">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase text-zinc-500 mb-2">
              <History className="w-3 h-3" />
              <span>Key gần đây:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentKeys.map((key) => (
                <div
                  key={key}
                  onClick={() => handleAccessKey(undefined, key)}
                  className="neo-box cursor-pointer bg-zinc-50 hover:bg-neo-yellow px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono font-bold transition-colors shadow-neo-sm"
                >
                  <span>#{key}</span>
                  <button
                    type="button"
                    onClick={(e) => removeRecentKey(key, e)}
                    className="text-zinc-400 hover:text-red-600"
                    title="Xoá"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
