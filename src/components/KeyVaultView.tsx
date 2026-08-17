'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  KeyRound, 
  ArrowLeft, 
  Check, 
  Share2, 
  RefreshCw 
} from 'lucide-react';
import { listVaultFiles, deleteVaultFile, deleteVaultFiles, VaultFileItem } from '@/lib/supabase';
import { UploadZone } from './UploadZone';
import { MediaGallery } from './MediaGallery';
import { MediaViewerModal } from './MediaViewerModal';

interface KeyVaultViewProps {
  vaultKey: string;
  onExit: () => void;
}

export const KeyVaultView: React.FC<KeyVaultViewProps> = ({
  vaultKey,
  onExit,
}) => {
  const [files, setFiles] = useState<VaultFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<VaultFileItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listVaultFiles(vaultKey);
      setFiles(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách tệp');
    } finally {
      setLoading(false);
    }
  }, [vaultKey]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Real-time auto-purge: Automatically remove & delete files from Supabase Storage the second they expire (> 30 min)
  useEffect(() => {
    if (files.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const expired = files.filter((f) => f.expiresAt <= now);

      if (expired.length > 0) {
        const expiredNames = expired.map((f) => f.name);
        // Immediately remove expired files from UI
        setFiles((prev) => prev.filter((f) => f.expiresAt > now));
        if (selectedFile && expired.some((f) => f.id === selectedFile.id || f.name === selectedFile.name)) {
          setSelectedFile(null);
        }
        // Purge expired files from Supabase Storage
        deleteVaultFiles(vaultKey, expiredNames).catch((err) => {
          console.error('Lỗi khi tự động xoá file hết hạn từ Supabase:', err);
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [files, vaultKey, selectedFile]);

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/?key=${encodeURIComponent(vaultKey)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleUploadSuccess = (newUploaded: VaultFileItem[]) => {
    setFiles((prev) => [...newUploaded, ...prev]);
  };

  const handleDeleteFile = async (file: VaultFileItem) => {
    try {
      setError('');
      await deleteVaultFile(vaultKey, file.name);
      setFiles((prev) => prev.filter((f) => f.id !== file.id && f.name !== file.name));
      if (selectedFile?.id === file.id || selectedFile?.name === file.name) {
        setSelectedFile(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi xoá tệp từ máy chủ');
      throw err;
    }
  };

  const handleDeleteAllFiles = async () => {
    if (files.length === 0) return;
    const confirmDelete = window.confirm(`Bạn có chắc muốn xoá vĩnh viễn tất cả ${files.length} tệp trong khoá này khỏi máy chủ?`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      setError('');
      await deleteVaultFiles(vaultKey, files.map((f) => f.name));
      setFiles([]);
      setSelectedFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi xoá toàn bộ tệp từ máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Top Clean Bar */}
      <div className="neo-box bg-white p-3 sm:p-4 mb-6 flex items-center justify-between gap-3">
        {/* Back and Key Info */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onExit}
            className="neo-btn bg-white hover:bg-zinc-100 p-2 text-black shadow-neo-sm"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 bg-neo-yellow px-2.5 py-1 border-2 border-black shadow-neo-sm">
            <KeyRound className="w-4 h-4 text-black" />
            <span className="font-mono font-black text-sm">{vaultKey}</span>
          </div>
        </div>

        {/* Share Link & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="neo-btn bg-white hover:bg-zinc-100 p-2 text-black shadow-neo-sm"
            title="Tải lại"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCopyShareLink}
            className="neo-btn bg-neo-cyan hover:bg-cyan-300 text-black px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-neo-sm"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Đã Copy Link!' : 'Chia Sẻ Link'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 border-2 border-black bg-neo-pink text-white font-mono text-xs font-bold shadow-neo mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchFiles} className="underline ml-2 text-neo-yellow cursor-pointer">
            Thử lại
          </button>
        </div>
      )}

      {/* Upload Drop Zone */}
      <UploadZone vaultKey={vaultKey} onUploadSuccess={handleUploadSuccess} />

      {/* Media Gallery */}
      <MediaGallery
        vaultKey={vaultKey}
        files={files}
        loading={loading}
        onSelectFile={(f) => setSelectedFile(f)}
        onDeleteFile={handleDeleteFile}
        onDeleteAll={handleDeleteAllFiles}
      />

      {/* Media Lightbox */}
      <MediaViewerModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={handleDeleteFile}
      />
    </div>
  );
};

