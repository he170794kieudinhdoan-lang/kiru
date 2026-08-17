import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SweetheartItem, SweetheartApiResponse } from '@/types/sweetheart';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SUPABASE_BASE_URL = 'https://rtumniwnckicetqyqpvn.supabase.co/storage/v1/object/public/vault-media';

function getMediaRoot(): string {
  const localProjectDir = path.join(process.cwd(), 'media', 'sweetheart');
  if (fs.existsSync(localProjectDir)) {
    return localProjectDir;
  }
  const fallbackDir = 'C:\\Users\\kieud\\Videos\\New folder';
  if (fs.existsSync(fallbackDir)) {
    return fallbackDir;
  }
  return localProjectDir;
}

function cleanFolderTitle(folder: string): string {
  return folder
    .replace(/^\d+_/, '')
    .replace(/_/g, ' ')
    .trim();
}

function scanMediaDirectory(dirPath: string, rootDir: string): SweetheartItem[] {
  let results: SweetheartItem[] = [];

  if (!fs.existsSync(dirPath)) {
    return results;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      results = results.concat(scanMediaDirectory(fullPath, rootDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      const validImageExts = ['.webp', '.jpg', '.jpeg', '.jfif', '.png', '.gif'];
      const validVideoExts = ['.webm', '.mp4', '.mov', '.mkv'];

      const isImage = validImageExts.includes(ext);
      const isVideo = validVideoExts.includes(ext);

      if (isImage || isVideo) {
        const stats = fs.statSync(fullPath);
        const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        const parentFolder = path.basename(path.dirname(fullPath));
        const folderName = parentFolder === path.basename(rootDir) ? 'Chung' : parentFolder;
        const id = Buffer.from(relPath).toString('base64url');

        const baseRelPath = relPath.substring(0, relPath.lastIndexOf('.'));
        const thumbRelPath = `${baseRelPath}.webp`;

        // Supabase Public Storage URLs
        const supabaseUrl = `${SUPABASE_BASE_URL}/sweetheart/originals/${encodeURI(relPath)}`;
        const supabaseThumbUrl = `${SUPABASE_BASE_URL}/sweetheart/thumbs/${encodeURI(thumbRelPath)}`;

        results.push({
          id,
          name: entry.name,
          relPath,
          folder: folderName,
          folderTitle: cleanFolderTitle(folderName),
          size: stats.size,
          mtime: stats.mtimeMs,
          isVideo,
          url: `/api/sweetheart/media?file=${encodeURIComponent(relPath)}`,
          thumbUrl: `/api/sweetheart/media?file=${encodeURIComponent(relPath)}&thumb=true`,
          supabaseUrl,
          supabaseThumbUrl,
          ext: ext.replace('.', ''),
        });
      }
    }
  }

  return results;
}

export async function GET() {
  try {
    const mediaRoot = getMediaRoot();

    if (!fs.existsSync(mediaRoot)) {
      return NextResponse.json(
        { error: `Thư mục media không tồn tại: ${mediaRoot}` },
        { status: 404 }
      );
    }

    const items = scanMediaDirectory(mediaRoot, mediaRoot);

    const categoriesMap: Record<string, number> = {};
    let imageCount = 0;
    let videoCount = 0;
    let totalBytes = 0;

    for (const item of items) {
      categoriesMap[item.folderTitle] = (categoriesMap[item.folderTitle] || 0) + 1;
      if (item.isVideo) {
        videoCount++;
      } else {
        imageCount++;
      }
      totalBytes += item.size;
    }

    const categories = Object.keys(categoriesMap).map((name) => ({
      name,
      count: categoriesMap[name],
    }));

    return NextResponse.json({
      success: true,
      totalCount: items.length,
      imageCount,
      videoCount,
      totalBytes,
      categories,
      items,
    });
  } catch (err: any) {
    console.error('Error scanning sweetheart media:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi đọc thư mục media' },
      { status: 500 }
    );
  }
}
