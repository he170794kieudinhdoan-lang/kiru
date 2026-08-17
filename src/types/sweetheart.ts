export interface SweetheartItem {
  id: string;
  name: string;
  relPath: string;
  folder: string;
  folderTitle: string;
  size: number;
  mtime: number;
  isVideo: boolean;
  url: string;              // High-resolution full media
  thumbUrl: string;         // Compressed lightweight preview thumbnail
  supabaseUrl?: string;     // Supabase storage full URL
  supabaseThumbUrl?: string;// Supabase storage thumbnail URL
  ext: string;
}

export interface SweetheartCategory {
  name: string;
  count: number;
}

export interface SweetheartApiResponse {
  success: boolean;
  totalCount: number;
  imageCount: number;
  videoCount: number;
  totalBytes: number;
  categories: SweetheartCategory[];
  items: SweetheartItem[];
  error?: string;
}
