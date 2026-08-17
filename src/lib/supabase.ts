import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'vault-media';
export const FILE_TTL_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

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

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    console.error('Thiếu cấu hình Supabase trong .env.local');
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getBucketName(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_BUCKET || DEFAULT_BUCKET;
}

/**
 * List all active media files in a key vault and automatically purge expired files (> 30 minutes) from Supabase
 */
export async function listVaultFiles(vaultKey: string): Promise<VaultFileItem[]> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Chưa kết nối máy chủ lưu trữ.');
  }

  const bucket = getBucketName();
  const cleanKey = vaultKey.trim();

  const { data, error } = await supabase.storage.from(bucket).list(cleanKey, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    throw new Error(error.message);
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
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = item.metadata?.mimetype || (['mp4', 'webm', 'mov', 'mkv'].includes(ext) ? `video/${ext}` : `image/${ext}`);
    const isVideo = mimeType.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext);
    const isImage = mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp'].includes(ext);

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
    supabase.storage.from(bucket).remove(expiredPathsToPurge).then(({ error: purgeErr }) => {
      if (purgeErr) console.warn('Lỗi khi tự động xoá file hết hạn:', purgeErr);
      else console.log(`Đã tự động xoá ${expiredPathsToPurge.length} file hết hạn (>30 phút) khỏi Supabase.`);
    });
  }

  return activeFiles;
}

/**
 * Upload a media file into a key vault with timestamp prefix for 30m auto-purge
 */
export async function uploadVaultFile(
  vaultKey: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<VaultFileItem> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Chưa kết nối máy chủ lưu trữ.');
  }

  const bucket = getBucketName();
  const cleanKey = vaultKey.trim();

  const now = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueName = `${now}_${cleanFileName}`;
  const filePath = `${cleanKey}/${uniqueName}`;

  if (onProgress) onProgress(30);

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '1800', // 30 mins
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message || 'Lỗi tải tệp lên');
  }

  if (onProgress) onProgress(90);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  if (onProgress) onProgress(100);

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv'].includes(ext);
  const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);

  return {
    id: data.id || `${cleanKey}_${uniqueName}`,
    name: uniqueName,
    originalName: file.name,
    size: file.size,
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    expiresAt: now + FILE_TTL_MS,
    url: urlData.publicUrl,
    mimeType: file.type || 'application/octet-stream',
    isVideo,
    isImage,
  };
}

/**
 * Delete a media file from vault and Supabase Storage
 */
export async function deleteVaultFile(vaultKey: string, fileName: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Chưa kết nối máy chủ lưu trữ.');
  }

  const bucket = getBucketName();
  const cleanKey = vaultKey.trim();
  const filePath = `${cleanKey}/${fileName}`;

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

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
  if (!supabase) {
    throw new Error('Chưa kết nối máy chủ lưu trữ.');
  }

  const bucket = getBucketName();
  const cleanKey = vaultKey.trim();
  const filePaths = fileNames.map((fileName) => `${cleanKey}/${fileName}`);

  const { error } = await supabase.storage.from(bucket).remove(filePaths);

  if (error) {
    console.error('Lỗi khi xoá nhiều tệp từ Supabase Storage:', error);
    throw new Error(error.message || 'Lỗi khi xoá các tệp khỏi máy chủ');
  }

  return true;
}

