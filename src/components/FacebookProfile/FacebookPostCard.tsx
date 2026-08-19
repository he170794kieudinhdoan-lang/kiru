'use client';

import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
  Play,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  CheckCircle2,
  Smile,
  Bookmark,
  Maximize2
} from 'lucide-react';
import { FacebookPost, FacebookComment, MaiHoaMediaItem } from '@/types/maihoa';

interface FacebookPostCardProps {
  post: FacebookPost;
  onOpenMedia: (media: MaiHoaMediaItem, post: FacebookPost) => void;
  onSharePost?: (post: FacebookPost) => void;
}

const REACTIONS = [
  { type: 'like', label: 'Thích', emoji: '👍', color: 'text-blue-600', bg: 'bg-blue-100' },
  { type: 'love', label: 'Yêu thích', emoji: '❤️', color: 'text-red-500', bg: 'bg-red-100' },
  { type: 'care', label: 'Thương thương', emoji: '🥰', color: 'text-amber-500', bg: 'bg-amber-100' },
  { type: 'haha', label: 'Haha', emoji: '😆', color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { type: 'wow', label: 'Wow', emoji: '😮', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { type: 'sad', label: 'Buồn', emoji: '😢', color: 'text-amber-600', bg: 'bg-amber-100' },
  { type: 'angry', label: 'Phẫn nộ', emoji: '😡', color: 'text-orange-600', bg: 'bg-orange-100' },
] as const;

export const FacebookPostCard: React.FC<FacebookPostCardProps> = ({
  post,
  onOpenMedia,
  onSharePost,
}) => {
  const [currentReaction, setCurrentReaction] = useState<string | null>(post.userReaction || null);
  const [reactionsCount, setReactionsCount] = useState(post.reactions.total);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FacebookComment[]>(post.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleSelectReaction = (type: string) => {
    if (currentReaction === type) {
      setCurrentReaction(null);
      setReactionsCount((prev) => Math.max(0, prev - 1));
    } else {
      if (!currentReaction) {
        setReactionsCount((prev) => prev + 1);
      }
      setCurrentReaction(type);
    }
    setShowReactionPicker(false);
  };

  const handleQuickLike = () => {
    if (currentReaction) {
      setCurrentReaction(null);
      setReactionsCount((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentReaction('like');
      setReactionsCount((prev) => prev + 1);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: FacebookComment = {
      id: `c_user_${Date.now()}`,
      author: 'Bạn (Người xem)',
      avatar: '/avatar.png',
      content: newCommentText.trim(),
      time: 'Vừa xong',
      likes: 0,
    };

    setComments((prev) => [newComment, ...prev]);
    setNewCommentText('');
  };

  const activeReactionObj = REACTIONS.find((r) => r.type === currentReaction);

  return (
    <article className="neo-box bg-white overflow-hidden space-y-3 transition-shadow duration-150">
      {/* Pinned Badge if applicable */}
      {post.pinned && (
        <div className="bg-neo-yellow border-b-2 border-black px-4 py-1 flex items-center justify-between text-xs font-black">
          <span className="flex items-center gap-1.5 font-kiru">
            <Sparkles className="w-3.5 h-3.5 fill-current" /> BÀI VIẾT ĐƯỢC GHIM
          </span>
          <span className="neo-badge bg-black text-white text-[10px] py-0 px-1.5">MỚI NHẤT</span>
        </div>
      )}

      {/* Post Header */}
      <div className="px-4 pt-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Author Avatar with Neobrutalism Border */}
          <div className="relative w-11 h-11 rounded-full border-2 border-black overflow-hidden bg-neo-pink shrink-0 shadow-neo-sm">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-sm text-black font-kiru hover:underline cursor-pointer">
                {post.author.name}
              </span>
              {post.author.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-100" />
              )}
              {post.feeling && (
                <span className="text-xs text-zinc-600 font-medium">
                  {post.feeling}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
              <span>{post.createdAt}</span>
              <span>•</span>
              {post.location && (
                <>
                  <span>📍 {post.location}</span>
                  <span>•</span>
                </>
              )}
              <Globe className="w-3 h-3 text-zinc-400" />
            </div>
          </div>
        </div>

        {/* 3-Dots Action Button */}
        <button className="p-1.5 rounded-lg border-2 border-transparent hover:border-black hover:bg-zinc-100 transition-all">
          <MoreHorizontal className="w-4 h-4 text-zinc-600" />
        </button>
      </div>

      {/* Post Caption */}
      <div className="px-4 text-sm font-medium text-black leading-relaxed space-y-2">
        <p className="whitespace-pre-line">{post.caption}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Media Display */}
      {post.media && post.media.length > 0 && (
        <div className="border-y-2 border-black bg-zinc-950 overflow-hidden relative">
          {/* Single Video Layout */}
          {post.media.length === 1 && post.media[0].isVideo && (
            <div className="relative w-full max-h-[580px] bg-black flex items-center justify-center group">
              <video
                ref={videoRef}
                src={post.media[0].url}
                poster={post.media[0].thumbUrl}
                playsInline
                loop
                muted={isMuted}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                    } else {
                      videoRef.current.pause();
                    }
                  }
                }}
                className="w-full max-h-[580px] object-contain cursor-pointer"
              />

              {/* Video Overlay Play Button */}
              {!isVideoPlaying && (
                <div
                  onClick={() => videoRef.current?.play()}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-neo-yellow border-3 border-black text-black flex items-center justify-center shadow-neo hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-current translate-x-0.5" />
                  </div>
                </div>
              )}

              {/* Video Controls Bar */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="p-2 rounded-full bg-black/75 border border-white text-white hover:bg-black transition-all shadow-neo-sm"
                  title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onOpenMedia(post.media[0], post)}
                  className="p-2 rounded-full bg-black/75 border border-white text-white hover:bg-black transition-all shadow-neo-sm"
                  title="Xem toàn màn hình"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* HD & Video Badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                <span className="neo-badge bg-neo-yellow text-black text-[10px] font-black border border-black">
                  VIDEO HD
                </span>
                <span className="neo-badge bg-black text-white text-[10px] font-mono border border-black">
                  {post.media[0].duration}s
                </span>
              </div>
            </div>
          )}

          {/* Single Image Layout */}
          {post.media.length === 1 && !post.media[0].isVideo && (
            <div
              onClick={() => onOpenMedia(post.media[0], post)}
              className="relative w-full max-h-[580px] bg-zinc-900 flex items-center justify-center cursor-pointer group overflow-hidden"
            >
              <img
                src={post.media[0].url}
                alt={post.caption}
                className="w-full max-h-[580px] object-contain group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute bottom-3 right-3 p-1.5 bg-black/70 border border-white text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Multi-Photo Layout (2, 3, 4+ Grid) */}
          {post.media.length > 1 && (
            <div
              className={`grid gap-1 bg-black p-0.5 ${
                post.media.length === 2
                  ? 'grid-cols-2 aspect-[4/3]'
                  : post.media.length === 3
                  ? 'grid-cols-3 aspect-[16/9]'
                  : 'grid-cols-2 sm:grid-cols-3 aspect-[4/3]'
              }`}
            >
              {post.media.slice(0, 4).map((item, idx) => {
                const isExtra = idx === 3 && post.media.length > 4;
                const remaining = post.media.length - 4;

                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenMedia(item, post)}
                    className="relative aspect-square overflow-hidden cursor-pointer group bg-zinc-900"
                  >
                    <img
                      src={item.thumbUrl || item.url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Extra Photos Counter Overlay */}
                    {isExtra && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white">
                        <span className="text-2xl font-black font-kiru">+{remaining}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reactions Count & Summary */}
      <div className="px-4 py-1 flex items-center justify-between text-xs font-mono text-zinc-600 border-b border-zinc-200">
        <div className="flex items-center gap-1.5">
          <span className="flex -space-x-1">
            <span className="w-5 h-5 rounded-full bg-blue-600 border border-white flex items-center justify-center text-[10px] text-white">
              👍
            </span>
            <span className="w-5 h-5 rounded-full bg-red-500 border border-white flex items-center justify-center text-[10px] text-white">
              ❤️
            </span>
            <span className="w-5 h-5 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[10px] text-white">
              🥰
            </span>
          </span>
          <span className="font-bold text-black">{reactionsCount.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="hover:underline"
          >
            {comments.length} bình luận
          </button>
          <span>•</span>
          <span>{post.sharesCount} lượt chia sẻ</span>
        </div>
      </div>

      {/* Facebook Interaction Action Buttons */}
      <div className="px-2 py-1 flex items-center justify-between gap-1 relative">
        {/* Reaction Picker Popover on Hover */}
        {showReactionPicker && (
          <div
            onMouseLeave={() => setShowReactionPicker(false)}
            className="absolute bottom-12 left-2 z-30 flex items-center gap-1.5 p-1.5 bg-white border-2 border-black shadow-neo rounded-full animate-in fade-in zoom-in-90 duration-150"
          >
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                onClick={() => handleSelectReaction(r.type)}
                className="w-9 h-9 rounded-full hover:scale-125 transition-transform flex items-center justify-center text-xl hover:bg-zinc-100"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={handleQuickLike}
          onMouseEnter={() => setShowReactionPicker(true)}
          className={`flex-1 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all select-none ${
            activeReactionObj
              ? `${activeReactionObj.color} bg-zinc-100 border border-black shadow-neo-sm`
              : 'text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          {activeReactionObj ? (
            <>
              <span className="text-base">{activeReactionObj.emoji}</span>
              <span>{activeReactionObj.label}</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4" />
              <span>Thích</span>
            </>
          )}
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex-1 py-2 rounded-lg font-black text-xs text-zinc-700 hover:bg-zinc-100 flex items-center justify-center gap-1.5 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Bình luận</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => onSharePost && onSharePost(post)}
          className="flex-1 py-2 rounded-lg font-black text-xs text-zinc-700 hover:bg-zinc-100 flex items-center justify-center gap-1.5 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* Interactive Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-200 bg-zinc-50 space-y-3">
          {/* Write Comment Box */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-black overflow-hidden bg-neo-yellow shrink-0">
              <img src="/avatar.png" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Viết bình luận công khai..."
                className="w-full border-2 border-black rounded-full px-4 py-1.5 text-xs font-medium focus:bg-white outline-none pr-10 shadow-neo-sm"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-black hover:text-blue-600 disabled:opacity-30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {comments.map((cmt) => (
              <div key={cmt.id} className="flex items-start gap-2 text-xs">
                <div className="w-7 h-7 rounded-full border border-black overflow-hidden bg-zinc-200 shrink-0 mt-0.5">
                  <img src={cmt.avatar} alt={cmt.author} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="bg-white border border-black rounded-2xl px-3 py-2 shadow-neo-sm inline-block max-w-[95%]">
                    <div className="flex items-center gap-1">
                      <span className="font-black text-black font-kiru">{cmt.author}</span>
                      {cmt.isVerified && (
                        <CheckCircle2 className="w-3 h-3 text-blue-600 fill-blue-100" />
                      )}
                    </div>
                    <p className="text-zinc-800 font-medium mt-0.5">{cmt.content}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono ml-2 mt-1">
                    <button className="font-bold hover:underline">Thích</button>
                    <button className="font-bold hover:underline">Phản hồi</button>
                    <span>{cmt.time}</span>
                    {cmt.likes > 0 && <span>👍 {cmt.likes}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
