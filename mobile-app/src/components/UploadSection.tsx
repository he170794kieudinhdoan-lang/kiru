import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { UploadCloud, Image as ImageIcon, Camera, X, CheckCircle2, Film } from 'lucide-react-native';
import { formatBytes, isImageFile, isVideoFile } from '../lib/utils';
import { uploadVaultFile, VaultFileItem, UploadInputItem } from '../lib/supabase';

interface UploadSectionProps {
  vaultKey: string;
  onUploadSuccess: (newFiles: VaultFileItem[]) => void;
}

interface StagedItem {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  size: number;
  isImage: boolean;
  isVideo: boolean;
  status: 'idle' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ vaultKey, onUploadSuccess }) => {
  const [stagedFiles, setStagedFiles] = useState<StagedItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tiếp tục.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        addAssetsToStaged(result.assets);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Lỗi chọn tệp', err.message || 'Không thể chọn tệp');
    }
  };

  const handleCaptureCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền camera', 'Vui lòng cấp quyền sử dụng camera để chụp ảnh/quay video.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        addAssetsToStaged(result.assets);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Lỗi camera', err.message || 'Không thể mở camera');
    }
  };

  const addAssetsToStaged = (assets: ImagePicker.ImagePickerAsset[]) => {
    const newItems: StagedItem[] = assets.map((asset, index) => {
      const rawName =
        asset.fileName || asset.uri.split('/').pop() || `media_${Date.now()}_${index}.jpg`;
      const isVid = asset.type === 'video' || isVideoFile(rawName);
      const isImg = asset.type === 'image' || isImageFile(rawName);
      const ext = rawName.split('.').pop()?.toLowerCase() || (isVid ? 'mp4' : 'jpg');
      const mimeType = asset.mimeType || (isVid ? `video/${ext}` : `image/${ext}`);

      return {
        id: `${asset.uri}_${Date.now()}_${index}`,
        uri: asset.uri,
        name: rawName,
        mimeType,
        size: asset.fileSize || 0,
        isImage: isImg,
        isVideo: isVid,
        status: 'idle',
        progress: 0,
      };
    });

    setStagedFiles((prev) => [...prev, ...newItems]);
  };

  const removeStagedItem = (id: string) => {
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllStaged = () => {
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
        const inputItem: UploadInputItem = {
          uri: item.uri,
          name: item.name,
          mimeType: item.mimeType,
          size: item.size,
        };

        const result = await uploadVaultFile(vaultKey, inputItem, (p) => {
          setStagedFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, progress: p } : f))
          );
        });

        uploadedResults.push(result);
        setStagedFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'done', progress: 100 } : f))
        );
      } catch (err: any) {
        console.error('Upload item error:', err);
        setStagedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'error', error: err.message || 'Lỗi tải lên' } : f
          )
        );
      }
    }

    setIsUploading(false);

    if (uploadedResults.length > 0) {
      onUploadSuccess(uploadedResults);
      setTimeout(() => {
        setStagedFiles((prev) => prev.filter((f) => f.status !== 'done'));
      }, 800);
    }
  };

  return (
    <View style={styles.container}>
      {/* 2 Main Action Pickers */}
      <View style={styles.pickerRow}>
        <TouchableOpacity
          style={[styles.pickerBtn, styles.galleryBtn]}
          onPress={handlePickFromGallery}
          activeOpacity={0.7}
        >
          <View style={styles.galleryIconBox}>
            <ImageIcon size={20} color="#4F46E5" strokeWidth={2.2} />
          </View>
          <View style={styles.pickerBtnTextWrapper}>
            <Text style={styles.pickerBtnTitle}>Thư viện</Text>
            <Text style={styles.pickerBtnSub}>Chọn ảnh hoặc video</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pickerBtn, styles.cameraBtn]}
          onPress={handleCaptureCamera}
          activeOpacity={0.7}
        >
          <View style={styles.cameraIconBox}>
            <Camera size={20} color="#0EA5E9" strokeWidth={2.2} />
          </View>
          <View style={styles.pickerBtnTextWrapper}>
            <Text style={styles.pickerBtnTitle}>Máy ảnh</Text>
            <Text style={styles.pickerBtnSub}>Chụp / Quay mới</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Selected Items Staging Card */}
      {stagedFiles.length > 0 && (
        <View style={styles.stagedCard}>
          <View style={styles.stagedHeader}>
            <Text style={styles.stagedTitle}>
              Đã chọn ({stagedFiles.length})
            </Text>
            <TouchableOpacity onPress={clearAllStaged} disabled={isUploading}>
              <Text style={styles.clearAllText}>Xoá tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {stagedFiles.map((item) => (
              <View key={item.id} style={styles.stagedItem}>
                {item.isImage ? (
                  <Image source={{ uri: item.uri }} style={styles.stagedThumb} />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Film size={20} color="#FFFFFF" strokeWidth={2} />
                  </View>
                )}

                {item.status === 'done' && (
                  <View style={styles.doneOverlay}>
                    <CheckCircle2 size={22} color="#10B981" strokeWidth={2.5} />
                  </View>
                )}

                {item.status === 'uploading' && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                )}

                {item.status !== 'uploading' && item.status !== 'done' && (
                  <TouchableOpacity
                    style={styles.removeItemBtn}
                    onPress={() => removeStagedItem(item.id)}
                    activeOpacity={0.8}
                  >
                    <X size={12} color="#FFFFFF" strokeWidth={2.5} />
                  </TouchableOpacity>
                )}

                <View style={styles.stagedInfo}>
                  <Text style={styles.stagedName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.size > 0 && (
                    <Text style={styles.stagedSize}>{formatBytes(item.size)}</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadBtn, isUploading && styles.uploadBtnDisabled]}
            onPress={handleStartUpload}
            disabled={isUploading}
            activeOpacity={0.85}
          >
            {isUploading ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.uploadBtnText}>Đang tải lên...</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <UploadCloud size={18} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.uploadBtnText}>
                  Tải lên {stagedFiles.length} tệp
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  galleryBtn: {
    backgroundColor: '#FFFFFF',
  },
  cameraBtn: {
    backgroundColor: '#FFFFFF',
  },
  galleryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerBtnTextWrapper: {
    flex: 1,
  },
  pickerBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  pickerBtnSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  stagedCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stagedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stagedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  horizontalList: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 6,
  },
  stagedItem: {
    width: 88,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  stagedThumb: {
    width: '100%',
    height: 72,
    backgroundColor: '#E2E8F0',
  },
  videoPlaceholder: {
    width: '100%',
    height: 72,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeItemBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stagedInfo: {
    padding: 6,
  },
  stagedName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  stagedSize: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  uploadBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  uploadBtnDisabled: {
    opacity: 0.7,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
