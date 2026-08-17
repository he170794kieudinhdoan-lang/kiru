import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Trash2,
  Calendar,
  HardDrive,
  Film,
  Image as ImageIcon,
} from 'lucide-react-native';
import { VaultFileItem } from '../lib/supabase';
import { formatBytes, formatDate } from '../lib/utils';

interface MediaModalProps {
  file: VaultFileItem | null;
  onClose: () => void;
  onDelete?: (file: VaultFileItem) => Promise<void> | void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MediaModal: React.FC<MediaModalProps> = ({ file, onClose, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!file) return null;

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(file.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveToDevice = async () => {
    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();

      const filename = file.originalName || file.name;
      const localUri = `${FileSystem.cacheDirectory}${Date.now()}_${filename}`;

      const { uri } = await FileSystem.downloadAsync(file.url, localUri);

      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Thành công', 'Đã lưu tệp vào thư viện ảnh trên điện thoại!');
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Đã tải xong', `Tệp đã lưu tạm tại: ${uri}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Lỗi tải tệp', err.message || 'Không thể lưu tệp về máy');
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        const filename = file.originalName || file.name;
        const localUri = `${FileSystem.cacheDirectory}${filename}`;
        const { uri } = await FileSystem.downloadAsync(file.url, localUri);
        await Sharing.shareAsync(uri);
      } else {
        handleCopyLink();
        Alert.alert('Đã sao chép link', 'Bạn có thể dán link để gửi cho bạn bè.');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;

    Alert.alert(
      'Xoá vĩnh viễn',
      `Bạn có chắc muốn xoá tệp "${file.originalName}" khỏi máy chủ?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá Ngay',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await onDelete(file);
              onClose();
            } catch (err: any) {
              Alert.alert('Lỗi xoá tệp', err.message || 'Không thể xoá tệp');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={Boolean(file)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.typeBadge}>
                {file.isVideo ? (
                  <Film size={14} color="#000000" strokeWidth={2.5} />
                ) : (
                  <ImageIcon size={14} color="#000000" strokeWidth={2.5} />
                )}
              </View>
              <View style={styles.nameContainer}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.originalName}
                </Text>
                <Text style={styles.fileMeta}>
                  {formatBytes(file.size)} • {formatDate(file.createdAt)}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={18} color="#000000" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Media Preview Body */}
          <View style={styles.previewArea}>
            {file.isImage ? (
              <Image
                source={{ uri: file.url }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.videoNotice}>
                <Film size={48} color="#FFE600" strokeWidth={2} />
                <Text style={styles.videoNoticeText}>Video tệp đính kèm</Text>
                <Text style={styles.videoNoticeSub}>
                  Bấm "Tải Về" để xem video trực tiếp trên điện thoại.
                </Text>
              </View>
            )}
          </View>

          {/* Action Bar */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.copyBtn]}
              onPress={handleCopyLink}
              activeOpacity={0.8}
            >
              {copied ? (
                <Check size={16} color="#000000" strokeWidth={2.5} />
              ) : (
                <Copy size={16} color="#000000" strokeWidth={2.5} />
              )}
              <Text style={styles.actionBtnText}>{copied ? 'ĐÃ COPY' : 'COPY LINK'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.downloadBtn]}
              onPress={handleSaveToDevice}
              disabled={downloading}
              activeOpacity={0.8}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Download size={16} color="#000000" strokeWidth={2.5} />
              )}
              <Text style={styles.actionBtnText}>
                {downloading ? 'ĐANG TẢI...' : 'TẢI VỀ MÁY'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={handleNativeShare}
              activeOpacity={0.8}
            >
              <Share2 size={16} color="#000000" strokeWidth={2.5} />
              <Text style={styles.actionBtnText}>CHIA SẺ</Text>
            </TouchableOpacity>

            {onDelete && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={handleDelete}
                disabled={deleting}
                activeOpacity={0.8}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Trash2 size={16} color="#FFFFFF" strokeWidth={2.5} />
                )}
                <Text style={[styles.actionBtnText, styles.deleteText]}>
                  {deleting ? '...' : 'XOÁ'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  modalContent: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.88,
    backgroundColor: '#18181B',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  typeBadge: {
    width: 28,
    height: 28,
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
  },
  fileMeta: {
    fontSize: 10,
    color: '#666666',
    fontFamily: 'monospace',
  },
  closeBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#FF6B8B',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewArea: {
    height: SCREEN_HEIGHT * 0.48,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  videoNotice: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  videoNoticeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 12,
  },
  videoNoticeSub: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: '#000000',
    padding: 10,
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#000000',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  copyBtn: {
    backgroundColor: '#FFFFFF',
  },
  downloadBtn: {
    backgroundColor: '#4ADE80',
  },
  shareBtn: {
    backgroundColor: '#22D3EE',
  },
  deleteBtn: {
    backgroundColor: '#FF6B8B',
    flex: 0.8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  deleteText: {
    color: '#FFFFFF',
  },
});
