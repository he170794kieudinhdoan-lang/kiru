'use client';

import React from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Heart,
  Calendar,
  Sparkles,
  Camera,
  Music,
  Share2,
} from 'lucide-react';
import { MaiHoaProfileData } from '@/types/maihoa';

interface FacebookAboutTabProps {
  profile: MaiHoaProfileData;
}

export const FacebookAboutTab: React.FC<FacebookAboutTabProps> = ({ profile }) => {
  return (
    <div className="neo-box p-6 bg-white space-y-6">
      <div className="border-b-2 border-black pb-3">
        <h2 className="text-xl font-black font-kiru text-black flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" /> Giới thiệu về {profile.name}
        </h2>
        <p className="text-xs font-mono text-zinc-500">
          Thông tin tổng quan, học vấn, sở thích & liên hệ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: General & Contact Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-black font-kiru text-black border-b border-zinc-200 pb-2">
            📌 Thông tin chung
          </h3>

          <ul className="space-y-3 text-xs font-medium">
            <li className="flex items-start gap-3">
              <Briefcase className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-black">Công việc: </span>
                <span className="text-zinc-700">{profile.work}</span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <GraduationCap className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-black">Học vấn: </span>
                <span className="text-zinc-700">{profile.education}</span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-black">Nơi sống: </span>
                <span className="text-zinc-700">{profile.location}</span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Heart className="w-4 h-4 text-neo-pink shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-black">Tình trạng quan hệ: </span>
                <span className="text-zinc-700">{profile.relationship}</span>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-black">Tham gia từ: </span>
                <span className="text-zinc-700">{profile.joinedDate}</span>
              </div>
            </li>
          </ul>

          <h3 className="text-sm font-black font-kiru text-black border-b border-zinc-200 pb-2 pt-2">
            🔗 Mạng xã hội & Kênh liên hệ
          </h3>

          <div className="flex flex-wrap gap-2">
            <span className="neo-badge bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center gap-1.5 cursor-pointer shadow-neo-sm">
              <Camera className="w-3.5 h-3.5" /> Instagram: @maihoa.2k8
            </span>
            <span className="neo-badge bg-black text-white flex items-center gap-1.5 cursor-pointer shadow-neo-sm">
              <Music className="w-3.5 h-3.5" /> TikTok: @maihoa_official
            </span>
          </div>
        </div>

        {/* Right Column: Hobbies, Bio & Highlights */}
        <div className="space-y-4">
          <h3 className="text-sm font-black font-kiru text-black border-b border-zinc-200 pb-2">
            ✨ Tiểu sử & Châm ngôn sống
          </h3>

          <div className="p-4 bg-zinc-50 border-2 border-black rounded-xl space-y-2 shadow-neo-sm">
            <p className="text-xs font-semibold text-black italic leading-relaxed">
              "{profile.bio}"
            </p>
            <p className="text-[11px] font-mono text-zinc-500">
              — Mai Hoa (2k8 Gen Z)
            </p>
          </div>

          <h3 className="text-sm font-black font-kiru text-black border-b border-zinc-200 pb-2 pt-2">
            🎨 Sở thích & Phong cách
          </h3>

          <div className="flex flex-wrap gap-2">
            {profile.hobbies.map((h) => (
              <span
                key={h}
                className="neo-badge bg-neo-yellow text-black text-xs font-bold shadow-neo-sm"
              >
                {h}
              </span>
            ))}
          </div>

          <h3 className="text-sm font-black font-kiru text-black border-b border-zinc-200 pb-2 pt-2">
            📊 Thống kê trang cá nhân
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-zinc-100 border-2 border-black rounded-lg">
              <div className="text-lg font-black font-kiru text-black">
                {profile.followersCount.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-zinc-600">Người theo dõi</div>
            </div>
            <div className="p-2.5 bg-zinc-100 border-2 border-black rounded-lg">
              <div className="text-lg font-black font-kiru text-black">
                {profile.photoCount}
              </div>
              <div className="text-[10px] font-mono text-zinc-600">Hình ảnh</div>
            </div>
            <div className="p-2.5 bg-zinc-100 border-2 border-black rounded-lg">
              <div className="text-lg font-black font-kiru text-black">
                {profile.videoCount}
              </div>
              <div className="text-[10px] font-mono text-zinc-600">Video Clips</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
