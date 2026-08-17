import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_BUCKET, FILE_TTL_MS } from '../constants/config';
import { isImageFile, isVideoFile } from './utils';

export interface VaultFileItem {
  id: string;
  name: string;
  originalName: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: number;
  url: string;
  mimeType: string;
  isVideo: boolean;
  isImage: boolean;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });

  return cachedClient;
}

/**
 * List all active media files in a key vault and automatically purge expired files (> 30 minutes)
 */
export async function listVaultFiles(vaultKey: string): Promise<VaultFileItem[]> {
  const supabase = getSupabase();
  const cleanKey = vaultKey.trim();

  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).list(cleanKey, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    throw new Error(error.message || 'Lỗi khi tải danh sách tệp từ máy chủ');
  }

  if (!data) return [];

  const now = Date.now();
  const activeFiles: VaultFileItem[] = [];
  const expiredPathsToPurge: string[] = [];

  for (const item of data) {
    if (item.name === '.vault' || item.name === '.emptyFolderPlaceholder') {
      continue;
    }

    const match = item.name.match(/^(\d+)_(.+)$/);
    const timestamp = match ? parseInt(match[1]) : new Date(item.created_at || now).getTime();
    const age = now - timestamp;

    // Check if older than 30 minutes
    if (age > FILE_TTL_MS) {
      expiredPathsToPurge.push(`${cleanKey}/${item.name}`);
      continue;
    }

    const path = `${cleanKey}/${item.name}`;
    const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);

    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = item.metadata?.mimetype || (isVideoFile(item.name) ? `video/${ext}` : `image/${ext}`);
    const isVideo = mimeType.startsWith('video/') || isVideoFile(item.name);
    const isImage = mimeType.startsWith('image/') || isImageFile(item.name);

    let originalName = item.name;
    if (match && match[2]) {
      originalName = match[2];
    }

    activeFiles.push({
      id: item.id || `${cleanKey}_${item.name}`,
      name: item.name,
      originalName,
      size: item.metadata?.size || 0,
      createdAt: item.created_at || new Date(timestamp).toISOString(),
      updatedAt: item.updated_at || new Date(timestamp).toISOString(),
      expiresAt: timestamp + FILE_TTL_MS,
      url: urlData.publicUrl,
      mimeType,
      isVideo,
      isImage,
    });
  }

  // Auto purge expired files in background from Supabase Storage
  if (expiredPathsToPurge.length > 0) {
    supabase.storage.from(SUPABASE_BUCKET).remove(expiredPathsToPurge).then(({ error: purgeErr }) => {
      if (purgeErr) console.warn('Lỗi khi tự động xoá file hết hạn:', purgeErr);
      else console.log(`Đã tự động xoá ${expiredPathsToPurge.length} file hết hạn khỏi Supabase.`);
    });
  }

  return activeFiles;
}

export interface UploadInputItem {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

/**
 * Upload a media file from mobile local URI to Supabase Storage with timestamp prefix
 */
export async function uploadVaultFile(
  vaultKey: string,
  fileItem: UploadInputItem,
  onProgress?: (progress: number) => void
): Promise<VaultFileItem> {
  const supabase = getSupabase();
  const cleanKey = vaultKey.trim();
  const now = Date.now();

  const cleanFileName = fileItem.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueName = `${now}_${cleanFileName}`;
  const filePath = `${cleanKey}/${uniqueName}`;

  if (onProgress) onProgress(20);

  // Read file as Base64 in Expo
  const base64Data = await FileSystem.readAsStringAsync(fileItem.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (onProgress) onProgress(50);

  const arrayBuffer = decode(base64Data);
  const ext = fileItem.name.split('.').pop()?.toLowerCase() || '';
  const detectedMime = fileItem.mimeType || (isVideoFile(fileItem.name) ? `video/${ext}` : `image/${ext || 'jpeg'}`);

  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).upload(filePath, arrayBuffer, {
    contentType: detectedMime,
    cacheControl: '1800',
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || 'Lỗi khi tải tệp lên máy chủ');
  }

  if (onProgress) onProgress(90);

  const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);

  if (onProgress) onProgress(100);

  const isVideo = detectedMime.startsWith('video/') || isVideoFile(fileItem.name);
  const isImage = detectedMime.startsWith('image/') || isImageFile(fileItem.name);

  return {
    id: data.id || `${cleanKey}_${uniqueName}`,
    name: uniqueName,
    originalName: fileItem.name,
    size: fileItem.size || arrayBuffer.byteLength,
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    expiresAt: now + FILE_TTL_MS,
    url: urlData.publicUrl,
    mimeType: detectedMime,
    isVideo,
    isImage,
  };
}

/**
 * Delete a media file from vault and Supabase Storage
 */
export async function deleteVaultFile(vaultKey: string, fileName: string): Promise<boolean> {
  const supabase = getSupabase();
  const cleanKey = vaultKey.trim();
  const filePath = `${cleanKey}/${fileName}`;

  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([filePath]);

  if (error) {
    console.error('Lỗi khi xoá tệp từ Supabase Storage:', error);
    throw new Error(error.message || 'Lỗi khi xoá tệp khỏi máy chủ');
  }

  return true;
}

/**
 * Delete multiple media files from vault and Supabase Storage
 */
export async function deleteVaultFiles(vaultKey: string, fileNames: string[]): Promise<boolean> {
  if (!fileNames || fileNames.length === 0) return true;

  const supabase = getSupabase();
  const cleanKey = vaultKey.trim();
  const filePaths = fileNames.map((fileName) => `${cleanKey}/${fileName}`);

  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove(filePaths);

  if (error) {
    console.error('Lỗi khi xoá nhiều tệp từ Supabase Storage:', error);
    throw new Error(error.message || 'Lỗi khi xoá các tệp khỏi máy chủ');
  }

  return true;
}
