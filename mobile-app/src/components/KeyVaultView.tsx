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
import { KeyRound, ArrowLeft, Share2, RefreshCw, AlertCircle } from 'lucide-react-native';
import {
  listVaultFiles,
  deleteVaultFile,
  deleteVaultFiles,
  VaultFileItem,
} from '../lib/supabase';
import { WEB_SHARE_BASE_URL } from '../constants/config';
import { UploadSection } from './UploadSection';
import { MediaGallery } from './MediaGallery';
import { MediaModal } from './MediaModal';

interface KeyVaultViewProps {
  vaultKey: string;
  onExit: () => void;
}

export const KeyVaultView: React.FC<KeyVaultViewProps> = ({ vaultKey, onExit }) => {
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

  // Real-time auto purge: Automatically remove & delete files from Supabase Storage the second they expire (> 30 min)
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
    const shareText = `Mở Kiru Vault với mã key #${vaultKey} hoặc truy cập: ${WEB_SHARE_BASE_URL}/?key=${encodeURIComponent(
      vaultKey
    )}`;

    try {
      await Clipboard.setStringAsync(`${WEB_SHARE_BASE_URL}/?key=${encodeURIComponent(vaultKey)}`);
      Alert.alert(
        'Đã sao chép link!',
        `Link chia sẻ cho Key #${vaultKey} đã được sao chép vào bộ nhớ đệm.`
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFE600']}
            tintColor="#FFE600"
          />
        }
      >
        {/* Top Vault Bar */}
        <View style={styles.vaultTopBar}>
          <View style={styles.keyInfo}>
            <View style={styles.keyIconBox}>
              <KeyRound size={16} color="#000000" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.keyLabel}>KHO LƯU TRỮ</Text>
              <Text style={styles.keyValue}>KEY #{vaultKey}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareKey}
            activeOpacity={0.8}
          >
            <Share2 size={14} color="#000000" strokeWidth={2.5} />
            <Text style={styles.shareBtnText}>Chia Sẻ Link</Text>
          </TouchableOpacity>
        </View>

        {/* Error Box */}
        {Boolean(error) && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#FFFFFF" strokeWidth={2.5} />
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
    backgroundColor: '#FFFDF9',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  vaultTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  keyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyIconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#666666',
  },
  keyValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    fontFamily: 'monospace',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22D3EE',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B8B',
    borderWidth: 2,
    borderColor: '#000000',
    padding: 10,
    gap: 8,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  retryText: {
    color: '#FFE600',
    fontWeight: '900',
    textDecorationLine: 'underline',
    fontSize: 12,
  },
});
