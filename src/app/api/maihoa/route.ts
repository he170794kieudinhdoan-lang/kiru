import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MaiHoaMediaItem, FacebookPost, FacebookStory, MaiHoaProfileData } from '@/types/maihoa';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SUPABASE_BASE_URL = 'https://rtumniwnckicetqyqpvn.supabase.co/storage/v1/object/public/vault-media';

function getMediaList(): MaiHoaMediaItem[] {
  const catalogPath = path.join(process.cwd(), 'media', 'mai_hoa_catalog.json');
  if (fs.existsSync(catalogPath)) {
    try {
      const data = fs.readFileSync(catalogPath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading catalog:', e);
    }
  }

  const mediaDir = path.join(process.cwd(), 'media', 'mai_hoa');
  if (!fs.existsSync(mediaDir)) return [];

  const files = fs.readdirSync(mediaDir);
  return files.map((f, idx) => {
    const ext = path.extname(f).toLowerCase();
    const isVideo = ['.mp4', '.mov', '.webm', '.avi'].includes(ext);
    const baseName = path.parse(f).name;
    return {
      id: `mh_${idx + 1}`,
      filename: f,
      isVideo,
      ext: ext.replace('.', ''),
      size: 0,
      width: 1080,
      height: 1920,
      duration: isVideo ? 20 : 0,
      url: `/api/maihoa/media?file=${encodeURIComponent(f)}`,
      thumbUrl: `/api/maihoa/media?file=${encodeURIComponent(f)}&thumb=true`,
      supabaseUrl: `${SUPABASE_BASE_URL}/mai_hoa/originals/${encodeURI(f)}`,
      supabaseThumbUrl: `${SUPABASE_BASE_URL}/mai_hoa/thumbs/${encodeURI(baseName)}.webp`,
    };
  });
}

export async function GET() {
  try {
    const mediaList = getMediaList();
    const images = mediaList.filter((m) => !m.isVideo);
    const videos = mediaList.filter((m) => m.isVideo);

    const avatar = '/api/maihoa/media?file=t7gchWqX.jpg';
    const coverImage = '/api/maihoa/media?file=1896150_1000019343.webp';

    const author = {
      name: 'Mai Hoa',
      handle: '@maihoa.2k8',
      avatar,
      isVerified: true,
    };

    const pick = (...needles: string[]): MaiHoaMediaItem[] => {
      const out: MaiHoaMediaItem[] = [];
      const seen = new Set<string>();
      for (const needle of needles) {
        for (const item of mediaList) {
          if (item.filename.includes(needle) && !seen.has(item.id)) {
            seen.add(item.id);
            out.push(item);
          }
        }
      }
      return out;
    };

    const storyMedia = pick(
      '1897288_BH1pzft',
      '1897286_',
      '1897285_',
      '1897290_',
      'GJn2VKfB',
      '1897502_'
    );
    const storyTimes = ['15p trước', '1h trước', '3h trước', '6h trước', '9h trước', 'Hôm qua'];
    const stories: FacebookStory[] = storyMedia.slice(0, 6).map((item, idx) => ({
      id: `story_${idx + 1}`,
      author: 'Mai Hoa',
      avatar,
      mediaUrl: item.url,
      thumbUrl: item.thumbUrl,
      isVideo: item.isVideo,
      time: storyTimes[idx] || `${idx + 1}h trước`,
      viewed: idx > 2,
    }));

    const posts: FacebookPost[] = [
      {
        id: 'post_1_nudes',
        author,
        createdAt: 'Vừa xong',
        timestamp: Date.now(),
        caption:
          'Nãy thay đồ tự nhiên muốn chụp...\n\nTấm kéo áo be lên, tấm đứng toilet cởi hết, tấm thì selfie vòng 1 trong wc 😳\nChuỗi vàng vẫn đeo, đồ thì... hết rồi. Ai xem xong đừng save nha.',
        feeling: '😳 đang ngại',
        location: 'Nhà tắm phòng trọ',
        privacy: 'public',
        media: pick('GJn2VKfB', 'OWbBi8Ky', 'hOfvZT19'),
        reactions: { like: 8120, love: 6400, care: 480, haha: 210, wow: 890, sad: 0, angry: 0, total: 16100 },
        commentsCount: 720,
        sharesCount: 310,
        comments: [
          { id: 'c1', author: 'Minh Hoàng', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', content: 'Tấm đứng toilet căng vl em ơi 🔥', time: '10 phút trước', likes: 86 },
          { id: 'c2', author: 'Mai Hoa', avatar, content: 'hihi em ngại quá 🥺 anh xem thôi đừng lưu nha', time: '8 phút trước', likes: 54, isVerified: true },
          { id: 'c3', author: 'Bảo Trâm', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80', content: 'Body này đăng lên là biết hôm nay dám rồi 😭', time: '5 phút trước', likes: 41 },
        ],
        tags: ['#maihoa', '#phongtro', '#nongqua'],
        pinned: true,
      },
      {
        id: 'post_2_face',
        author,
        createdAt: '3 giờ trước',
        timestamp: Date.now() - 3 * 3600 * 1000,
        caption:
          'Lần này không che mặt nữa.\n\nKính vẫn đeo vì cận, tay thì che được một phần thôi 🥺\nCười với cam chứ tim đập muốn ra ngoài.',
        feeling: '🥺 đang hồi hộp',
        location: 'Phòng trọ Hà Nội',
        privacy: 'public',
        media: pick('1897288_BH1pzft'),
        reactions: { like: 9680, love: 7200, care: 610, haha: 140, wow: 1120, sad: 0, angry: 0, total: 18750 },
        commentsCount: 890,
        sharesCount: 420,
        comments: [
          { id: 'c4', author: 'Đức Anh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', content: 'Đeo kính nude là hết nước chấm 🔥 mặt xinh body xịn', time: '2 giờ trước', likes: 97 },
          { id: 'c5', author: 'Mai Hoa', avatar, content: 'em dám lắm rồi đó, đừng đòi thêm nữa nha 😭', time: '1 giờ trước', likes: 63, isVerified: true },
        ],
        tags: ['#khongchemat', '#kinhcan', '#damnhat'],
      },
      {
        id: 'post_3_shower',
        author,
        createdAt: '6 giờ trước',
        timestamp: Date.now() - 6 * 3600 * 1000,
        caption:
          'Tắm nước ấm xong tự nhiên nứng quá...\n\nĐứng xoa mãi không thôi được, người còn ướt, chuỗi vẫn đeo 😭💦\nClip hơi dài, ai kiên nhẫn thì xem hết nha.',
        feeling: '🔥 đang nóng',
        location: 'Nhà tắm',
        privacy: 'public',
        media: pick('1897285_'),
        reactions: { like: 7450, love: 5800, care: 390, haha: 95, wow: 760, sad: 0, angry: 0, total: 14495 },
        commentsCount: 610,
        sharesCount: 280,
        comments: [
          { id: 'c6', author: 'Khánh Linh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', content: 'Xoa vậy ai chịu nổi bé ơi 😩', time: '4 giờ trước', likes: 72 },
          { id: 'c7', author: 'Mai Hoa', avatar, content: 'tại nóng quá không chịu được mà 🥺', time: '3 giờ trước', likes: 48, isVerified: true },
        ],
        tags: ['#tamxong', '#nongqua', '#tuquay'],
      },
      {
        id: 'post_4_frog_bra',
        author,
        createdAt: 'Hôm qua lúc 21:40',
        timestamp: Date.now() - 22 * 3600 * 1000,
        caption:
          'Mũ ếch cute không? 🐸\n\nÁo ngực đen thì chật muốn tuột. Clip sau tuột một bên dây là suc hết ra, còn mỗi quần lót trắng với áo choàng 😩',
        feeling: '🐸 đang nghịch',
        location: 'Phòng của Hoa',
        privacy: 'public',
        media: pick('1897286_', '1897287_'),
        reactions: { like: 6890, love: 5100, care: 440, haha: 320, wow: 510, sad: 0, angry: 0, total: 13260 },
        commentsCount: 540,
        sharesCount: 190,
        comments: [
          { id: 'c8', author: 'Ngọc Hân', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', content: 'Mũ ếch với bra đen là combo lạ mà cuốn vl 😭', time: 'Hôm qua lúc 22:10', likes: 58 },
          { id: 'c9', author: 'Đức Trọng', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', content: 'Tuột dây một phát suc hết, dám thật 🔥', time: 'Hôm qua lúc 22:30', likes: 44 },
        ],
        tags: ['#muech', '#tuotday', '#phongtro'],
      },
      {
        id: 'post_5_greenshorts',
        author,
        createdAt: 'Hôm qua lúc 16:20',
        timestamp: Date.now() - 28 * 3600 * 1000,
        caption:
          'Phòng trọ tường hồng nóng vcl, cởi áo cho mát.\n\nQuần đùi xanh vẫn để, chứ cởi hết thì... thôi đăng thế này đã dám lắm rồi 🙈',
        feeling: '🥵 đang nóng bức',
        location: 'Phòng trọ tường hồng',
        privacy: 'public',
        media: pick('1897289_4QBtUL'),
        reactions: { like: 6320, love: 4700, care: 350, haha: 80, wow: 420, sad: 0, angry: 0, total: 11870 },
        commentsCount: 410,
        sharesCount: 150,
        comments: [
          { id: 'c10', author: 'Minh Thư', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', content: 'Topless quần đùi là hết bài, vòng 1 căng thật 🔥', time: 'Hôm qua lúc 17:00', likes: 39 },
        ],
        tags: ['#nongqua', '#coiao', '#phongtro'],
      },
      {
        id: 'post_6_liftshirt',
        author,
        createdAt: '18 tháng 8 lúc 22:15',
        timestamp: Date.now() - 46 * 3600 * 1000,
        caption:
          'Áo thun đen kéo lên một phát.\n\nMặt dán sticker, vòng 1 thì khỏi che. Quần kẻ vẫn mặc, nhìn như chưa làm gì ấy 🖤',
        feeling: '🖤 đang trêu',
        location: 'Phòng ngủ',
        privacy: 'public',
        media: pick('1897290_'),
        reactions: { like: 7040, love: 5300, care: 370, haha: 110, wow: 640, sad: 0, angry: 0, total: 13460 },
        commentsCount: 480,
        sharesCount: 200,
        comments: [
          { id: 'c11', author: 'Hưng Phạm', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80', content: 'Kéo áo lên là ra hết, sticker che mặt chứ che được gì 😭', time: '18 tháng 8', likes: 51 },
          { id: 'c12', author: 'Mai Hoa', avatar, content: 'che mặt cho đỡ ngại thôi, còn lại thì... thôi 🥺', time: '18 tháng 8', likes: 37, isVerified: true },
        ],
        tags: ['#keoao', '#sticker', '#quanke'],
      },
      {
        id: 'post_7_bed',
        author,
        createdAt: '17 tháng 8 lúc 23:40',
        timestamp: Date.now() - 68 * 3600 * 1000,
        caption:
          'Đêm khuya nằm không ngủ được.\n\nKéo áo xám lên, tay không biết để đâu thì để đây. Móng hồng mới sơn xong nữa 💅😩',
        feeling: '😩 đang nứng',
        location: 'Giường ngủ',
        privacy: 'public',
        media: pick('1897297_', '1897298_', '1897296_'),
        reactions: { like: 8560, love: 6900, care: 520, haha: 70, wow: 780, sad: 0, angry: 0, total: 16830 },
        commentsCount: 670,
        sharesCount: 260,
        comments: [
          { id: 'c13', author: 'Tuấn Anh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', content: 'Nằm xoa vậy clip đêm khuya xem là quên ngủ 🔥', time: '17 tháng 8', likes: 64 },
          { id: 'c14', author: 'Mai Hoa', avatar, content: 'em cũng quên ngủ luôn đó 😭', time: '17 tháng 8', likes: 42, isVerified: true },
        ],
        tags: ['#demkhuya', '#namgiuong', '#monghong'],
      },
      {
        id: 'post_8_afterbath',
        author,
        createdAt: '16 tháng 8 lúc 21:05',
        timestamp: Date.now() - 92 * 3600 * 1000,
        caption:
          'Tắm xong chưa kịp mặc gì.\n\nKhăn trắng che được mỗi cái bụng, người còn ướt bóng, clip 7s là cận nhất 💦\nChuỗi vẫn đeo nè.',
        feeling: '🛁 vừa tắm xong',
        location: 'Nhà tắm',
        privacy: 'public',
        media: pick('1897284_', '1897281_', '1897302_'),
        reactions: { like: 7780, love: 5900, care: 410, haha: 55, wow: 690, sad: 0, angry: 0, total: 14835 },
        commentsCount: 530,
        sharesCount: 210,
        comments: [
          { id: 'c15', author: 'Linh Đan', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', content: 'Khăn che được gì đâu, ướt bóng là hết sảy 💦', time: '16 tháng 8', likes: 47 },
        ],
        tags: ['#tamxong', '#uotbong', '#khantam'],
      },
      {
        id: 'post_9_closetup',
        author,
        createdAt: '15 tháng 8 lúc 23:20',
        timestamp: Date.now() - 116 * 3600 * 1000,
        caption:
          'Góc cận nằm ngửa, đèn tím.\n\nKhông cần nói nhiều. Nhìn là biết em đang làm gì 😳',
        feeling: '💜 đang ở chế độ im lặng',
        privacy: 'public',
        media: pick('1897294_', '1897295_'),
        reactions: { like: 7210, love: 5600, care: 300, haha: 40, wow: 820, sad: 0, angry: 0, total: 13970 },
        commentsCount: 490,
        sharesCount: 180,
        comments: [
          { id: 'c16', author: 'Hoàng Nam', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', content: 'Góc cận thế này khỏi diễn, căng thật 😩', time: '15 tháng 8', likes: 53 },
        ],
        tags: ['#goccan', '#dentim', '#dem'],
      },
      {
        id: 'post_10_tight',
        author,
        createdAt: '14 tháng 8 lúc 19:50',
        timestamp: Date.now() - 140 * 3600 * 1000,
        caption:
          'Áo này chật quá, hở hết vòng 1 ra luôn.\n\nCăng thật chứ không phải do góc máy 😫 clip hơi dài, ai thích thì xem chậm.',
        feeling: '😫 áo chật',
        privacy: 'public',
        media: pick('1897293_'),
        reactions: { like: 6540, love: 4900, care: 280, haha: 60, wow: 540, sad: 0, angry: 0, total: 12320 },
        commentsCount: 380,
        sharesCount: 140,
        comments: [
          { id: 'c17', author: 'Quốc Huy', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', content: 'Áo chật mà vòng 1 thế này là tội đồ 🔥', time: '14 tháng 8', likes: 36 },
        ],
        tags: ['#aochat', '#vocang', '#clipdai'],
      },
      {
        id: 'post_11_wc',
        author,
        createdAt: '13 tháng 8 lúc 22:10',
        timestamp: Date.now() - 164 * 3600 * 1000,
        caption:
          'Tắm xong ngồi lau, kính mờ hết vì hơi nước 👓\n\nNgồi toilet quay, góc này hơi bậy nhưng thôi... đăng luôn.',
        feeling: '👓 kính mờ',
        location: 'Toilet phòng trọ',
        privacy: 'public',
        media: pick('1897502_'),
        reactions: { like: 5980, love: 4300, care: 260, haha: 180, wow: 390, sad: 0, angry: 0, total: 11110 },
        commentsCount: 340,
        sharesCount: 120,
        comments: [
          { id: 'c18', author: 'Thanh Trúc', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', content: 'Kính mờ tóc ướt ngồi toilet là authentic vl 😭', time: '13 tháng 8', likes: 29 },
        ],
        tags: ['#toilet', '#kinhmo', '#tamxong'],
      },
      {
        id: 'post_12_wetclose',
        author,
        createdAt: '12 tháng 8 lúc 20:30',
        timestamp: Date.now() - 188 * 3600 * 1000,
        caption:
          'Cam thường quay cận 40 giây.\n\nNgười còn giọt nước, vòng 1 thì khỏi diễn. Ai bảo em không dám 😳',
        feeling: '💦 còn ướt',
        location: 'Nhà tắm',
        privacy: 'public',
        media: pick('1897283_'),
        reactions: { like: 6670, love: 5100, care: 310, haha: 45, wow: 580, sad: 0, angry: 0, total: 12705 },
        commentsCount: 400,
        sharesCount: 160,
        comments: [
          { id: 'c19', author: 'Phúc Lê', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80', content: 'Cận 40s ướt thế này xem xong phải thở 😩', time: '12 tháng 8', likes: 42 },
          { id: 'c20', author: 'Mai Hoa', avatar, content: 'cam thường mà nét vậy đó, không filter 🥺', time: '12 tháng 8', likes: 31, isVerified: true },
        ],
        tags: ['#camthuong', '#goccan', '#uot'],
      },
      {
        id: 'post_13_cafe',
        author,
        createdAt: '10 tháng 8 lúc 15:20',
        timestamp: Date.now() - 236 * 3600 * 1000,
        caption:
          'Hôm nay đi cafe, tóc tết lại cho gọn 👓🌸\n\nNhìn hiền vậy thôi nha, đừng tin mặt.',
        feeling: '🌸 đang hiền',
        location: 'Một quán cafe Hà Nội',
        privacy: 'public',
        media: pick('t7gchWqX', 'IMG_2676'),
        reactions: { like: 5240, love: 3800, care: 620, haha: 210, wow: 90, sad: 0, angry: 0, total: 9960 },
        commentsCount: 280,
        sharesCount: 70,
        comments: [
          { id: 'c21', author: 'Hương Giang', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', content: 'Nhìn hiền thế này ai ngờ trên kia đăng gì 😭', time: '10 tháng 8', likes: 88 },
          { id: 'c22', author: 'Mai Hoa', avatar, content: 'đó giờ em nói rồi, đừng tin mặt 😌', time: '10 tháng 8', likes: 61, isVerified: true },
        ],
        tags: ['#cafe', '#kinhcan', '#toctet'],
      },
    ];

    const profileData: MaiHoaProfileData = {
      name: 'Mai Hoa',
      badge: 'Bé Mai Hoa 2k8 ✨',
      nickname: 'Bé Hoa • Mai Hoa 🌸',
      handle: '@maihoa.2k8',
      avatar: avatar,
      coverImage: coverImage,
      bio: '✨ Bé Hoa 2k8 🌸 • Hay đăng lung tung, dám thì đăng 📸 • Phòng trọ Hà Nội, hay nóng 🔥',
      work: 'Hay quay clip trong phòng trọ 📸',
      education: 'Gen Z 2k8 • Hà Nội',
      location: 'Hà Nội, Việt Nam',
      hometown: 'Hà Nội',
      relationship: 'Độc thân 💖',
      joinedDate: 'Tháng 5 năm 2023',
      followersCount: 68520,
      friendsCount: 2480,
      followingCount: 196,
      hobbies: ['Chụp ảnh 📸', 'Tự quay 🎥', 'Tắm lâu 🛁', 'Nghe nhạc 🎧', 'Cafe ☕', 'Ở nhà 🏠'],
      featuredPhotos: pick('GJn2VKfB', 't7gchWqX', 'OWbBi8Ky', 'IMG_2676', 'hOfvZT19'),
      stories,
      posts,
      allMedia: mediaList,
      photoCount: images.length,
      videoCount: videos.length,
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error: any) {
    console.error('Error serving Mai Hoa profile data:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi tải profile Mai Hoa' },
      { status: 500 }
    );
  }
}
