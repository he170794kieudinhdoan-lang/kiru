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
import { UploadCloud, Image as ImageIcon, Camera, X, CheckCircle, Film } from 'lucide-react-native';
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
      const rawName = asset.fileName || asset.uri.split('/').pop() || `media_${Date.now()}_${index}.jpg`;
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
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Action Picker Buttons */}
      <View style={styles.pickerRow}>
        <TouchableOpacity
          style={[styles.pickerBtn, styles.galleryBtn]}
          onPress={handlePickFromGallery}
          activeOpacity={0.8}
        >
          <ImageIcon size={18} color="#000000" strokeWidth={2.5} />
          <Text style={styles.pickerBtnText}>Chọn Từ Thư Viện</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pickerBtn, styles.cameraBtn]}
          onPress={handleCaptureCamera}
          activeOpacity={0.8}
        >
          <Camera size={18} color="#000000" strokeWidth={2.5} />
          <Text style={styles.pickerBtnText}>Chụp / Quay</Text>
        </TouchableOpacity>
      </View>

      {/* Staged Items Preview */}
      {stagedFiles.length > 0 && (
        <View style={styles.stagedCard}>
          <View style={styles.stagedHeader}>
            <Text style={styles.stagedTitle}>
              Đã chọn ({stagedFiles.length}):
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
                    <CheckCircle size={20} color="#4ADE80" strokeWidth={3} />
                  </View>
                )}

                {item.status === 'uploading' && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="#FFE600" />
                  </View>
                )}

                {item.status !== 'uploading' && item.status !== 'done' && (
                  <TouchableOpacity
                    style={styles.removeItemBtn}
                    onPress={() => removeStagedItem(item.id)}
                    activeOpacity={0.8}
                  >
                    <X size={12} color="#FFFFFF" strokeWidth={3} />
                  </TouchableOpacity>
                )}

                <View style={styles.stagedInfo}>
                  <Text style={styles.stagedName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.size > 0 && (
                    <Text style={styles.stagedSize}>
                      {formatBytes(item.size)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Start Upload Button */}
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              isUploading && styles.uploadBtnDisabled,
            ]}
            onPress={handleStartUpload}
            disabled={isUploading}
            activeOpacity={0.8}
          >
            {isUploading ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#000000" />
                <Text style={styles.uploadBtnText}>ĐANG TẢI LÊN...</Text>
              </View>
            ) : (
              <View style={styles.btnRow}>
                <UploadCloud size={18} color="#000000" strokeWidth={2.5} />
                <Text style={styles.uploadBtnText}>
                  TẢI {stagedFiles.length} TỆP LÊN VAULT
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
    gap: 10,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: '#000000',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  galleryBtn: {
    backgroundColor: '#FFE600',
  },
  cameraBtn: {
    backgroundColor: '#22D3EE',
  },
  pickerBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
  },
  stagedCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  stagedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stagedTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF6B8B',
    textDecorationLine: 'underline',
  },
  horizontalList: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 8,
  },
  stagedItem: {
    width: 90,
    backgroundColor: '#F4F4F0',
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
  },
  stagedThumb: {
    width: '100%',
    height: 70,
    backgroundColor: '#222222',
  },
  videoPlaceholder: {
    width: '100%',
    height: 70,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeItemBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    backgroundColor: '#FF6B8B',
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stagedInfo: {
    padding: 4,
  },
  stagedName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  stagedSize: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#666666',
  },
  uploadBtn: {
    backgroundColor: '#4ADE80',
    borderWidth: 3,
    borderColor: '#000000',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
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
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
});
