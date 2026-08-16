'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Film, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatBytes, isImageFile, isVideoFile } from '@/lib/utils';
import { uploadVaultFile, VaultFileItem } from '@/lib/supabase';

interface UploadZoneProps {
  vaultKey: string;
  onUploadSuccess: (newFiles: VaultFileItem[]) => void;
}

interface StagedFile {
  file: File;
  id: string;
  previewUrl: string;
  isImage: boolean;
  isVideo: boolean;
  status: 'idle' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ vaultKey, onUploadSuccess }) => {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      stagedFiles.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, [stagedFiles]);

  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: StagedFile[] = [];

    fileArray.forEach((file) => {
      const isImg = isImageFile(file.name, file.type);
      const isVid = isVideoFile(file.name, file.type);

      if (isImg || isVid) {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          previewUrl: URL.createObjectURL(file),
          isImage: isImg,
          isVideo: isVid,
          status: 'idle',
          progress: 0,
        });
      }
    });

    if (validFiles.length > 0) {
      setStagedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearAllStaged = () => {
    stagedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setStagedFiles([]);
  };

  const handleStartUpload = async () => {
    if (stagedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    const uploadedResults: VaultFileItem[] = [];

    for (let i = 0; i < stagedFiles.length; i++) {
      const item = stagedFiles[i];
      if (item.status === 'done') continue;

      setStagedFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading', progress: 30 } : f))
      );

      try {
        const result = await uploadVaultFile(vaultKey, item.file, (p) => {
          setStagedFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, progress: p } : f))
          );
        });

        uploadedResults.push(result);
        setStagedFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'done', progress: 100 } : f))
        );
      } catch (err: any) {
        setStagedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'error', error: err.message || 'Lỗi tải tệp' } : f
          )
        );
      }
    }

    setIsUploading(false);

    if (uploadedResults.length > 0) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFE600', '#FF6B8B', '#22D3EE', '#4ADE80', '#000000'],
        });
      } catch (e) {
        console.error(e);
      }

      onUploadSuccess(uploadedResults);
      setTimeout(() => {
        setStagedFiles((prev) => prev.filter((f) => f.status !== 'done'));
      }, 1200);
    }
  };

  return (
    <div className="w-full neo-box bg-white p-4 mb-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed border-black p-5 text-center cursor-pointer transition-all ${
          isDragging ? 'bg-neo-yellow' : 'bg-neo-bg hover:bg-yellow-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFilesAdded(e.target.files);
          }}
        />

        <div className="flex items-center justify-center gap-2 mb-1">
          <UploadCloud className="w-6 h-6 text-black" />
          <h3 className="text-sm font-black uppercase text-black">
            Kéo thả hoặc bấm để chọn ảnh/video
          </h3>
        </div>
        <p className="text-[11px] text-zinc-500 font-mono">
          Hỗ trợ JPG, PNG, WEBP, MP4, MOV...
        </p>
      </div>

      {/* Staged files preview */}
      {stagedFiles.length > 0 && (
        <div className="mt-4 pt-3 border-t-2 border-black/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-black">
              Đã chọn ({stagedFiles.length}):
            </span>
            <button
              onClick={clearAllStaged}
              disabled={isUploading}
              className="text-[11px] font-bold text-red-600 hover:underline disabled:opacity-50"
            >
              Xoá tất cả
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3 max-h-48 overflow-y-auto p-0.5">
            {stagedFiles.map((item) => (
              <div
                key={item.id}
                className="neo-box bg-white p-2 flex items-center gap-2 shadow-neo-sm"
              >
                <div className="w-9 h-9 shrink-0 border border-black bg-zinc-100 overflow-hidden flex items-center justify-center">
                  {item.isImage ? (
                    <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                  ) : (
                    <Film className="w-4 h-4 text-zinc-700" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate text-black">{item.file.name}</p>
                  <p className="text-[10px] font-mono text-zinc-500">{formatBytes(item.file.size)}</p>
                  {item.status === 'done' && (
                    <span className="text-[10px] font-bold text-green-700 flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" /> Đã tải lên
                    </span>
                  )}
                </div>

                {item.status !== 'uploading' && item.status !== 'done' && (
                  <button onClick={() => removeStagedFile(item.id)} className="p-1 text-zinc-400 hover:text-black">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleStartUpload}
            disabled={isUploading || stagedFiles.every((f) => f.status === 'done')}
            className="neo-btn w-full bg-neo-lime hover:bg-green-400 text-black py-2.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tải lên...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Tải {stagedFiles.length} tệp lên Vault</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
