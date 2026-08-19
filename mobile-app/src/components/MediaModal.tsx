import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
        Alert.alert('Thành công', 'Đã lưu tệp vào thư viện ảnh trên thiết bị!');
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Đã tải xong', `Tệp đã lưu tại: ${uri}`);
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
        Alert.alert('Đã sao chép link', 'Bạn có thể gửi link cho bạn bè.');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;

    Alert.alert(
      'Xoá tệp',
      `Bạn có chắc muốn xoá "${file.originalName}" khỏi máy chủ?`,
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
                  <Film size={15} color="#0EA5E9" strokeWidth={2.2} />
                ) : (
                  <ImageIcon size={15} color="#4F46E5" strokeWidth={2.2} />
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

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={16} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Media Preview Area */}
          <View style={styles.previewArea}>
            {file.isImage ? (
              <Image
                source={{ uri: file.url }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.videoNotice}>
                <Film size={44} color="#38BDF8" strokeWidth={1.8} />
                <Text style={styles.videoNoticeText}>Video tệp đính kèm</Text>
                <Text style={styles.videoNoticeSub}>
                  Bấm "Tải về" để xem video trực tiếp trên thiết bị của bạn.
                </Text>
              </View>
            )}
          </View>

          {/* Action Bar */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.copyBtn]}
              onPress={handleCopyLink}
              activeOpacity={0.7}
            >
              {copied ? (
                <Check size={16} color="#10B981" strokeWidth={2.2} />
              ) : (
                <Copy size={16} color="#0F172A" strokeWidth={2.2} />
              )}
              <Text style={styles.actionBtnText}>{copied ? 'Đã copy' : 'Copy link'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.downloadBtn]}
              onPress={handleSaveToDevice}
              disabled={downloading}
              activeOpacity={0.7}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#4F46E5" />
              ) : (
                <Download size={16} color="#4F46E5" strokeWidth={2.2} />
              )}
              <Text style={[styles.actionBtnText, styles.downloadText]}>
                {downloading ? 'Đang tải...' : 'Tải về máy'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={handleNativeShare}
              activeOpacity={0.7}
            >
              <Share2 size={16} color="#0F172A" strokeWidth={2.2} />
              <Text style={styles.actionBtnText}>Chia sẻ</Text>
            </TouchableOpacity>

            {onDelete && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={handleDelete}
                disabled={deleting}
                activeOpacity={0.7}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Trash2 size={16} color="#EF4444" strokeWidth={2.2} />
                )}
                <Text style={[styles.actionBtnText, styles.deleteText]}>
                  {deleting ? '...' : 'Xoá'}
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    gap: 10,
  },
  typeBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  fileMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewArea: {
    height: SCREEN_HEIGHT * 0.46,
    backgroundColor: '#090D16',
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
    padding: 24,
  },
  videoNoticeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  videoNoticeSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  actionsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
    backgroundColor: '#F8FAFC',
  },
  copyBtn: {
    backgroundColor: '#F1F5F9',
  },
  downloadBtn: {
    backgroundColor: '#EEF2FF',
  },
  shareBtn: {
    backgroundColor: '#F1F5F9',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    flex: 0.8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  downloadText: {
    color: '#4F46E5',
  },
  deleteText: {
    color: '#EF4444',
  },
});
