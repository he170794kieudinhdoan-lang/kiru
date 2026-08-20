import { MaiHoaMediaItem, FacebookPost, FacebookStory, FacebookComment } from './maihoa';

export interface SweetheartItem extends MaiHoaMediaItem {
  name: string;
  relPath: string;
  folder: string;
  folderTitle: string;
  mtime?: number;
}

export interface SweetheartCategory {
  name: string;
  folder: string;
  title: string;
  count: number;
  videoCount: number;
  imageCount: number;
}

export interface SweetheartProfileData {
  name: string;
  badge: string;
  nickname: string;
  handle: string;
  avatar: string;
  coverImage: string;
  bio: string;
  work: string;
  education: string;
  location: string;
  hometown: string;
  relationship: string;
  joinedDate: string;
  followersCount: number;
  friendsCount: number;
  followingCount: number;
  hobbies: string[];
  featuredPhotos: MaiHoaMediaItem[];
  stories: FacebookStory[];
  posts: FacebookPost[];
  allMedia: MaiHoaMediaItem[];
  photoCount: number;
  videoCount: number;
  categories: SweetheartCategory[];
}

export interface SweetheartApiResponse {
  success: boolean;
  totalCount: number;
  imageCount: number;
  videoCount: number;
  totalBytes: number;
  categories: SweetheartCategory[];
  items: SweetheartItem[];
  data?: SweetheartProfileData;
  error?: string;
}

export type { MaiHoaMediaItem, FacebookPost, FacebookStory, FacebookComment };
