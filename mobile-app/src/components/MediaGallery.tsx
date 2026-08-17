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
  FileQuestion,
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

// Isolated countdown badge: Only updates itself every second without re-rendering parent list!
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
      <Text style={styles.countdownText}>⏱️ {text}</Text>
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
          Alert.alert('Thành công', 'Đã lưu tệp vào thư viện máy!');
        } else {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          } else {
            Alert.alert('Đã tải tệp', 'Tệp đã được lưu.');
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
        `Bạn có chắc muốn xoá vĩnh viễn "${file.originalName}" khỏi máy chủ?`,
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
                <Play size={16} color="#000000" fill="#000000" />
              </View>
            </View>
          )}

          {/* Expiry Badge */}
          <View style={styles.badgeWrapper}>
            <CountdownBadge expiresAt={file.expiresAt} />
          </View>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.cardBody}>
          <Text style={styles.fileTitle} numberOfLines={1}>
            {file.originalName}
          </Text>
          <Text style={styles.fileSize}>{formatBytes(file.size)}</Text>

          {/* Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.miniBtn, styles.downloadMiniBtn]}
              onPress={handleDownload}
              disabled={downloading}
              activeOpacity={0.8}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Download size={12} color="#000000" strokeWidth={2.5} />
                  <Text style={styles.miniBtnText}>Tải Về</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.miniBtn, styles.deleteMiniBtn]}
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Trash2 size={12} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={[styles.miniBtnText, styles.deleteMiniText]}>Xoá</Text>
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
      'Xoá toàn bộ tệp',
      `Bạn có chắc muốn xoá vĩnh viễn tất cả ${files.length} tệp trong khoá này khỏi máy chủ?`,
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
      {/* Header bar */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>DANH SÁCH TỆP ({files.length})</Text>
          {files.length > 0 && onDeleteAll && (
            <TouchableOpacity onPress={handleDeleteAll} style={styles.deleteAllBtn}>
              <Trash2 size={12} color="#FF6B8B" strokeWidth={2.5} />
              <Text style={styles.deleteAllText}>Xoá tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.timeTag}>
          <Clock size={12} color="#444444" strokeWidth={2.5} />
          <Text style={styles.timeTagText}>Tự xoá sau 30 phút</Text>
        </View>
      </View>

      {/* Loading state */}
      {loading && files.length === 0 && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FFE600" />
          <Text style={styles.loadingText}>Đang tải tệp...</Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && files.length === 0 && (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIconBox}>
            <FileQuestion size={28} color="#000000" strokeWidth={2.5} />
          </View>
          <Text style={styles.emptyTitle}>CHƯA CÓ TỆP NÀO</Text>
          <Text style={styles.emptySubtitle}>
            Bấm chọn ảnh hoặc video ở trên để tải lên thư mục này.
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
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#333333',
    letterSpacing: 0.5,
  },
  deleteAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deleteAllText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF6B8B',
    textDecorationLine: 'underline',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F0',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  timeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#444444',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  emptyIconBox: {
    width: 50,
    height: 50,
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    transform: [{ rotate: '3deg' }],
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  gridColumn: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImageArea: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#18181B',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
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
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  badgeWrapper: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  countdownBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 1,
    borderColor: '#FFE600',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  countdownText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFE600',
    fontFamily: 'monospace',
  },
  cardBody: {
    padding: 8,
  },
  fileTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#777777',
    marginBottom: 6,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 4,
  },
  miniBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#000000',
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  downloadMiniBtn: {
    backgroundColor: '#4ADE80',
  },
  deleteMiniBtn: {
    backgroundColor: '#FF6B8B',
  },
  miniBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
  deleteMiniText: {
    color: '#FFFFFF',
  },
});
