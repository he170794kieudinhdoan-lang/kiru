'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  Send,
  ZoomIn,
  ZoomOut,
  Maximize,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MaiHoaMediaItem, FacebookPost, FacebookComment } from '@/types/maihoa';

interface FacebookMediaModalProps {
  media: MaiHoaMediaItem | null;
  post?: FacebookPost | null;
  allMedia: MaiHoaMediaItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: MaiHoaMediaItem) => void;
}

export const FacebookMediaModal: React.FC<FacebookMediaModalProps> = ({
  media,
  post,
  allMedia,
  isOpen,
  onClose,
  onSelectMedia,
}) => {
  const [zoom, setZoom] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [comments, setComments] = useState<FacebookComment[]>(post?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.reactions.total || 4250);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setZoom(1);
    if (post?.comments) {
      setComments(post.comments);
    }
  }, [media, post]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !media) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, media, allMedia]);

  if (!isOpen || !media) return null;

  const currentIndex = allMedia.findIndex((m) => m.id === media.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allMedia.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      onSelectMedia(allMedia[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSelectMedia(allMedia[currentIndex + 1]);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const cmt: FacebookComment = {
      id: `c_modal_${Date.now()}`,
      author: 'Bạn (Người xem)',
      avatar: '/avatar.png',
      content: newComment.trim(),
      time: 'Vừa xong',
      likes: 0,
    };
    setComments((prev) => [cmt, ...prev]);
    setNewComment('');
  };

  const handleToggleLike = () => {
    setIsLiked((prev) => {
      if (!prev) {
        setLikesCount((c) => c + 1);
        return true;
      } else {
        setLikesCount((c) => Math.max(0, c - 1));
        return false;
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Close Bar */}
      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        <a
          href={media.url}
          download={media.filename}
          className="p-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/30 hover:border-black transition-all shadow-neo-sm"
          title="Tải về tệp gốc"
        >
          <Download className="w-4 h-4" />
        </a>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-neo-pink text-white border-2 border-black hover:scale-105 transition-all shadow-neo-sm"
          title="Đóng (Esc)"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Theatre Content (2 Columns on Desktop) */}
      <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Media Viewport */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden select-none">
          {/* Navigation Arrows */}
          {hasPrev && (
            <button
              onClick={handlePrev}
              className="absolute left-3 z-30 p-3 rounded-full bg-black/60 hover:bg-neo-yellow text-white hover:text-black border-2 border-black transition-all shadow-neo"
              title="Ảnh/Clip trước (Mũi tên trái)"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={handleNext}
              className="absolute right-3 z-30 p-3 rounded-full bg-black/60 hover:bg-neo-yellow text-white hover:text-black border-2 border-black transition-all shadow-neo"
              title="Ảnh/Clip tiếp theo (Mũi tên phải)"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>
          )}

          {/* Media Element */}
          {media.isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-6">
              <video
                ref={videoRef}
                src={media.url}
                controls
                autoPlay
                playsInline
                muted={isMuted}
                className="max-h-[88vh] max-w-full object-contain rounded-lg border-2 border-zinc-800 shadow-2xl"
              />
            </div>
          ) : (
            <div
              className="relative w-full h-full flex items-center justify-center p-2 sm:p-6 overflow-auto cursor-zoom-in"
              onClick={() => setZoom((z) => (z === 1 ? 1.8 : 1))}
            >
              <img
                src={media.url}
                alt={media.filename}
                style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease' }}
                className="max-h-[88vh] max-w-full object-contain select-none"
              />
            </div>
          )}

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2 font-mono text-xs text-zinc-400 bg-black/60 px-3 py-1.5 rounded-full border border-zinc-700">
            <span>{currentIndex + 1} / {allMedia.length}</span>
            <span>•</span>
            <span className="truncate max-w-[200px]">{media.filename}</span>
          </div>
        </div>

        {/* Right: Facebook Post Details & Comments Panel */}
        <div className="w-full lg:w-[420px] bg-white border-t-2 lg:border-t-0 lg:border-l-4 border-black flex flex-col justify-between max-h-[45vh] lg:max-h-full overflow-hidden shrink-0">
          {/* Panel Header */}
          <div className="p-4 border-b-2 border-black space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-neo-pink shrink-0 shadow-neo-sm">
                <img
                  src={post?.author.avatar || '/avatar.png'}
                  alt="Mai Hoa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-black font-kiru">
                    {post?.author.name || 'Mai Hoa'}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-100" />
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {post?.createdAt || 'Vừa xong'} • 🌐 Công khai
                </p>
              </div>
            </div>

            {/* Caption */}
            <p className="text-xs sm:text-sm font-medium text-black whitespace-pre-line leading-relaxed">
              {post?.caption || `Bé Hoa tự quay nè 😳`}
            </p>
          </div>

          {/* Likes & Actions Bar */}
          <div className="px-4 py-2 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-black flex items-center gap-1">
              ❤️ 👍 {likesCount.toLocaleString()}
            </span>
            <span className="text-zinc-600">{comments.length} bình luận</span>
          </div>

          <div className="px-3 py-2 border-b-2 border-black flex items-center justify-between gap-2">
            <button
              onClick={handleToggleLike}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                isLiked
                  ? 'bg-red-500 text-white shadow-neo-sm border border-black'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-black'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Đã thích' : 'Thích'}</span>
            </button>
            <button className="flex-1 py-1.5 rounded-lg text-xs font-black bg-zinc-100 hover:bg-zinc-200 text-black flex items-center justify-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ</span>
            </button>
          </div>

          {/* Comments Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 ? (
              <p className="text-center text-xs text-zinc-500 font-mono py-6">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </p>
            ) : (
              comments.map((cmt) => (
                <div key={cmt.id} className="flex items-start gap-2 text-xs">
                  <div className="w-7 h-7 rounded-full border border-black overflow-hidden bg-zinc-200 shrink-0 mt-0.5">
                    <img src={cmt.avatar} alt={cmt.author} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-zinc-100 border border-black rounded-2xl px-3 py-2 shadow-neo-sm inline-block max-w-[95%]">
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
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input Footer */}
          <div className="p-3 border-t-2 border-black bg-white">
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận công khai..."
                className="flex-1 border-2 border-black rounded-full px-4 py-1.5 text-xs font-medium focus:bg-yellow-50 outline-none shadow-neo-sm"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="neo-btn bg-neo-yellow text-black px-3 py-1.5 text-xs font-black shadow-neo-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
