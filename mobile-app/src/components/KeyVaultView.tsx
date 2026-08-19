import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { AlertCircle } from 'lucide-react-native';
import {
  listVaultFiles,
  deleteVaultFile,
  deleteVaultFiles,
  VaultFileItem,
} from '../lib/supabase';
import { WEB_SHARE_BASE_URL } from '../constants/config';
import { Header } from './Header';
import { UploadSection } from './UploadSection';
import { MediaGallery } from './MediaGallery';
import { MediaModal } from './MediaModal';

interface KeyVaultViewProps {
  vaultKey: string;
}

export const KeyVaultView: React.FC<KeyVaultViewProps> = ({ vaultKey }) => {
  const [files, setFiles] = useState<VaultFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<VaultFileItem | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setError('');
      const data = await listVaultFiles(vaultKey);
      setFiles(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải danh sách tệp');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vaultKey]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFiles();
  };

  // Real-time auto purge: remove & delete files from Supabase Storage the second they expire (> 30 min)
  useEffect(() => {
    if (files.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const expired = files.filter((f) => f.expiresAt <= now);

      if (expired.length > 0) {
        const expiredNames = expired.map((f) => f.name);
        setFiles((prev) => prev.filter((f) => f.expiresAt > now));
        if (
          selectedFile &&
          expired.some((f) => f.id === selectedFile.id || f.name === selectedFile.name)
        ) {
          setSelectedFile(null);
        }
        deleteVaultFiles(vaultKey, expiredNames).catch((err) => {
          console.error('Lỗi khi tự động xoá file hết hạn từ Supabase:', err);
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [files, vaultKey, selectedFile]);

  const handleShareKey = async () => {
    const shareUrl = `${WEB_SHARE_BASE_URL}/?key=${encodeURIComponent(vaultKey)}`;

    try {
      await Clipboard.setStringAsync(shareUrl);
      Alert.alert(
        'Đã sao chép liên kết!',
        'Liên kết chia sẻ Kiru đã được sao chép vào bộ nhớ đệm.'
      );
    } catch (e) {
      console.error(e);
    }
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
      setError(err.message || 'Lỗi khi xoá tệp');
      throw err;
    }
  };

  const handleDeleteAllFiles = async () => {
    if (files.length === 0) return;

    try {
      setLoading(true);
      setError('');
      await deleteVaultFiles(vaultKey, files.map((f) => f.name));
      setFiles([]);
      setSelectedFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi xoá toàn bộ tệp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Clean Header */}
      <Header
        onRefresh={onRefresh}
        onShareKey={handleShareKey}
        isRefreshing={refreshing}
      />

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Error Banner */}
        {Boolean(error) && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#EF4444" strokeWidth={2} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchFiles}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upload Zone */}
        <UploadSection
          vaultKey={vaultKey}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* Media Gallery */}
        <MediaGallery
          vaultKey={vaultKey}
          files={files}
          loading={loading}
          onSelectFile={(f) => setSelectedFile(f)}
          onDeleteFile={handleDeleteFile}
          onDeleteAll={handleDeleteAllFiles}
        />
      </ScrollView>

      {/* Lightbox Modal */}
      <MediaModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={handleDeleteFile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    color: '#991B1B',
    fontWeight: '600',
    fontSize: 12,
  },
  retryText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 12,
  },
});
