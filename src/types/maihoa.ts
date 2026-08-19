export interface MaiHoaMediaItem {
  id: string;
  filename: string;
  isVideo: boolean;
  ext: string;
  size: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  thumbUrl: string;
  supabaseUrl?: string;
  supabaseThumbUrl?: string;
}

export interface FacebookComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  isVerified?: boolean;
}

export interface FacebookPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    isVerified: boolean;
  };
  createdAt: string;
  timestamp: number;
  caption: string;
  feeling?: string;
  location?: string;
  privacy: 'public' | 'friends' | 'only_me';
  media: MaiHoaMediaItem[];
  reactions: {
    like: number;
    love: number;
    care: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
    total: number;
  };
  userReaction?: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry' | null;
  commentsCount: number;
  sharesCount: number;
  comments: FacebookComment[];
  tags?: string[];
  pinned?: boolean;
}

export interface FacebookStory {
  id: string;
  author: string;
  avatar: string;
  mediaUrl: string;
  thumbUrl: string;
  isVideo: boolean;
  time: string;
  viewed?: boolean;
}

export interface MaiHoaProfileData {
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
}
