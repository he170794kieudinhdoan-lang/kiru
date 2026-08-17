import { NextResponse } from 'next/server';
import { getSupabase, getBucketName, FILE_TTL_MS } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }

  const bucket = getBucketName();

  try {
    // List root folders in bucket
    const { data: folders, error: folderErr } = await supabase.storage.from(bucket).list('', {
      limit: 100,
    });

    if (folderErr) {
      return NextResponse.json({ error: folderErr.message }, { status: 500 });
    }

    const now = Date.now();
    const purgedPaths: string[] = [];

    for (const item of folders || []) {
      // Check folder or files
      const { data: subFiles, error: subErr } = await supabase.storage.from(bucket).list(item.name, {
        limit: 100,
      });

      if (!subErr && subFiles) {
        for (const file of subFiles) {
          if (file.name === '.vault' || file.name === '.emptyFolderPlaceholder') continue;

          const match = file.name.match(/^(\d+)_(.+)$/);
          const timestamp = match ? parseInt(match[1]) : new Date(file.created_at || now).getTime();
          const age = now - timestamp;

          if (age > FILE_TTL_MS) {
            purgedPaths.push(`${item.name}/${file.name}`);
          }
        }
      }
    }

    if (purgedPaths.length > 0) {
      const { error: removeErr } = await supabase.storage.from(bucket).remove(purgedPaths);
      if (removeErr) {
        return NextResponse.json({ error: removeErr.message, purgedCount: 0 }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      purgedCount: purgedPaths.length,
      purgedPaths,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
