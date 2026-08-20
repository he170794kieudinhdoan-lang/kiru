'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Plus,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Film,
  User,
  Share2,
  Video,
  Search,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';
import {
  SweetheartProfileData,
  SweetheartItem,
  FacebookPost,
  FacebookStory,
} from '@/types/sweetheart';
import { MaiHoaMediaItem } from '@/types/maihoa';
import { FacebookStoryBar } from '../FacebookProfile/FacebookStoryBar';
import { FacebookPostCard } from '../FacebookProfile/FacebookPostCard';
import { FacebookMediaModal } from '../FacebookProfile/FacebookMediaModal';
import { SweetheartPhotosTab } from './SweetheartPhotosTab';
import { SweetheartVideosTab } from './SweetheartVideosTab';
import { SweetheartAboutTab } from './SweetheartAboutTab';

interface SweetheartProfileViewProps {
  onBackToHome?: () => void;
}

// 🎨 Neobrutalism Animated Loading Component
const NeobrutalismLoadingScreen = ({ progress, phase }: { progress: number; phase: string }) => {
  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center p-4">
      <div className="neo-box-lg max-w-md w-full bg-white p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Floating Badges */}
        <div className="flex items-center justify-center gap-2">
          <span className="neo-badge bg-neo-pink text-white text-xs font-bold animate-bounce">
            💖 BÉ THẢO 2K5
          </span>
          <span className="neo-badge bg-neo-yellow text-black text-xs font-bold">
            ✨ FACEBOOK PROFILE
          </span>
        </div>

        {/* Animated Avatar / Spinner Box */}
        <div className="relative mx-auto w-24 h-24 rounded-full border-4 border-black bg-neo-pink flex items-center justify-center shadow-neo">
          <div className="text-4xl animate-spin" style={{ animationDuration: '3s' }}>
            🎀
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-neo-lime border-2 border-black flex items-center justify-center text-xs font-bold">
            ⚡
          </div>
        </div>

        {/* Title & Phase Description */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black font-kiru text-black tracking-tight">
            Đang tải Profile Bé Thảo...
          </h2>
          <p className="text-xs font-mono font-bold text-zinc-600 h-5">
            {phase}
          </p>
        </div>

        {/* Neobrutalism Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-6 border-3 border-black bg-zinc-100 rounded-full p-0.5 overflow-hidden relative shadow-neo-sm">
            <div
              className="h-full bg-gradient-to-r from-neo-yellow via-neo-pink to-neo-cyan border-r-2 border-black rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono font-black text-black px-1">
            <span>LOADING ALBUMS & STATUS</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Skeleton Previews Row */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t-2 border-black">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square border-2 border-black bg-zinc-100 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const SweetheartProfileView: React.FC<SweetheartProfileViewProps> = ({
  onBackToHome,
}) => {
  const [profile, setProfile] = useState<SweetheartProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(15);
  const [loadingPhase, setLoadingPhase] = useState<string>('Đang quét 132 ảnh & video của Bé Thảo...');
  const [error, setError] = useState<string | null>(null);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'videos' | 'about'>('posts');

  // Category & Search Filters for Feed
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected media for Theatre Modal
  const [selectedMedia, setSelectedMedia] = useState<MaiHoaMediaItem | null>(null);
  const [selectedPost, setSelectedPost] = useState<FacebookPost | null>(null);

  // Quick post create input state
  const [createPostText, setCreatePostText] = useState('');
  const [isFollowing, setIsFollowing] = useState(true);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setLoadingProgress(20);
    setLoadingPhase('Đang quét 132 media và 39 danh mục album của Bé Thảo...');
    setError(null);

    try {
      const timer1 = setTimeout(() => {
        setLoadingProgress(55);
        setLoadingPhase('Tạo status bài viết & bình luận tương tác...');
      }, 200);

      const timer2 = setTimeout(() => {
        setLoadingProgress(85);
        setLoadingPhase('Sắp xếp video reels & tối ưu hình ảnh WebP...');
      }, 400);

      const res = await fetch('/api/sweetheart');
      if (!res.ok) throw new Error('Không thể tải profile Thảo Baby');
      const json = await res.json();
      if (!json.success || !json.data) throw new Error(json.error || 'Lỗi dữ liệu');

      clearTimeout(timer1);
      clearTimeout(timer2);

      setLoadingProgress(100);
      setLoadingPhase('Hoàn tất! Đang mở trang cá nhân...');

      setTimeout(() => {
        setProfile(json.data);
        setLoading(false);
      }, 350);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Lỗi kết nối máy chủ');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleOpenMedia = (media: MaiHoaMediaItem, post?: FacebookPost) => {
    setSelectedMedia(media);
    setSelectedPost(post || null);
  };

  const handleShare = (post?: FacebookPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('✨ Đã sao chép liên kết trang cá nhân vào clipboard!');
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createPostText.trim() || !profile) return;

    const newPost: FacebookPost = {
      id: `post_user_${Date.now()}`,
      author: {
        name: profile.name,
        handle: profile.handle,
        avatar: profile.avatar,
        isVerified: true,
      },
      createdAt: 'Vừa xong',
      timestamp: Date.now(),
      caption: createPostText.trim(),
      feeling: '✨ đang cảm thấy rạng rỡ',
      privacy: 'public',
      media: [],
      reactions: { like: 1, love: 0, care: 0, haha: 0, wow: 0, sad: 0, angry: 0, total: 1 },
      commentsCount: 0,
      sharesCount: 0,
      comments: [],
      tags: ['#tthaosbaby', '#status'],
    };

    setProfile((prev) => (prev ? { ...prev, posts: [newPost, ...prev.posts] } : prev));
    setCreatePostText('');
    showToast('🎉 Đã đăng bài viết mới lên dòng thời gian!');
  };

  // Filter posts on timeline by category and search
  const filteredPosts = useMemo(() => {
    if (!profile?.posts) return [];
    let list = profile.posts;

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.feeling?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [profile?.posts, selectedCategory, searchQuery]);

  if (loading) {
    return <NeobrutalismLoadingScreen progress={loadingProgress} phase={loadingPhase} />;
  }

  if (error || !profile) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="neo-box-lg p-8 bg-red-50 space-y-3">
          <p className="text-red-600 font-bold">{error || 'Không tìm thấy thông tin profile'}</p>
          <button onClick={fetchProfile} className="neo-btn bg-black text-white px-4 py-2 text-xs font-bold">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-4 py-4 pb-24 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 neo-badge bg-neo-lime text-black border-2 border-black px-4 py-2 text-xs font-black shadow-neo animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* ======================================================== */}
      {/* 🌟 1. FACEBOOK COVER BANNER & PROFILE HEADER 🌟 */}
      {/* ======================================================== */}
      <section className="neo-box-lg bg-white overflow-hidden p-0">
        {/* Cover Photo Area */}
        <div className="relative h-56 sm:h-72 md:h-80 w-full bg-gradient-to-r from-neo-yellow via-neo-pink to-neo-cyan border-b-4 border-black overflow-hidden group">
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Edit Cover Button */}
          <button className="absolute bottom-3 right-3 z-10 neo-btn bg-white/95 hover:bg-white text-black px-3 py-1.5 text-xs font-black flex items-center gap-1.5 shadow-neo-sm">
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chỉnh sửa ảnh bìa</span>
          </button>

          {/* Top Verified Creator Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="neo-badge bg-black text-white text-[10px] sm:text-xs font-bold border-2 border-white">
              🔥 TRANG CÁ NHÂN CHÍNH THỨC
            </span>
            <span className="neo-badge bg-neo-yellow text-black text-[10px] sm:text-xs font-black">
              BÉ THẢO 2K5
            </span>
          </div>
        </div>

        {/* Profile Info Bar */}
        <div className="px-4 sm:px-8 pb-5 pt-0">
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-4 relative z-10">
            {/* Left: Avatar & Name */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 text-center sm:text-left">
              {/* Profile Avatar (Negative margin ONLY on the avatar itself) */}
              <div className="-mt-16 sm:-mt-20 md:-mt-24 relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-black bg-white overflow-hidden shadow-neo-lg group shrink-0 ring-4 ring-white">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                />
                <button
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-neo-yellow border-2 border-black text-black shadow-neo-sm hover:scale-110 transition-transform"
                  title="Đổi ảnh đại diện"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {/* Online Status Dot */}
                <div
                  className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-neo-lime border-2 border-black"
                  title="Đang hoạt động"
                />
              </div>

              {/* Names & Follower Stats */}
              <div className="space-y-1.5 pt-2 sm:pt-4 sm:pb-2">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-kiru text-black tracking-tight">
                    {profile.name}
                  </h1>
                  <span title="Tài khoản đã xác minh">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 fill-blue-100" />
                  </span>
                  <span className="neo-badge bg-neo-pink text-white text-[10px] sm:text-xs font-bold">
                    {profile.badge}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-bold font-mono text-zinc-600">
                  {profile.nickname} • <span className="text-black font-black">{profile.followersCount.toLocaleString()}</span> người theo dõi • <span className="text-black font-black">{profile.friendsCount.toLocaleString()}</span> bạn bè
                </p>

                {/* Friend Avatar Stack */}
                <div className="flex items-center justify-center sm:justify-start -space-x-2 pt-0.5">
                  {profile.featuredPhotos.slice(0, 5).map((img) => (
                    <div
                      key={img.id}
                      className="w-7 h-7 rounded-full border-2 border-black overflow-hidden bg-zinc-200"
                    >
                      <img src={img.thumbUrl || img.url} alt="Friend" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded-full border-2 border-black bg-neo-yellow text-black flex items-center justify-center text-[10px] font-black font-mono">
                    +1.5k
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Facebook Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-center pt-2 sm:pt-4 sm:pb-2 w-full lg:w-auto">
              <button
                onClick={() => {
                  setIsFollowing((prev) => !prev);
                  showToast(isFollowing ? 'Đã hủy theo dõi' : '💖 Đã theo dõi Bé Thảo Baby!');
                }}
                className={`neo-btn px-4 py-2 text-xs sm:text-sm font-black shadow-neo flex items-center gap-1.5 transition-all ${
                  isFollowing ? 'bg-neo-pink text-white' : 'bg-neo-yellow text-black'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                <span>{isFollowing ? 'Đang theo dõi' : '+ Theo dõi'}</span>
              </button>

              <button
                onClick={() => showToast('💬 Mở khung chat với bé Thảo Baby')}
                className="neo-btn bg-white hover:bg-zinc-100 text-black px-4 py-2 text-xs sm:text-sm font-bold shadow-neo flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn tin</span>
              </button>

              <button
                onClick={() => handleShare()}
                className="neo-btn bg-white hover:bg-zinc-100 text-black p-2 text-xs font-bold shadow-neo"
                title="Chia sẻ trang cá nhân"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Facebook Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto border-t-2 border-black mt-5 pt-2 scrollbar-none text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3.5 py-2 border-b-4 transition-all whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'border-black text-black font-black bg-neo-yellow/30'
                  : 'border-transparent text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              📰 Bài viết ({profile.posts.length})
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`px-3.5 py-2 border-b-4 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'photos'
                  ? 'border-black text-black font-black bg-neo-yellow/30'
                  : 'border-transparent text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Ảnh ({profile.photoCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`px-3.5 py-2 border-b-4 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'videos'
                  ? 'border-black text-black font-black bg-neo-yellow/30'
                  : 'border-transparent text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Video & Reels ({profile.videoCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`px-3.5 py-2 border-b-4 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'about'
                  ? 'border-black text-black font-black bg-neo-yellow/30'
                  : 'border-transparent text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Giới thiệu</span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 🌟 2. TAB CONTENT VIEWPORT 🌟 */}
      {/* ======================================================== */}

      {/* TAB: PHOTOS */}
      {activeTab === 'photos' && (
        <SweetheartPhotosTab
          photos={profile.allMedia.filter((m) => !m.isVideo)}
          categories={profile.categories}
          onOpenPhoto={(item) => handleOpenMedia(item)}
        />
      )}

      {/* TAB: VIDEOS */}
      {activeTab === 'videos' && (
        <SweetheartVideosTab
          videos={profile.allMedia.filter((m) => m.isVideo)}
          categories={profile.categories}
          onOpenVideo={(item) => handleOpenMedia(item)}
        />
      )}

      {/* TAB: ABOUT */}
      {activeTab === 'about' && <SweetheartAboutTab profile={profile} />}

      {/* TAB: POSTS & TIMELINE (Classic 2-Column Facebook Profile) */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* =================================================== */}
          {/* 📌 LEFT COLUMN (SIDEBAR - 5 COLS ON LG) */}
          {/* =================================================== */}
          <div className="lg:col-span-5 space-y-4">
            {/* Giới thiệu Card (Intro) */}
            <div className="neo-box p-4 bg-white space-y-3">
              <h3 className="font-black text-base font-kiru text-black border-b-2 border-black pb-2 flex items-center justify-between">
                <span>📌 Giới thiệu</span>
                <span className="neo-badge bg-neo-lime text-black text-[10px]">Active</span>
              </h3>

              <p className="text-xs font-semibold text-zinc-800 text-center italic bg-zinc-50 p-2.5 border border-black rounded-lg">
                "{profile.bio}"
              </p>

              <ul className="space-y-2 text-xs font-medium text-zinc-700">
                <li className="flex items-center gap-2">
                  <span>🎓</span>
                  <span>{profile.education}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Sống tại <strong className="text-black">{profile.location}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span>💖</span>
                  <span>Tình trạng: <strong className="text-black">{profile.relationship}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Tham gia từ {profile.joinedDate}</span>
                </li>
              </ul>

              {/* Hobby Badges */}
              <div className="pt-2 border-t border-zinc-200 flex flex-wrap gap-1.5">
                {profile.hobbies.map((h) => (
                  <span
                    key={h}
                    className="neo-badge bg-white text-black text-[10px] font-bold hover:bg-neo-yellow cursor-pointer"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* 🌟 OFFICIAL CREATOR HUB & SOCIAL CHANNELS */}
            <div className="neo-box p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 border-3 border-black space-y-3 shadow-neo">
              <div className="flex items-center justify-between">
                <span className="neo-badge bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black shadow-neo-sm">
                  ✨ CREATOR HUB
                </span>
                <span className="neo-badge bg-black text-neo-yellow text-[10px] font-mono font-bold">
                  VERIFIED 100%
                </span>
              </div>

              <div>
                <h4 className="font-black text-sm font-kiru text-black">
                  💖 Kênh Sáng Tạo & Bộ Sưu Tập Của Bé
                </h4>
                <p className="text-[11px] text-zinc-700 font-medium mt-1 leading-relaxed">
                  Trọn bộ 39 style cosplay, bikini, outfit dã ngoại và clip tự quay siêu xinh. Xem vui vẻ nha mng 🔥
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => showToast('🎬 Đã mở kênh TikTok của Bé Thảo!')}
                  className="neo-btn bg-black text-white font-black text-[11px] py-2 shadow-neo-sm hover:scale-[1.02] transition-transform"
                >
                  <span>🎵 TikTok</span>
                </button>
                <button
                  onClick={() => showToast('📸 Đã mở trang Instagram của Bé Thảo!')}
                  className="neo-btn bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-[11px] py-2 shadow-neo-sm hover:scale-[1.02] transition-transform"
                >
                  <span>📷 Instagram</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 pt-1 border-t border-black/20">
                <span>⚡ 98.4K Người theo dõi</span>
                <span>🔥 2.1M Lượt thích</span>
              </div>
            </div>

            {/* Ảnh đáng chú ý (Featured 9-Grid Photos) */}
            <div className="neo-box p-4 bg-white space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="font-black text-sm font-kiru text-black">
                  📸 Ảnh đáng chú ý
                </h3>
                <button
                  onClick={() => setActiveTab('photos')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Xem tất cả ({profile.photoCount})
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden border-2 border-black">
                {profile.featuredPhotos.map((photo, i) => (
                  <div
                    key={photo.id}
                    onClick={() => handleOpenMedia(photo)}
                    className="aspect-square bg-zinc-100 overflow-hidden cursor-pointer group relative"
                  >
                    <img
                      src={photo.thumbUrl || photo.url}
                      alt={`Featured ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Video & Clips nổi bật */}
            <div className="neo-box p-4 bg-white space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="font-black text-sm font-kiru text-black flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-neo-yellow fill-black" />
                  <span>Reels nổi bật</span>
                </h3>
                <button
                  onClick={() => setActiveTab('videos')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Xem tất cả ({profile.videoCount})
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {profile.allMedia
                  .filter((m) => m.isVideo)
                  .slice(0, 3)
                  .map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => handleOpenMedia(vid)}
                      className="aspect-[9/16] relative rounded-lg border-2 border-black overflow-hidden bg-black group cursor-pointer shadow-neo-sm hover:-translate-y-1 transition-all"
                    >
                      <img
                        src={vid.thumbUrl}
                        alt="Reels"
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-neo-yellow border border-black flex items-center justify-center text-black shadow-neo-sm group-hover:scale-110 transition-transform">
                          <Film className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* =================================================== */}
          {/* 📰 RIGHT COLUMN (FEED POSTS - 7 COLS ON LG) */}
          {/* =================================================== */}
          <div className="lg:col-span-7 space-y-4">
            {/* Create Post Box */}
            <div className="neo-box p-4 bg-white space-y-3">
              <form onSubmit={handleCreatePost} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-neo-pink shrink-0">
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="text"
                    value={createPostText}
                    onChange={(e) => setCreatePostText(e.target.value)}
                    placeholder="Bé Thảo ơi, hôm nay bạn đang nghĩ gì thế?"
                    className="flex-1 border-2 border-black rounded-full px-4 py-2 text-xs font-medium focus:bg-yellow-50 outline-none shadow-neo-sm"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-xs font-bold text-zinc-700">
                  <button
                    type="button"
                    onClick={() => setActiveTab('videos')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 text-red-600"
                  >
                    <Video className="w-4 h-4" />
                    <span>Video trực tiếp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('photos')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 text-green-600"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Ảnh/Video</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!createPostText.trim()}
                    className="neo-btn bg-neo-yellow text-black px-4 py-1.5 text-xs font-black shadow-neo-sm disabled:opacity-40"
                  >
                    Đăng
                  </button>
                </div>
              </form>
            </div>

            {/* Stories Bar */}
            {profile.stories && profile.stories.length > 0 && (
              <FacebookStoryBar
                stories={profile.stories}
                avatar={profile.avatar}
                onOpenStory={(story) => {
                  const matched = profile.allMedia.find((m) => m.url === story.mediaUrl) || profile.allMedia[0];
                  handleOpenMedia(matched);
                }}
              />
            )}

            {/* ======================================================== */}
            {/* 🏷️ CATEGORY FILTER & SEARCH BAR ON TIMELINE 🏷️ */}
            {/* ======================================================== */}
            <div className="neo-box p-3.5 sm:p-4 bg-white space-y-3 shadow-neo-sm">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-black" />
                  <span className="font-black text-xs sm:text-sm font-kiru">
                    Phân Loại Theo Danh Mục ({profile.categories.length} Album)
                  </span>
                </div>

                {/* Search Box */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm status, outfit, tag..."
                    className="w-full border-2 border-black pl-8 pr-7 py-1.5 text-xs font-medium focus:bg-yellow-50 outline-none rounded-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills Carousel */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs border-t border-zinc-200 pt-2.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`neo-badge shrink-0 cursor-pointer transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-black text-white scale-105 shadow-neo-sm'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  🌟 Tất cả ({profile.posts.length})
                </button>

                {profile.categories.map((cat) => {
                  const isSelected = selectedCategory === cat.folder;
                  return (
                    <button
                      key={cat.folder}
                      onClick={() => setSelectedCategory(isSelected ? 'all' : cat.folder)}
                      className={`neo-badge shrink-0 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-neo-pink text-white scale-105 shadow-neo-sm'
                          : 'bg-white text-zinc-700 hover:bg-neo-yellow hover:text-black'
                      }`}
                    >
                      #{cat.title} ({cat.count})
                    </button>
                  );
                })}
              </div>

              {/* Active Filter indicator */}
              {(selectedCategory !== 'all' || searchQuery) && (
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-600 bg-yellow-50 p-2 border border-black rounded-lg">
                  <span>
                    Hiển thị <strong>{filteredPosts.length}</strong> bài viết phù hợp
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="text-red-600 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Đặt lại
                  </button>
                </div>
              )}
            </div>

            {/* Posts Feed */}
            {filteredPosts.length === 0 ? (
              <div className="neo-box p-8 bg-white text-center space-y-3">
                <p className="text-zinc-600 font-bold text-sm">Không tìm thấy bài viết nào phù hợp.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="neo-btn bg-neo-pink text-white px-4 py-2 text-xs font-bold"
                >
                  Xem tất cả bài viết
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <FacebookPostCard
                    key={post.id}
                    post={post}
                    onOpenMedia={(media, p) => handleOpenMedia(media, p)}
                    onSharePost={handleShare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🔍 3. THEATRE LIGHTBOX MODAL 🌟 */}
      {/* ======================================================== */}
      {selectedMedia && (
        <FacebookMediaModal
          media={selectedMedia}
          post={selectedPost}
          allMedia={profile.allMedia}
          isOpen={selectedMedia !== null}
          onClose={() => {
            setSelectedMedia(null);
            setSelectedPost(null);
          }}
          onSelectMedia={(item) => setSelectedMedia(item)}
        />
      )}
    </div>
  );
};
