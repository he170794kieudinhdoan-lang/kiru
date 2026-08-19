import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SUPABASE_BASE_URL = 'https://rtumniwnckicetqyqpvn.supabase.co/storage/v1/object/public/vault-media';

function getMediaRoot(): string {
  return path.join(process.cwd(), 'media', 'mai_hoa');
}

function getThumbRoot(): string {
  return path.join(process.cwd(), 'media', 'mai_hoa_thumbs');
}

const MIME_MAP: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const relFile = searchParams.get('file');
    const isThumb = searchParams.get('thumb') === 'true';

    if (!relFile) {
      return new NextResponse('File parameter missing', { status: 400 });
    }

    const mediaRoot = getMediaRoot();
    const thumbRoot = getThumbRoot();

    const safeFilename = path.basename(relFile);
    let targetPath = path.join(mediaRoot, safeFilename);

    // If requesting thumbnail preview
    if (isThumb) {
      const baseName = path.parse(safeFilename).name;
      const thumbFile = path.join(thumbRoot, `${baseName}.webp`);
      if (fs.existsSync(thumbFile)) {
        targetPath = thumbFile;
      }
    }

    if (!fs.existsSync(targetPath)) {
      const subfolder = isThumb ? 'thumbs' : 'originals';
      const targetFileName = isThumb ? `${path.parse(safeFilename).name}.webp` : safeFilename;
      return NextResponse.redirect(`${SUPABASE_BASE_URL}/mai_hoa/${subfolder}/${encodeURI(targetFileName)}`, 307);
    }

    const stat = fs.statSync(targetPath);
    if (!stat.isFile()) {
      return new NextResponse('Not a file', { status: 400 });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';
    const fileSize = stat.size;

    // Video Streaming with HTTP Range Requests (smooth seeking)
    const rangeHeader = req.headers.get('range');
    if (rangeHeader && contentType.startsWith('video/')) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(targetPath, { start, end });

      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => {
            controller.enqueue(chunk);
          });
          fileStream.on('end', () => {
            controller.close();
          });
          fileStream.on('error', (err) => {
            controller.error(err);
          });
        },
        cancel() {
          fileStream.destroy();
        },
      });

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // Standard static stream
    const fileBuffer = fs.readFileSync(targetPath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Cache-Control': isThumb
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=86400, immutable',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (err: any) {
    console.error('Error serving media file:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
