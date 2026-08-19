import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import {
  Download,
  Trash2,
  Play,
  Clock,
  Inbox,
} from 'lucide-react-native';
import { VaultFileItem } from '../lib/supabase';
import { formatBytes, formatRemainingTime } from '../lib/utils';

interface MediaGalleryProps {
  vaultKey: string;
  files: VaultFileItem[];
  loading: boolean;
  onSelectFile: (file: VaultFileItem) => void;
  onDeleteFile: (file: VaultFileItem) => Promise<void> | void;
  onDeleteAll?: () => Promise<void> | void;
}

// Isolated countdown badge: Only updates itself every second without re-rendering parent list
const CountdownBadge = memo(({ expiresAt }: { expiresAt: number }) => {
  const [text, setText] = useState(() => formatRemainingTime(expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setText(formatRemainingTime(expiresAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <View style={styles.countdownBadge}>
      <Clock size={9} color="#F8FAFC" strokeWidth={2} />
      <Text style={styles.countdownText}>{text}</Text>
    </View>
  );
});
CountdownBadge.displayName = 'CountdownBadge';

const MediaCard = memo(
  ({
    file,
    onSelect,
    onDelete,
  }: {
    file: VaultFileItem;
    onSelect: (file: VaultFileItem) => void;
    onDelete: (file: VaultFileItem) => Promise<void> | void;
  }) => {
    const [downloading, setDownloading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDownload = async () => {
      try {
        setDownloading(true);
        const { status } = await MediaLibrary.requestPermissionsAsync();
        const filename = file.originalName || file.name;
        const localUri = `${FileSystem.cacheDirectory}${Date.now()}_${filename}`;

        const { uri } = await FileSystem.downloadAsync(file.url, localUri);

        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert('Thành công', 'Đã lưu tệp vào thư viện ảnh máy!');
        } else {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          } else {
            Alert.alert('Đã tải tệp', 'Tệp đã được lưu thành công.');
          }
        }
      } catch (err: any) {
        console.error(err);
        Alert.alert('Lỗi tải tệp', err.message || 'Không thể tải tệp về máy');
      } finally {
        setDownloading(false);
      }
    };

    const handleDelete = () => {
      Alert.alert(
        'Xác nhận xoá',
        `Bạn có chắc muốn xoá "${file.originalName}"?`,
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Xoá',
            style: 'destructive',
            onPress: async () => {
              try {
                setDeleting(true);
                await onDelete(file);
              } catch (err) {
                console.error(err);
              } finally {
                setDeleting(false);
              }
            },
          },
        ]
      );
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardImageArea}
          onPress={() => onSelect(file)}
          activeOpacity={0.85}
        >
          {file.isImage ? (
            <Image source={{ uri: file.url }} style={styles.thumbnail} />
          ) : (
            <View style={styles.videoThumbnail}>
              <View style={styles.playButton}>
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              </View>
            </View>
          )}

          {/* Countdown Badge */}
          <View style={styles.badgeWrapper}>
            <CountdownBadge expiresAt={file.expiresAt} />
          </View>
        </TouchableOpacity>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <Text style={styles.fileTitle} numberOfLines={1}>
            {file.originalName}
          </Text>
          <Text style={styles.fileSize}>{formatBytes(file.size)}</Text>

          {/* Action Buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.miniBtn, styles.downloadMiniBtn]}
              onPress={handleDownload}
              disabled={downloading}
              activeOpacity={0.75}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#4F46E5" />
              ) : (
                <>
                  <Download size={12} color="#4F46E5" strokeWidth={2.2} />
                  <Text style={styles.downloadMiniText}>Tải về</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.miniBtn, styles.deleteMiniBtn]}
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.75}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Trash2 size={12} color="#EF4444" strokeWidth={2.2} />
                  <Text style={styles.deleteMiniText}>Xoá</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
);
MediaCard.displayName = 'MediaCard';

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  files,
  loading,
  onSelectFile,
  onDeleteFile,
  onDeleteAll,
}) => {
  const handleDeleteAll = () => {
    if (files.length === 0 || !onDeleteAll) return;

    Alert.alert(
      'Xoá tất cả tệp',
      `Bạn có chắc muốn xoá toàn bộ ${files.length} tệp?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá Tất Cả',
          style: 'destructive',
          onPress: async () => {
            await onDeleteAll();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          Tất cả tệp ({files.length})
        </Text>

        {files.length > 0 && onDeleteAll && (
          <TouchableOpacity onPress={handleDeleteAll} style={styles.deleteAllBtn} activeOpacity={0.7}>
            <Trash2 size={13} color="#EF4444" strokeWidth={2} />
            <Text style={styles.deleteAllText}>Xoá tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading state */}
      {loading && files.length === 0 && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Đang tải tệp...</Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && files.length === 0 && (
        <View style={styles.centerBox}>
          <View style={styles.emptyIconBox}>
            <Inbox size={26} color="#94A3B8" strokeWidth={1.8} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có tệp nào</Text>
          <Text style={styles.emptySubtitle}>
            Chọn ảnh hoặc video ở trên để tải lên và lưu trữ tạm thời.
          </Text>
        </View>
      )}

      {/* Grid */}
      <View style={styles.grid}>
        {files.map((file) => (
          <View key={file.id} style={styles.gridColumn}>
            <MediaCard
              file={file}
              onSelect={onSelectFile}
              onDelete={onDeleteFile}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  deleteAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  deleteAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  centerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridColumn: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardImageArea: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeWrapper: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  cardBody: {
    padding: 10,
  },
  fileTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  miniBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  downloadMiniBtn: {
    backgroundColor: '#EEF2FF',
  },
  downloadMiniText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  deleteMiniBtn: {
    backgroundColor: '#FEF2F2',
  },
  deleteMiniText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
});
