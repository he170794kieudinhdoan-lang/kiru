import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  SweetheartItem,
  SweetheartProfileData,
  FacebookPost,
  FacebookStory,
  SweetheartCategory,
} from '@/types/sweetheart';
import { MaiHoaMediaItem } from '@/types/maihoa';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SUPABASE_BASE_URL = 'https://rtumniwnckicetqyqpvn.supabase.co/storage/v1/object/public/vault-media';

function getCatalog(): SweetheartItem[] {
  const catalogPath = path.join(process.cwd(), 'media', 'sweetheart_catalog.json');
  if (fs.existsSync(catalogPath)) {
    try {
      const data = fs.readFileSync(catalogPath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading sweetheart_catalog.json:', e);
    }
  }

  // Fallback scan if json does not exist
  const mediaDir = path.join(process.cwd(), 'media', 'sweetheart');
  if (!fs.existsSync(mediaDir)) return [];

  const results: SweetheartItem[] = [];
  const folders = fs.readdirSync(mediaDir);
  let idx = 1;

  for (const folder of folders) {
    const folderPath = path.join(mediaDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    const cleanTitle = folder.includes('_') ? folder.split('_').slice(1).join(' ') : folder;
    const files = fs.readdirSync(folderPath);

    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      const isVideo = ['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext);
      const isImg = ['.jpg', '.jpeg', '.png', '.webp', '.jfif'].includes(ext);
      if (!isVideo && !isImg) continue;

      const baseName = path.parse(f).name;
      const relPath = `${folder}/${f}`;
      const thumbRel = `${folder}/${baseName}.webp`;

      results.push({
        id: `sw_${idx++}`,
        name: f,
        filename: f,
        relPath,
        folder,
        folderTitle: cleanTitle,
        isVideo,
        ext: ext.replace('.', ''),
        size: 0,
        width: isVideo ? 720 : 1080,
        height: isVideo ? 1280 : 1920,
        duration: isVideo ? 15 : 0,
        url: `/api/sweetheart/media?file=${encodeURIComponent(relPath)}`,
        thumbUrl: `/api/sweetheart/media?file=${encodeURIComponent(relPath)}&thumb=true`,
        supabaseUrl: `${SUPABASE_BASE_URL}/sweetheart/originals/${encodeURI(relPath)}`,
        supabaseThumbUrl: `${SUPABASE_BASE_URL}/sweetheart/thumbs/${encodeURI(thumbRel)}`,
      });
    }
  }

  return results;
}

export async function GET() {
  try {
    const mediaList = getCatalog();
    const images = mediaList.filter((m) => !m.isVideo);
    const videos = mediaList.filter((m) => m.isVideo);

    const avatar = '/api/sweetheart/media?file=' + encodeURIComponent('07_Ren_Hong_Cardigan_Trang/tthaoisbaby_0011.webp');
    const coverImage = '/api/sweetheart/media?file=' + encodeURIComponent('10_Bikini_Trang_Vay_Hoa_Ban_Cong/1750612881841.webp');

    const author = {
      name: 'Thảo Baby',
      handle: '@tthaoisbaby',
      avatar,
      isVerified: true,
    };

    // Helper to find media items by exact relative path prefix or folder
    const getMediaByFolder = (folderName: string): MaiHoaMediaItem[] => {
      return mediaList.filter((m) => m.relPath.startsWith(folderName + '/') || m.folder === folderName);
    };

    const pickSpecific = (...relPaths: string[]): MaiHoaMediaItem[] => {
      const out: MaiHoaMediaItem[] = [];
      const seen = new Set<string>();
      for (const p of relPaths) {
        const found = mediaList.find((m) => m.relPath === p || m.relPath.includes(p));
        if (found && !seen.has(found.id)) {
          seen.add(found.id);
          out.push(found);
        }
      }
      return out;
    };

    // Calculate categories with counts
    const categoryFolders = Array.from(new Set(mediaList.map((m) => m.folder))).sort();
    const categories: SweetheartCategory[] = categoryFolders.map((f) => {
      const items = mediaList.filter((m) => m.folder === f);
      const title = f.includes('_') ? f.split('_').slice(1).join(' ') : f;
      return {
        name: title,
        folder: f,
        title,
        count: items.length,
        videoCount: items.filter((m) => m.isVideo).length,
        imageCount: items.filter((m) => !m.isVideo).length,
      };
    });

    // Stories (6-8 highlights)
    const storyMedia = [
      ...pickSpecific(
        '03_Cosplay_Bunny_Den/Thao on X- \'quà của ai ạ 😻 https---t.co-axIixjhwvP\' - X.webm',
        '06_Bodysuit_Xam_Co_Non/Thao on X- \'ib cho bé thảo đi 🥰 https---t.co-mqFguuVCEQ\' - X.webm',
        '10_Bikini_Trang_Vay_Hoa_Ban_Cong/Videos_3.webm',
        '01_Ao_Dai_Trang/Videos_7.webm',
        '15_Ao_2_Day_Trang_Cardigan_Den/Videos_10.webm',
        '40_Phong_Tam_Croptop_Trang/Thao (@tthaoisbaby) - X_2.webm',
        '07_Ren_Hong_Cardigan_Trang/24.webp',
        '34_Ao_Thun_Xanh_Da_Ngoai_Suoi/Videos_11.webm'
      ),
    ];

    const storyTimes = ['10p trước', '45p trước', '2h trước', '4h trước', '7h trước', 'Hôm qua lúc 21:00', 'Hôm qua', '2 ngày trước'];
    const stories: FacebookStory[] = storyMedia.map((item, idx) => ({
      id: `sw_story_${idx + 1}`,
      author: 'Thảo Baby',
      avatar,
      mediaUrl: item.url,
      thumbUrl: item.thumbUrl,
      isVideo: item.isVideo,
      time: storyTimes[idx] || `${idx + 1}h trước`,
      viewed: idx > 3,
    }));

    // Featured Photos (9 photos for sidebar grid)
    const featuredPhotos = pickSpecific(
      '03_Cosplay_Bunny_Den/1.webp',
      '01_Ao_Dai_Trang/6.webp',
      '07_Ren_Hong_Cardigan_Trang/28.webp',
      '10_Bikini_Trang_Vay_Hoa_Ban_Cong/1750612907373.webp',
      '29_Ao_Croptop_Xanh_Vay_Den/G530Z4aaoAABUUP.webp',
      '33_Ao_Quay_Hong_Vay_Trang_Cafe/GyrpB9ebEAADMbB.webp',
      '09_Bikini_Trang_Khoac_Reu/main3.webp',
      '28_Ao_Caro_Vay_Navy_Conan/d11ed279c4db46b7ae6fae6464a1fa6b~tplv-photomode-image.webp',
      '17_Ao_Be_Balo/IMG_20250722_152350_865.webp'
    );
    const posts: FacebookPost[] = [
      {
        id: 'post_03_Cosplay_Bunny_Den',
        author,
        createdAt: 'Vừa xong',
        timestamp: Date.now() - 0 * 1000,
        caption: "Quà của ai thì vào nhận nè 🐰🖤\n\nSet Bunny tai thỏ ren đen ôm sát body, mang vớ lưới quyến rũ. Clip 1 nháy mắt bắn tim, clip sau thì... kéo nhẹ vớ cho mng xem thôi nha 😻 Ai xem xong đừng lưu về máy tội bé 🙈",
        feeling: "🐰 đang cosplay bé thỏ",
        location: "Phòng ngủ ánh đèn tím",
        privacy: 'public',
        media: getMediaByFolder('03_Cosplay_Bunny_Den'),
        reactions: {"like": 14200, "love": 11800, "care": 920, "haha": 180, "wow": 1650, "sad": 0, "angry": 0, "total": 28750},
        commentsCount: 1240,
        sharesCount: 680,
        comments: [
          {
            id: 'c_0_0',
            author: "Hoàng Long",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
            content: "Set thỏ đen này xỉu up xỉu down luôn bé ơi 🔥 clip 2 nuốt chửng mắt luôn",
            time: "12 phút trước",
            likes: 142,
            isVerified: false,
          },
          {
            id: 'c_0_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "hihi em cảm ơn anh Long nha 🐰🖤 em ngại gần chết mà dám đăng á",
            time: "10 phút trước",
            likes: 98,
            isVerified: true,
          },
          {
            id: 'c_0_2',
            author: "Bảo Trâm",
            avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
            content: "Vòng eo con kiến mê chữ ê kéo dài luôn bà ơi 😭 mê cái vớ lưới ghê",
            time: "7 phút trước",
            likes: 65,
            isVerified: false,
          },
          {
            id: 'c_0_3',
            author: "Quốc Bảo",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            content: "Đẹp từ mặt tới dáng, thỏ này đem về nuôi tốn cà rốt mấy cũng chịu!",
            time: "4 phút trước",
            likes: 83,
            isVerified: false,
          },
          {
            id: 'c_0_4',
            author: "Thảo Baby",
            avatar: avatar,
            content: "nuôi bé là chỉ tốn trà sữa thui á hihi 🧋✨",
            time: "2 phút trước",
            likes: 56,
            isVerified: true,
          }
        ],
        tags: ["#CosplayBunny", "#ThaoBaby", "#TaiThoDen", "#HotReels"],
        category: '03_Cosplay_Bunny_Den',
        pinned: true,
      },
      {
        id: 'post_01_Ao_Dai_Trang',
        author,
        createdAt: '2 giờ trước',
        timestamp: Date.now() - 7200 * 1000,
        caption: "Áo dài trắng nữ sinh truyền thống 🌸\n\nNhìn hiền thục ngây thơ vậy thôi chứ clip cuối quay trong phòng ngủ nghịch lắm nha mng 🤍 Nữ sinh này không đi học mà đi quậy nè 🙈",
        feeling: "🌸 đang dịu dàng",
        location: "Sân trường & Phòng riêng",
        privacy: 'public',
        media: getMediaByFolder('01_Ao_Dai_Trang'),
        reactions: {"like": 11500, "love": 9200, "care": 740, "haha": 120, "wow": 890, "sad": 0, "angry": 0, "total": 22450},
        commentsCount: 890,
        sharesCount: 430,
        comments: [
          {
            id: 'c_1_0',
            author: "Đức Anh",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            content: "Áo dài ôm sát đường cong nhìn ngất ngây luôn em ơi 🤍",
            time: "1 giờ trước",
            likes: 95,
            isVerified: false,
          },
          {
            id: 'c_1_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "dạ em may áo dài chuẩn size luôn á anh 🥰",
            time: "45 phút trước",
            likes: 64,
            isVerified: true,
          },
          {
            id: 'c_1_2',
            author: "Khánh Linh",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            content: "Nữ sinh này cho ở lại lớp để ngắm mỗi ngày quá tr 😆",
            time: "30 phút trước",
            likes: 47,
            isVerified: false,
          }
        ],
        tags: ["#AoDaiTrang", "#NuSinh2k5", "#DiuDang"],
        category: '01_Ao_Dai_Trang',
        pinned: false,
      },
      {
        id: 'post_10_Bikini_Trang_Vay_Hoa_Ban_Cong',
        author,
        createdAt: '5 giờ trước',
        timestamp: Date.now() - 18000 * 1000,
        caption: "Chiều hoàng hôn đứng ban công tầng thượng hóng gió 🌅\n\nBikini trắng phối chân váy hoa nhí nhẹ nhàng bay bay... Gió thổi một phát suýt tuột váy làm tim muốn nhảy ra ngoài luôn 😩💦 Ai xem clip nhớ để lại 1 tym nha.",
        feeling: "🌅 đang ngắm hoàng hôn",
        location: "Ban công tầng thượng Landmark",
        privacy: 'public',
        media: getMediaByFolder('10_Bikini_Trang_Vay_Hoa_Ban_Cong'),
        reactions: {"like": 13800, "love": 10900, "care": 810, "haha": 95, "wow": 1420, "sad": 0, "angry": 0, "total": 27025},
        commentsCount: 1120,
        sharesCount: 540,
        comments: [
          {
            id: 'c_2_0',
            author: "Minh Triết",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
            content: "Góc quay ban công đỉnh chóp, váy hoa bay nhìn thơ mộng dã man 🔥",
            time: "4 giờ trước",
            likes: 112,
            isVerified: false,
          },
          {
            id: 'c_2_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "hôm đó gió to muốn bay luôn bé á anh 😭",
            time: "3 giờ trước",
            likes: 78,
            isVerified: true,
          },
          {
            id: 'c_2_2',
            author: "Phương Anh",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            content: "Tấm thứ 4 xuất sắc quá bà Thảo ơiii, body đỉnh thật sự",
            time: "2 giờ trước",
            likes: 53,
            isVerified: false,
          }
        ],
        tags: ["#BikiniBanCong", "#VayHoaNhi", "#HoangHon", "#Landmark"],
        category: '10_Bikini_Trang_Vay_Hoa_Ban_Cong',
        pinned: false,
      },
      {
        id: 'post_06_Bodysuit_Xam_Co_Non',
        author,
        createdAt: '8 giờ trước',
        timestamp: Date.now() - 28800 * 1000,
        caption: "Ib cho bé Thảo đi 🥰\n\nBodysuit xám có nón kéo khóa sâu, ở nhà một mình nằm lăn lộn trên giường quay 3 clip liền tay cho mng ngắm nè 🩶 Ai thích style năng động mà vẫn cuốn thì giơ tay 🙋‍♀️",
        feeling: "🥰 đang vòi vĩnh",
        location: "Phòng ngủ ấm áp",
        privacy: 'public',
        media: getMediaByFolder('06_Bodysuit_Xam_Co_Non'),
        reactions: {"like": 10200, "love": 8400, "care": 650, "haha": 210, "wow": 980, "sad": 0, "angry": 0, "total": 20440},
        commentsCount: 780,
        sharesCount: 390,
        comments: [
          {
            id: 'c_3_0',
            author: "Hải Đăng",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
            content: "Check inbox liền em ơi, xinh xỉu luôn á 🩶",
            time: "7 giờ trước",
            likes: 88,
            isVerified: false,
          },
          {
            id: 'c_3_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "nhiều ib quá em check hổng kịp nè hihi 🥺",
            time: "6 giờ trước",
            likes: 59,
            isVerified: true,
          }
        ],
        tags: ["#BodysuitXam", "#CoNon", "#ChillTaiNha"],
        category: '06_Bodysuit_Xam_Co_Non',
        pinned: false,
      },
      {
        id: 'post_40_Phong_Tam_Croptop_Trang',
        author,
        createdAt: 'Hôm qua lúc 23:15',
        timestamp: Date.now() - 82800 * 1000,
        caption: "Tắm xong chưa kịp sấy tóc 🚿💦\n\nCroptop trắng dính nước ướt sát rạt, 2 clip quay cận trong phòng tắm hơi nước mờ mờ ảo ảo... Đăng giờ này ai chưa ngủ thì vô xem nha 😳🔥",
        feeling: "🚿 vừa tắm xong",
        location: "Nhà tắm kính hiện đại",
        privacy: 'public',
        media: getMediaByFolder('40_Phong_Tam_Croptop_Trang'),
        reactions: {"like": 15600, "love": 12900, "care": 880, "haha": 90, "wow": 1820, "sad": 0, "angry": 0, "total": 31290},
        commentsCount: 1450,
        sharesCount: 720,
        comments: [
          {
            id: 'c_4_0',
            author: "Tuấn Kiệt",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            content: "Nước ướt áo thế này thì ngủ nghê gì nổi nữa trời 😩 cháy quá em ơi",
            time: "Hôm qua",
            likes: 167,
            isVerified: false,
          },
          {
            id: 'c_4_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "tại nóng quá tắm xong mát ghê á anh 🙈",
            time: "Hôm qua",
            likes: 115,
            isVerified: true,
          },
          {
            id: 'c_4_2',
            author: "Diệu Linh",
            avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
            content: "Tóc ướt mắt ướt quyến rũ chết người luôn Thảo ơi 😭❤️",
            time: "Hôm qua",
            likes: 74,
            isVerified: false,
          }
        ],
        tags: ["#NhaTam", "#CroptopUot", "#ClipDemKhuya", "#Hot"],
        category: '40_Phong_Tam_Croptop_Trang',
        pinned: false,
      },
      {
        id: 'post_07_Ren_Hong_Cardigan_Trang',
        author,
        createdAt: 'Hôm qua lúc 18:40',
        timestamp: Date.now() - 97200 * 1000,
        caption: "Set ren hồng pastel ngọt lịm tim kết hợp cardigan trắng mỏng 🌸\n\nTrọn bộ 9 tấm full góc từ trước ra sau, tấm số 8 là dám nhất từ trước đến giờ luôn 😳 Tone hồng nhẹ nhàng tôn da trắng bóc!",
        feeling: "🌸 đang ngọt ngào",
        location: "Góc phòng decor hồng",
        privacy: 'public',
        media: getMediaByFolder('07_Ren_Hong_Cardigan_Trang'),
        reactions: {"like": 12400, "love": 10100, "care": 920, "haha": 80, "wow": 1150, "sad": 0, "angry": 0, "total": 24650},
        commentsCount: 960,
        sharesCount: 480,
        comments: [
          {
            id: 'c_5_0',
            author: "Trọng Nhân",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
            content: "Màu hồng pastel hợp với bé Thảo nhất luôn, nhìn như kẹo ngọt 🍬",
            time: "Hôm qua",
            likes: 92,
            isVerified: false,
          },
          {
            id: 'c_5_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "em là tín đồ màu hồng mà hihi 💖🌸",
            time: "Hôm qua",
            likes: 68,
            isVerified: true,
          }
        ],
        tags: ["#RenHong", "#CardiganTrang", "#PastelCute"],
        category: '07_Ren_Hong_Cardigan_Trang',
        pinned: false,
      },
      {
        id: 'post_15_Ao_2_Day_Trang_Cardigan_Den',
        author,
        createdAt: 'Hôm qua lúc 14:20',
        timestamp: Date.now() - 115200 * 1000,
        caption: "Combo huyền thoại: Áo 2 dây trắng mix Cardigan len đen 🖤🤍\n\nBộ này quay liền 3 clip reels nhảy bắt trend giật giật siêu cuốn. Đố ai không bấm replay clip số 2 được đó!",
        feeling: "🎵 đang nhảy reels",
        location: "Phòng ngủ",
        privacy: 'public',
        media: getMediaByFolder('15_Ao_2_Day_Trang_Cardigan_Den'),
        reactions: {"like": 11200, "love": 8900, "care": 670, "haha": 140, "wow": 940, "sad": 0, "angry": 0, "total": 21850},
        commentsCount: 810,
        sharesCount: 360,
        comments: [
          {
            id: 'c_6_0',
            author: "Duy Anh",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            content: "Xem clip 2 xong replay 10 lần chưa chán 🔥 nhảy dẻo ghê",
            time: "Hôm qua",
            likes: 84,
            isVerified: false,
          },
          {
            id: 'c_6_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "em tập nhảy cả buổi chiều đó ạ 🥰",
            time: "Hôm qua",
            likes: 51,
            isVerified: true,
          }
        ],
        tags: ["#Ao2DayTrang", "#CardiganDen", "#ReelsHot"],
        category: '15_Ao_2_Day_Trang_Cardigan_Den',
        pinned: false,
      },
      {
        id: 'post_05_Sukumizu_Xanh_Navy',
        author,
        createdAt: '18 tháng 8 lúc 21:00',
        timestamp: Date.now() - 172800 * 1000,
        caption: "Sukumizu xanh navy - Đồ bơi học sinh Nhật Bản 🏊‍♀️💦\n\nChất vải bóng ôm sát từng đường cong, co giãn cực kỳ thoải mái. Clip quay cận cảnh trước gương phòng tập bơi, ai thích style anime bơi lội này không?",
        feeling: "🏊‍♀️ đang bơi lội",
        location: "Hồ bơi trong nhà",
        privacy: 'public',
        media: getMediaByFolder('05_Sukumizu_Xanh_Navy'),
        reactions: {"like": 13100, "love": 10400, "care": 750, "haha": 90, "wow": 1380, "sad": 0, "angry": 0, "total": 25720},
        commentsCount: 920,
        sharesCount: 490,
        comments: [
          {
            id: 'c_7_0',
            author: "Quang Minh",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
            content: "Sukumizu xanh navy tôn dáng số 1 luôn, body 10/10 🔥",
            time: "18 tháng 8",
            likes: 105,
            isVerified: false,
          },
          {
            id: 'c_7_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "bộ này order từ Nhật về mặc ưng ý dã man á anh 🥰",
            time: "18 tháng 8",
            likes: 73,
            isVerified: true,
          }
        ],
        tags: ["#Sukumizu", "#DoBoiHocSinh", "#AnimeVibe"],
        category: '05_Sukumizu_Xanh_Navy',
        pinned: false,
      },
      {
        id: 'post_38_Ao_Somi_Hoc_Sinh',
        author,
        createdAt: '18 tháng 8 lúc 16:30',
        timestamp: Date.now() - 190800 * 1000,
        caption: "Áo sơ mi học sinh cà vạt tinh khôi 👔🤍\n\n2 clip quay nghịch ngợm trong giảng đường vắng người... Cà vạt thắt hờ hững, cúc áo trên cùng thì quên cài rồi 🙈",
        feeling: "👔 đang nhớ thời học sinh",
        location: "Góc giảng đường đại học",
        privacy: 'public',
        media: getMediaByFolder('38_Ao_Somi_Hoc_Sinh'),
        reactions: {"like": 10800, "love": 8700, "care": 690, "haha": 110, "wow": 870, "sad": 0, "angry": 0, "total": 21170},
        commentsCount: 740,
        sharesCount: 310,
        comments: [
          {
            id: 'c_8_0',
            author: "Việt Hoàng",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
            content: "Nữ sinh lớp này chắc thầy cô không nỡ phạt bao giờ 😂",
            time: "18 tháng 8",
            likes: 77,
            isVerified: false,
          },
          {
            id: 'c_8_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "em ngoan lắm không bị phạt đâu nè hihi 😇",
            time: "18 tháng 8",
            likes: 49,
            isVerified: true,
          }
        ],
        tags: ["#SomiHocSinh", "#CaVat", "#NuSinhNgayTho"],
        category: '38_Ao_Somi_Hoc_Sinh',
        pinned: false,
      },
      {
        id: 'post_09_Bikini_Trang_Khoac_Reu',
        author,
        createdAt: '17 tháng 8 lúc 22:10',
        timestamp: Date.now() - 259200 * 1000,
        caption: "Bikini trắng tinh khôi mix áo khoác rêu phong cách dã ngoại 🌿💚\n\nClip 8s quay chậm cận cảnh eo thon 58cm và làn da trắng bóc dưới nắng hè. Ai mê phong cách khoẻ khoắn này không?",
        feeling: "🌿 đang thư giãn",
        location: "Resort ven biển",
        privacy: 'public',
        media: getMediaByFolder('09_Bikini_Trang_Khoac_Reu'),
        reactions: {"like": 11900, "love": 9600, "care": 710, "haha": 60, "wow": 1180, "sad": 0, "angry": 0, "total": 23450},
        commentsCount: 850,
        sharesCount: 410,
        comments: [
          {
            id: 'c_9_0',
            author: "Gia Huy",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            content: "Eo 58cm cực phẩm thật sự, mặc gì cũng đẹp 🌿",
            time: "17 tháng 8",
            likes: 89,
            isVerified: false,
          },
          {
            id: 'c_9_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "em ăn kiêng với tập gym dữ lắm á anh 🏋️‍♀️✨",
            time: "17 tháng 8",
            likes: 61,
            isVerified: true,
          }
        ],
        tags: ["#BikiniTrang", "#KhoacReu", "#ResortBeach"],
        category: '09_Bikini_Trang_Khoac_Reu',
        pinned: false,
      },
      {
        id: 'post_14_Ao_2_Day_Trang_Ban_Hoc',
        author,
        createdAt: '17 tháng 8 lúc 15:45',
        timestamp: Date.now() - 280800 * 1000,
        caption: "Ngồi bàn học ôn thi mà nóng nực quá 📚✏️\n\nÁo hai dây trắng mát mẻ, vừa làm bài tập vừa quay clip trêu cam. Có ai tình nguyện làm gia sư dạy kèm cho bé không nè? 🥰",
        feeling: "📚 đang chăm học",
        location: "Góc bàn học",
        privacy: 'public',
        media: getMediaByFolder('14_Ao_2_Day_Trang_Ban_Hoc'),
        reactions: {"like": 9800, "love": 7900, "care": 830, "haha": 240, "wow": 670, "sad": 0, "angry": 0, "total": 19440},
        commentsCount: 820,
        sharesCount: 290,
        comments: [
          {
            id: 'c_10_0',
            author: "Khang Duy",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
            content: "Gia sư miễn phí dạy cả ngày lẫn đêm luôn nè bé ơi 🙋‍♂️",
            time: "17 tháng 8",
            likes: 102,
            isVerified: false,
          },
          {
            id: 'c_10_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "dạy dở là em trừ điểm đó nha hihi 😜",
            time: "17 tháng 8",
            likes: 67,
            isVerified: true,
          }
        ],
        tags: ["#BanHoc", "#OnThi", "#Ao2DayTrang"],
        category: '14_Ao_2_Day_Trang_Ban_Hoc',
        pinned: false,
      },
      {
        id: 'post_34_Ao_Thun_Xanh_Da_Ngoai_Suoi',
        author,
        createdAt: '16 tháng 8 lúc 20:30',
        timestamp: Date.now() - 345600 * 1000,
        caption: "Dã ngoại bờ suối trong veo 🌿💦\n\nÁo thun xanh dính nước ướt đẫm bám sát người... 2 clip quay dưới ánh nắng vàng tự nhiên cực phẩm! Cảm giác đắm mình giữa thiên nhiên thích mê ly.",
        feeling: "💦 đang nghịch nước",
        location: "Khu dã ngoại Suối Mơ",
        privacy: 'public',
        media: getMediaByFolder('34_Ao_Thun_Xanh_Da_Ngoai_Suoi'),
        reactions: {"like": 12600, "love": 9900, "care": 720, "haha": 75, "wow": 1290, "sad": 0, "angry": 0, "total": 24585},
        commentsCount: 870,
        sharesCount: 420,
        comments: [
          {
            id: 'c_11_0',
            author: "Tiến Đạt",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
            content: "Nước suối trong mà em còn trong trẻo hơn 🌿 clip ướt át xuất sắc",
            time: "16 tháng 8",
            likes: 94,
            isVerified: false,
          },
          {
            id: 'c_11_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "nước lạnh ngắt luôn á mà quay vui lắm anh 💦",
            time: "16 tháng 8",
            likes: 62,
            isVerified: true,
          }
        ],
        tags: ["#BoSuoi", "#DaNgoai", "#UotNuoc", "#AoThunXanh"],
        category: '34_Ao_Thun_Xanh_Da_Ngoai_Suoi',
        pinned: false,
      },
      {
        id: 'post_08_Ao_Len_Xam_Bikini_Den',
        author,
        createdAt: '16 tháng 8 lúc 11:20',
        timestamp: Date.now() - 378000 * 1000,
        caption: "Nửa kín nửa hở: Áo len xám khoác hờ ngoài bikini ren đen 🖤\n\nBên ngoài phòng máy lạnh mát rượi mà người bé cứ hừng hực. 6 góc chụp khoe khéo vòng 1 đầy đặn và xương quai xanh cực nét!",
        feeling: "☕ đang sưởi ấm",
        location: "Phòng khách ấm cúng",
        privacy: 'public',
        media: getMediaByFolder('08_Ao_Len_Xam_Bikini_Den'),
        reactions: {"like": 10500, "love": 8300, "care": 580, "haha": 70, "wow": 890, "sad": 0, "angry": 0, "total": 20340},
        commentsCount: 680,
        sharesCount: 270,
        comments: [
          {
            id: 'c_12_0',
            author: "Hưng Thịnh",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            content: "Áo len khoác hờ kiểu này cuốn không chịu nổi 🔥",
            time: "16 tháng 8",
            likes: 78,
            isVerified: false,
          }
        ],
        tags: ["#AoLenXam", "#BikiniDen", "#XuongQuaiXanh"],
        category: '08_Ao_Len_Xam_Bikini_Den',
        pinned: false,
      },
      {
        id: 'post_21_Ao_Thun_Trang_Quan_Hong',
        author,
        createdAt: '15 tháng 8 lúc 22:00',
        timestamp: Date.now() - 432000 * 1000,
        caption: "Style baby doll: Áo thun trắng quần short hồng 🎀🌸\n\nClip nhảy nhót cute xỉu, chụp ảnh trước gương không góc chết luôn! Hôm nay hóa thân thành cô bé kẹo ngọt đáng yêu của cả nhà nha.",
        feeling: "🎀 đang nhún nhảy",
        location: "Phòng trọ decor hồng",
        privacy: 'public',
        media: getMediaByFolder('21_Ao_Thun_Trang_Quan_Hong'),
        reactions: {"like": 11300, "love": 9100, "care": 840, "haha": 150, "wow": 760, "sad": 0, "angry": 0, "total": 22150},
        commentsCount: 730,
        sharesCount: 320,
        comments: [
          {
            id: 'c_13_0',
            author: "Tuyết Mai",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
            content: "Nhìn bé cưng muốn bắt về nuôi ghê á Thảo ơi 🌸",
            time: "15 tháng 8",
            likes: 81,
            isVerified: false,
          },
          {
            id: 'c_13_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "hihi em ngoan lắm mau lớn nè chị Mai 💖",
            time: "15 tháng 8",
            likes: 55,
            isVerified: true,
          }
        ],
        tags: ["#BabyDoll", "#QuanShortHong", "#KeoNgot"],
        category: '21_Ao_Thun_Trang_Quan_Hong',
        pinned: false,
      },
      {
        id: 'post_39_Somi_Caro_Phong_Ngu',
        author,
        createdAt: '15 tháng 8 lúc 16:15',
        timestamp: Date.now() - 453600 * 1000,
        caption: "Mặc áo sơ mi caro rộng của người yêu trong phòng ngủ 🛌🖤\n\nClip chất lượng HD 720p sắc nét từng chuyển động lười biếng trên giường. Ai thích ngắm con gái mặc áo sơ mi oversize không?",
        feeling: "🛌 đang lười biếng",
        location: "Phòng ngủ ấm cúng",
        privacy: 'public',
        media: getMediaByFolder('39_Somi_Caro_Phong_Ngu'),
        reactions: {"like": 9900, "love": 7800, "care": 610, "haha": 80, "wow": 820, "sad": 0, "angry": 0, "total": 19210},
        commentsCount: 610,
        sharesCount: 240,
        comments: [
          {
            id: 'c_14_0',
            author: "Hoàng Quân",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
            content: "Style áo sơ mi oversize giấu quần này đỉnh nhất trần đời 🖤",
            time: "15 tháng 8",
            likes: 76,
            isVerified: false,
          }
        ],
        tags: ["#SomiCaro", "#Oversize", "#PhongNguLaze"],
        category: '39_Somi_Caro_Phong_Ngu',
        pinned: false,
      },
      {
        id: 'post_04_Cosplay_Thuy_Thu',
        author,
        createdAt: '14 tháng 8 lúc 21:40',
        timestamp: Date.now() - 518400 * 1000,
        caption: "Thủy thủ mặt trăng phiên bản biến hình hơi thiếu vải xíu 🌊⚓️\n\nVáy ngắn quá mỗi lần cúi xuống là tim muốn rớt ra ngoài. Clip quay cận cảnh chiếc nơ đỏ xinh xắn nè!",
        feeling: "⚓️ đang nhí nhảnh",
        location: "Phòng trọ",
        privacy: 'public',
        media: getMediaByFolder('04_Cosplay_Thuy_Thu'),
        reactions: {"like": 10600, "love": 8400, "care": 620, "haha": 190, "wow": 910, "sad": 0, "angry": 0, "total": 20720},
        commentsCount: 690,
        sharesCount: 310,
        comments: [
          {
            id: 'c_15_0',
            author: "Minh Hoàng",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            content: "Biến hình kiểu này thì kẻ thù cũng xin hàng đầu tiên 😆",
            time: "14 tháng 8",
            likes: 88,
            isVerified: false,
          },
          {
            id: 'c_15_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "nhân danh mặt trăng trừng trị mấy anh hư nha 🌙😜",
            time: "14 tháng 8",
            likes: 64,
            isVerified: true,
          }
        ],
        tags: ["#CosplayThuyThu", "#SailorMoon", "#VayNgan"],
        category: '04_Cosplay_Thuy_Thu',
        pinned: false,
      },
      {
        id: 'post_11_Noi_Y_Ren_Do',
        author,
        createdAt: '14 tháng 8 lúc 14:10',
        timestamp: Date.now() - 543600 * 1000,
        caption: "Tone đỏ rực rỡ quyến rũ cho buổi tối nồng nàn 👠💋\n\nAi bảo bé chỉ biết dễ thương? Thử phong cách quyến rũ này xem các anh có chịu nổi nhiệt không nha 🔥 3 tấm sắc nét từng chi tiết ren!",
        feeling: "👠 đang quyến rũ",
        location: "Phòng ngủ ánh đèn vàng",
        privacy: 'public',
        media: getMediaByFolder('11_Noi_Y_Ren_Do'),
        reactions: {"like": 11800, "love": 9400, "care": 590, "haha": 60, "wow": 1340, "sad": 0, "angry": 0, "total": 23190},
        commentsCount: 790,
        sharesCount: 380,
        comments: [
          {
            id: 'c_16_0',
            author: "Bảo Nam",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
            content: "Màu đỏ này bốc cháy luôn Thảo ơi, nhìn nghẹt thở thật sự 🔥",
            time: "14 tháng 8",
            likes: 97,
            isVerified: false,
          },
          {
            id: 'c_16_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "em cũng thấy màu này quyền lực ghê á hihi 💋",
            time: "14 tháng 8",
            likes: 58,
            isVerified: true,
          }
        ],
        tags: ["#RenDo", "#QuyenRu", "#NoiYRen"],
        category: '11_Noi_Y_Ren_Do',
        pinned: false,
      },
      {
        id: 'post_28_Ao_Caro_Vay_Navy_Conan',
        author,
        createdAt: '13 tháng 8 lúc 20:20',
        timestamp: Date.now() - 604800 * 1000,
        caption: "Outfit tiểu thư Conan: Áo caro vintage mix chân váy xếp ly navy 🕵️‍♀️💙\n\n4 tấm chụp kiểu tạp chí Nhật Bản siêu thơ mộng! Đi dạo hiệu sách phố cổ mang vibe cổ điển nhẹ nhàng.",
        feeling: "📖 đang mơ mộng",
        location: "Phố cổ & Quán sách",
        privacy: 'public',
        media: getMediaByFolder('28_Ao_Caro_Vay_Navy_Conan'),
        reactions: {"like": 9400, "love": 7500, "care": 680, "haha": 70, "wow": 620, "sad": 0, "angry": 0, "total": 18270},
        commentsCount: 540,
        sharesCount: 210,
        comments: [
          {
            id: 'c_17_0',
            author: "Thanh Hằng",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            content: "Gu ăn mặc của bà đỉnh thật sự, tấm nào cũng như bìa tạp chí 📸",
            time: "13 tháng 8",
            likes: 69,
            isVerified: false,
          }
        ],
        tags: ["#CaroVintage", "#ChanVayNavy", "#TieuThuConan"],
        category: '28_Ao_Caro_Vay_Navy_Conan',
        pinned: false,
      },
      {
        id: 'post_29_Ao_Croptop_Xanh_Vay_Den',
        author,
        createdAt: '13 tháng 8 lúc 15:00',
        timestamp: Date.now() - 622800 * 1000,
        caption: "Croptop xanh mint phối chân váy chữ A đen hack dáng chân dài miên man 💚🖤\n\nBộ ảnh 6 tấm trên sân thượng cafe rooftop đón trọn ánh nắng chiều lung linh!",
        feeling: "💚 đang tươi tắn",
        location: "Cafe Rooftop",
        privacy: 'public',
        media: getMediaByFolder('29_Ao_Croptop_Xanh_Vay_Den'),
        reactions: {"like": 10100, "love": 8100, "care": 640, "haha": 50, "wow": 780, "sad": 0, "angry": 0, "total": 19670},
        commentsCount: 620,
        sharesCount: 260,
        comments: [
          {
            id: 'c_18_0',
            author: "Trung Hiếu",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
            content: "Xanh mint tươi mát xua tan cái nóng mùa hè luôn 💚",
            time: "13 tháng 8",
            likes: 73,
            isVerified: false,
          }
        ],
        tags: ["#CroptopXanh", "#VayChuA", "#CafeRooftop"],
        category: '29_Ao_Croptop_Xanh_Vay_Den',
        pinned: false,
      },
      {
        id: 'post_30_Cosplay_Mei_Overwatch',
        author,
        createdAt: '12 tháng 8 lúc 21:30',
        timestamp: Date.now() - 691200 * 1000,
        caption: "Đóng băng trái tim chàng cùng Mei Overwatch ❄️👓\n\nKính cận tròn xoe, tóc búi hai bên và nụ cười siêu ngọt ngào. Wibu nào nhận diện ra tướng tủ của mình không nè?",
        feeling: "❄️ đang đóng băng",
        location: "Phòng game Esports",
        privacy: 'public',
        media: getMediaByFolder('30_Cosplay_Mei_Overwatch'),
        reactions: {"like": 11400, "love": 9200, "care": 710, "haha": 180, "wow": 990, "sad": 0, "angry": 0, "total": 22480},
        commentsCount: 770,
        sharesCount: 350,
        comments: [
          {
            id: 'c_19_0',
            author: "Quốc Huy",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            content: "Mei phiên bản này đóng băng cả triệu con tim rồi em ơii ❄️",
            time: "12 tháng 8",
            likes: 91,
            isVerified: false,
          },
          {
            id: 'c_19_1',
            author: "Thảo Baby",
            avatar: avatar,
            content: "đóng băng xong em rã đông lại cho nè hihi 💖",
            time: "12 tháng 8",
            likes: 63,
            isVerified: true,
          }
        ],
        tags: ["#CosplayMei", "#Overwatch", "#KinhCan"],
        category: '30_Cosplay_Mei_Overwatch',
        pinned: false,
      },
      {
        id: 'post_17_Ao_Be_Balo',
        author,
        createdAt: '12 tháng 8 lúc 16:00',
        timestamp: Date.now() - 712800 * 1000,
        caption: "Set áo thun be đeo balo dạo phố cuối tuần 🎒☕️\n\n8 góc chụp siêu tự nhiên ngoài trời, năng động mà vẫn cực kỳ đáng yêu. Cuối tuần có ai rủ bé đi dạo phố không?",
        feeling: "🎒 đang dạo phố",
        location: "Phố đi bộ & Quán cafe",
        privacy: 'public',
        media: getMediaByFolder('17_Ao_Be_Balo'),
        reactions: {"like": 9600, "love": 7600, "care": 650, "haha": 60, "wow": 590, "sad": 0, "angry": 0, "total": 18500},
        commentsCount: 530,
        sharesCount: 190,
        comments: [
          {
            id: 'c_20_0',
            author: "Hải Nam",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
            content: "Bé Thảo ngoài đời dễ thương x10 trên ảnh luôn á 😍",
            time: "12 tháng 8",
            likes: 75,
            isVerified: false,
          }
        ],
        tags: ["#AoThunBe", "#BaloDauPho", "#CuoiTuan"],
        category: '17_Ao_Be_Balo',
        pinned: false,
      },
      {
        id: 'post_37_Ao_Ong_Quay_Vang_Cafe',
        author,
        createdAt: '11 tháng 8 lúc 20:15',
        timestamp: Date.now() - 777600 * 1000,
        caption: "Áo ống quây vàng nổi bần bật giữa quán cafe đông đúc 💛\n\nQuay clip lén mà ai đi ngang cũng ngoái nhìn làm bé ngại muốn xỉu 🙈 Màu vàng chanh tôn da trắng sáng cực kỳ!",
        feeling: "💛 đang tỏa sáng",
        location: "Quán cafe Quận 1",
        privacy: 'public',
        media: getMediaByFolder('37_Ao_Ong_Quay_Vang_Cafe'),
        reactions: {"like": 10400, "love": 8300, "care": 610, "haha": 120, "wow": 830, "sad": 0, "angry": 0, "total": 20260},
        commentsCount: 660,
        sharesCount: 280,
        comments: [
          {
            id: 'c_21_0',
            author: "Minh Đức",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            content: "Nổi nhất quán luôn là cái chắc, xinh quá em ơi 💛",
            time: "11 tháng 8",
            likes: 82,
            isVerified: false,
          }
        ],
        tags: ["#AoQuayVang", "#CafeQ1", "#NoiBat"],
        category: '37_Ao_Ong_Quay_Vang_Cafe',
        pinned: false,
      },
      {
        id: 'post_02_Cosplay_Kimono_Kiem',
        author,
        createdAt: '11 tháng 8 lúc 14:00',
        timestamp: Date.now() - 799200 * 1000,
        caption: "Nữ kiếm sĩ Kimono hôm nay không đi chém gió mà đi đốn tim các anh nè ⚔️🎋\n\nĐố ai đỡ được một chiêu liếc mắt đưa tình của kiếm sĩ này? 3 tấm thần thái sắc lạnh mà vẫn ngọt ngào!",
        feeling: "⚔️ đang chiến",
        location: "Studio Nhật Bản",
        privacy: 'public',
        media: getMediaByFolder('02_Cosplay_Kimono_Kiem'),
        reactions: {"like": 11100, "love": 8800, "care": 580, "haha": 210, "wow": 960, "sad": 0, "angry": 0, "total": 21650},
        commentsCount: 710,
        sharesCount: 330,
        comments: [
          {
            id: 'c_22_0',
            author: "Thế Anh",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
            content: "Kiếm này đâm thẳng vào tim rồi đỡ sao nổi 😭❤️",
            time: "11 tháng 8",
            likes: 89,
            isVerified: false,
          }
        ],
        tags: ["#CosplayKimono", "#NuKiemSi", "#StudioNhat"],
        category: '02_Cosplay_Kimono_Kiem',
        pinned: false,
      },
      {
        id: 'post_36_Vay_Hoa_Nhi_Hong_Vang',
        author,
        createdAt: '10 tháng 8 lúc 19:30',
        timestamp: Date.now() - 864000 * 1000,
        caption: "Váy hoa nhí hồng vàng thướt tha như nàng thơ mùa hạ 🌼💛\n\nClip xoay vòng váy bay bổng giữa vườn cúc họa mi, nụ cười tỏa nắng đốn gục con tim ai đó chưa?",
        feeling: "🌼 đang tỏa nắng",
        location: "Vườn hoa cúc họa mi",
        privacy: 'public',
        media: getMediaByFolder('36_Vay_Hoa_Nhi_Hong_Vang'),
        reactions: {"like": 9800, "love": 7900, "care": 670, "haha": 50, "wow": 710, "sad": 0, "angry": 0, "total": 19130},
        commentsCount: 580,
        sharesCount: 230,
        comments: [
          {
            id: 'c_23_0',
            author: "Hương Giang",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
            content: "Nàng thơ của lòng em đây rồi, nụ cười tỏa nắng quá 🌼",
            time: "10 tháng 8",
            likes: 71,
            isVerified: false,
          }
        ],
        tags: ["#VayHoaNhi", "#NangTho", "#VuonHoa"],
        category: '36_Vay_Hoa_Nhi_Hong_Vang',
        pinned: false,
      },
      {
        id: 'post_33_Ao_Quay_Hong_Vay_Trang_Cafe',
        author,
        createdAt: '10 tháng 8 lúc 13:45',
        timestamp: Date.now() - 885600 * 1000,
        caption: "Hẹn hò cafe chiều nắng nhẹ cùng áo quây hồng phấn và chân váy trắng ☕️🌸\n\nNgồi chờ một người mà người đó chưa tới... Ai muốn ngồi đối diện uống cafe với bé không?",
        feeling: "🌸 đang chờ ai đó",
        location: "The Garden Cafe",
        privacy: 'public',
        media: getMediaByFolder('33_Ao_Quay_Hong_Vay_Trang_Cafe'),
        reactions: {"like": 10300, "love": 8200, "care": 650, "haha": 80, "wow": 790, "sad": 0, "angry": 0, "total": 20020},
        commentsCount: 640,
        sharesCount: 270,
        comments: [
          {
            id: 'c_24_0',
            author: "Quốc An",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
            content: "Anh phóng xe 5 phút tới liền nha em ơi ☕️🌸",
            time: "10 tháng 8",
            likes: 84,
            isVerified: false,
          }
        ],
        tags: ["#AoQuayHong", "#VayTrang", "#HenHoCafe"],
        category: '33_Ao_Quay_Hong_Vay_Trang_Cafe',
        pinned: false,
      },
      {
        id: 'post_16_Ao_3_Lo_Xam_Xet_Sau',
        author,
        createdAt: '9 tháng 8 lúc 21:00',
        timestamp: Date.now() - 950400 * 1000,
        caption: "Áo ba lỗ xám khoét sâu hờ hững 🩶\n\nỞ nhà một mình mặc thế này cho thoải mái chứ ra đường là bị tuýt còi liền 🙈 4 tấm góc chụp trước gương phòng ngủ.",
        feeling: "☁️ đang chill",
        location: "Phòng riêng",
        privacy: 'public',
        media: getMediaByFolder('16_Ao_3_Lo_Xam_Xet_Sau'),
        reactions: {"like": 10900, "love": 8700, "care": 560, "haha": 70, "wow": 920, "sad": 0, "angry": 0, "total": 21150},
        commentsCount: 670,
        sharesCount: 300,
        comments: [
          {
            id: 'c_25_0',
            author: "Văn Nam",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            content: "Khoét sâu thế này tim ai chịu nổi hả Thảo 😩",
            time: "9 tháng 8",
            likes: 79,
            isVerified: false,
          }
        ],
        tags: ["#AoBaLoXam", "#KhoetSau", "#ChillHome"],
        category: '16_Ao_3_Lo_Xam_Xet_Sau',
        pinned: false,
      },
      {
        id: 'post_24_Bikini_Xam_Evangelion',
        author,
        createdAt: '9 tháng 8 lúc 15:30',
        timestamp: Date.now() - 972000 * 1000,
        caption: "Cosplay Rei Ayanami phong cách Bikini xám Mecha 🤖💜\n\nVừa cá tính vừa gợi cảm chuẩn wibu chân chính! 3 tấm thần thái nhân vật anime cực ngầu.",
        feeling: "🤖 đang hóa thân nhân vật",
        location: "Studio Anime",
        privacy: 'public',
        media: getMediaByFolder('24_Bikini_Xam_Evangelion'),
        reactions: {"like": 11600, "love": 9300, "care": 620, "haha": 90, "wow": 1100, "sad": 0, "angry": 0, "total": 22710},
        commentsCount: 750,
        sharesCount: 360,
        comments: [
          {
            id: 'c_26_0',
            author: "Thành Long",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
            content: "Cosplay Rei đỉnh nhất VN luôn rồi, vừa ngầu vừa quyến rũ 🤖",
            time: "9 tháng 8",
            likes: 93,
            isVerified: false,
          }
        ],
        tags: ["#BikiniEvangelion", "#ReiAyanami", "#CosplayMecha"],
        category: '24_Bikini_Xam_Evangelion',
        pinned: false,
      },
      {
        id: 'post_12_Dam_Ong_Body_Xam',
        author,
        createdAt: '8 tháng 8 lúc 20:45',
        timestamp: Date.now() - 1036800 * 1000,
        caption: "Đầm ống body xám ôm sát từng đường cong 🩶\n\nĐơn giản mà tôn dáng cực kỳ, diện bộ này đi tiệc tối hay hẹn hò sang chảnh là chuẩn bài!",
        feeling: "✨ đang kiêu kỳ",
        location: "Sảnh tiệc sang trọng",
        privacy: 'public',
        media: getMediaByFolder('12_Dam_Ong_Body_Xam'),
        reactions: {"like": 9700, "love": 7700, "care": 540, "haha": 40, "wow": 710, "sad": 0, "angry": 0, "total": 18690},
        commentsCount: 520,
        sharesCount: 210,
        comments: [
          {
            id: 'c_27_0',
            author: "Khánh Vy",
            avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
            content: "Dáng đồng hồ cát mặc đầm ống ôm body này là hết nước chấm 🩶",
            time: "8 tháng 8",
            likes: 68,
            isVerified: false,
          }
        ],
        tags: ["#DamBodyXam", "#DamOng", "#SangChanh"],
        category: '12_Dam_Ong_Body_Xam',
        pinned: false,
      },
      {
        id: 'post_31_Ao_Dai_Tay_Trang_Quan_Xam',
        author,
        createdAt: '8 tháng 8 lúc 14:15',
        timestamp: Date.now() - 1058400 * 1000,
        caption: "Áo dài tay trắng ôm sát body mix quần thể thao xám 🤍\n\nKhoe trọn đường cong vòng eo con kiến 58cm trước gương phòng tập!",
        feeling: "✨ đang tự tin",
        location: "Phòng tập thể thao",
        privacy: 'public',
        media: getMediaByFolder('31_Ao_Dai_Tay_Trang_Quan_Xam'),
        reactions: {"like": 9300, "love": 7400, "care": 510, "haha": 50, "wow": 680, "sad": 0, "angry": 0, "total": 17940},
        commentsCount: 490,
        sharesCount: 180,
        comments: [
          {
            id: 'c_28_0',
            author: "Thanh Bình",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            content: "Đường cong chữ S không tì vết luôn Thảo ơi 🤍",
            time: "8 tháng 8",
            likes: 72,
            isVerified: false,
          }
        ],
        tags: ["#AoDaiTayTrang", "#QuanTheThao", "#Eo58"],
        category: '31_Ao_Dai_Tay_Trang_Quan_Xam',
        pinned: false,
      },
      {
        id: 'post_32_Bikini_Hong_Loang_Quan_Bar',
        author,
        createdAt: '7 tháng 8 lúc 22:30',
        timestamp: Date.now() - 1123200 * 1000,
        caption: "Bikini hồng loang tie-dye đi chill quán bar bên bãi biển 🍸💖\n\nNhạc xập xình và bé thì bốc lửa... 2 tấm chụp đèn neon lung linh huyền ảo!",
        feeling: "🍸 đang 'say' nắng",
        location: "Beach Bar Club",
        privacy: 'public',
        media: getMediaByFolder('32_Bikini_Hong_Loang_Quan_Bar'),
        reactions: {"like": 10500, "love": 8300, "care": 580, "haha": 80, "wow": 870, "sad": 0, "angry": 0, "total": 20330},
        commentsCount: 610,
        sharesCount: 260,
        comments: [
          {
            id: 'c_29_0',
            author: "Bảo Long",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
            content: "Quán bar nào may mắn có vị khách xinh đẹp thế này vậy trời 🍸",
            time: "7 tháng 8",
            likes: 85,
            isVerified: false,
          }
        ],
        tags: ["#BikiniHongLoang", "#BeachBar", "#NeonNight"],
        category: '32_Bikini_Hong_Loang_Quan_Bar',
        pinned: false,
      },
      {
        id: 'post_19_Khan_Len_Do',
        author,
        createdAt: '7 tháng 8 lúc 16:00',
        timestamp: Date.now() - 1144800 * 1000,
        caption: "Mùa đông ấm áp cùng khăn len đỏ và nụ cười của bé 🧣🎄\n\nClip tuyết rơi giả lập trong phòng ngủ cưng xỉu, gửi chút ấm áp tới cả nhà!",
        feeling: "🎄 đang đón giáng sinh",
        location: "Góc Noel trong phòng",
        privacy: 'public',
        media: getMediaByFolder('19_Khan_Len_Do'),
        reactions: {"like": 9500, "love": 7600, "care": 790, "haha": 60, "wow": 580, "sad": 0, "angry": 0, "total": 18530},
        commentsCount: 520,
        sharesCount: 200,
        comments: [
          {
            id: 'c_30_0',
            author: "Tú Anh",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
            content: "Nụ cười sưởi ấm cả mùa đông luôn bé Thảo ơi 🧣❤️",
            time: "7 tháng 8",
            likes: 74,
            isVerified: false,
          }
        ],
        tags: ["#KhanLenDo", "#NoelSom", "#AmAp"],
        category: '19_Khan_Len_Do',
        pinned: false,
      },
      {
        id: 'post_13_Quan_Yem_Den',
        author,
        createdAt: '6 tháng 8 lúc 20:00',
        timestamp: Date.now() - 1209600 * 1000,
        caption: "Hôm nay làm cô bé quần yếm tinh nghịch 🧸\n\nBên trong mặc áo ống hở lưng nha, nhìn đằng sau bất ngờ lắm đó 😜 2 tấm chụp trước gương siêu kute.",
        feeling: "🧸 đang nghịch ngợm",
        location: "Góc phòng chụp ảnh",
        privacy: 'public',
        media: getMediaByFolder('13_Quan_Yem_Den'),
        reactions: {"like": 9100, "love": 7200, "care": 580, "haha": 130, "wow": 520, "sad": 0, "angry": 0, "total": 17530},
        commentsCount: 470,
        sharesCount: 170,
        comments: [
          {
            id: 'c_31_0',
            author: "Nhật Nam",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            content: "Mặt trước cute mặt sau gợi cảm, bất ngờ thật sự 😆",
            time: "6 tháng 8",
            likes: 67,
            isVerified: false,
          }
        ],
        tags: ["#QuanYemDen", "#AoOngHoLung", "#NghichNgom"],
        category: '13_Quan_Yem_Den',
        pinned: false,
      },
      {
        id: 'post_23_Voan_Trang_Thien_Than',
        author,
        createdAt: '6 tháng 8 lúc 14:30',
        timestamp: Date.now() - 1231200 * 1000,
        caption: "Thiên thần lạc lối giữa trần gian 👼🤍\n\nÁo voan trắng mỏng tang bồng bềnh thuần khiết, có ai muốn rước thiên thần này về nuôi không nè?",
        feeling: "👼 đang bay bổng",
        location: "Thiên đường thu nhỏ",
        privacy: 'public',
        media: getMediaByFolder('23_Voan_Trang_Thien_Than'),
        reactions: {"like": 10800, "love": 8700, "care": 750, "haha": 40, "wow": 980, "sad": 0, "angry": 0, "total": 21270},
        commentsCount: 650,
        sharesCount: 290,
        comments: [
          {
            id: 'c_32_0',
            author: "Hoàng Khang",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
            content: "Thiên thần hạ phàm xinh đẹp tuyệt trần 👼🤍",
            time: "6 tháng 8",
            likes: 88,
            isVerified: false,
          }
        ],
        tags: ["#VoanTrang", "#ThienThan", "#ThuanKhiet"],
        category: '23_Voan_Trang_Thien_Than',
        pinned: false,
      },
      {
        id: 'post_22_Noi_Y_Ren_Trang_Xam',
        author,
        createdAt: '5 tháng 8 lúc 22:15',
        timestamp: Date.now() - 1296000 * 1000,
        caption: "Ren trắng pha xám mong manh thuần khiết 🤍\n\nMột chút nhẹ nhàng cho đêm tĩnh lặng, chúc cả nhà ngủ ngon và mơ về bé nha 🌙",
        feeling: "🌙 đang bình yên",
        location: "Phòng ngủ",
        privacy: 'public',
        media: getMediaByFolder('22_Noi_Y_Ren_Trang_Xam'),
        reactions: {"like": 9700, "love": 7800, "care": 610, "haha": 30, "wow": 760, "sad": 0, "angry": 0, "total": 18900},
        commentsCount: 510,
        sharesCount: 210,
        comments: [
          {
            id: 'c_33_0',
            author: "Đức Trọng",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            content: "Xem xong tấm này khỏi ngủ luôn rồi bé ơi 🤍",
            time: "5 tháng 8",
            likes: 79,
            isVerified: false,
          }
        ],
        tags: ["#RenTrangXam", "#MongManh", "#NguNgon"],
        category: '22_Noi_Y_Ren_Trang_Xam',
        pinned: false,
      },
      {
        id: 'post_18_Bodysuit_Pikachu_Vang',
        author,
        createdAt: '5 tháng 8 lúc 15:00',
        timestamp: Date.now() - 1317600 * 1000,
        caption: "Pika Pika! ⚡️💛\n\nBodysuit Pikachu vàng chói lọi, phóng điện 100.000 Vôn giật tê tái con tim ai đó nè ⚡️ Đáng yêu xỉu luôn đúng không?",
        feeling: "⚡ đang phóng điện",
        location: "Phòng ngủ",
        privacy: 'public',
        media: getMediaByFolder('18_Bodysuit_Pikachu_Vang'),
        reactions: {"like": 11200, "love": 8900, "care": 920, "haha": 340, "wow": 810, "sad": 0, "angry": 0, "total": 22170},
        commentsCount: 780,
        sharesCount: 350,
        comments: [
          {
            id: 'c_34_0',
            author: "Thanh Tùng",
            avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
            content: "Pikachu này phóng điện trúng tim anh rồi ⚡️💛 cưng xỉu",
            time: "5 tháng 8",
            likes: 95,
            isVerified: false,
          }
        ],
        tags: ["#Pikachu", "#BodysuitVang", "#PhongDien"],
        category: '18_Bodysuit_Pikachu_Vang',
        pinned: false,
      },
      {
        id: 'post_20_Do_The_Thao_Adidas',
        author,
        createdAt: '4 tháng 8 lúc 18:30',
        timestamp: Date.now() - 1382400 * 1000,
        caption: "Girl thể thao năng động 3 sọc khỏe khoắn ⚽️👟\n\nTập gym giữ dáng săn chắc để diện nhiều đồ đẹp cho mng ngắm nè!",
        feeling: "💪 đang tràn đầy năng lượng",
        location: "Phòng tập Gym",
        privacy: 'public',
        media: getMediaByFolder('20_Do_The_Thao_Adidas'),
        reactions: {"like": 8900, "love": 7100, "care": 540, "haha": 50, "wow": 560, "sad": 0, "angry": 0, "total": 17150},
        commentsCount: 440,
        sharesCount: 160,
        comments: [
          {
            id: 'c_35_0',
            author: "Huy Hoàng",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
            content: "Chăm tập gym bảo sao dáng nuột nà thế kia 💪",
            time: "4 tháng 8",
            likes: 64,
            isVerified: false,
          }
        ],
        tags: ["#DoTheThao", "#GymGirl", "#3Soc"],
        category: '20_Do_The_Thao_Adidas',
        pinned: false,
      },
      {
        id: 'post_27_Ao_Croptop_Be_An_My',
        author,
        createdAt: '4 tháng 8 lúc 12:45',
        timestamp: Date.now() - 1404000 * 1000,
        caption: "Đi ăn mỳ cay mà mặc croptop be hở rốn thế này người ta nhìn quá trời 🍜🔥\n\nMỳ cay cấp độ 1 thì bé cay cấp độ 10 nha mng!",
        feeling: "🍜 đang ăn ngon miệng",
        location: "Quán mỳ cay Hàn Quốc",
        privacy: 'public',
        media: getMediaByFolder('27_Ao_Croptop_Be_An_My'),
        reactions: {"like": 9200, "love": 7300, "care": 580, "haha": 190, "wow": 570, "sad": 0, "angry": 0, "total": 17840},
        commentsCount: 480,
        sharesCount: 180,
        comments: [
          {
            id: 'c_36_0',
            author: "Quang Huy",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
            content: "Nhìn bé cay hơn cả tô mỳ luôn á nha 🍜🔥",
            time: "4 tháng 8",
            likes: 73,
            isVerified: false,
          }
        ],
        tags: ["#CroptopBe", "#MyCay", "#AnTrua"],
        category: '27_Ao_Croptop_Be_An_My',
        pinned: false,
      },
      {
        id: 'post_26_Ao_Xanh_Shop_Do_Choi',
        author,
        createdAt: '3 tháng 8 lúc 16:20',
        timestamp: Date.now() - 1468800 * 1000,
        caption: "Lạc vào thế giới gấu bông khổng lồ 🧸💙\n\nÁo xanh baby tôn da trắng phát sáng giữa muôn vàn thú nhồi bông. Có ai mua tặng bé chú gấu bông to bự không?",
        feeling: "🧸 đang mua sắm",
        location: "Shop gấu bông Landmark",
        privacy: 'public',
        media: getMediaByFolder('26_Ao_Xanh_Shop_Do_Choi'),
        reactions: {"like": 9000, "love": 7200, "care": 670, "haha": 70, "wow": 510, "sad": 0, "angry": 0, "total": 17450},
        commentsCount: 450,
        sharesCount: 160,
        comments: [
          {
            id: 'c_37_0',
            author: "Hữu Phước",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
            content: "Mua tặng bé cả shop gấu bông luôn cũng được 🧸💙",
            time: "3 tháng 8",
            likes: 76,
            isVerified: false,
          }
        ],
        tags: ["#AoXanhBaby", "#ShopGauBong", "#MuaSam"],
        category: '26_Ao_Xanh_Shop_Do_Choi',
        pinned: false,
      },
      {
        id: 'post_35_Ao_Doan_Thanh_Nien',
        author,
        createdAt: '2 tháng 8 lúc 09:30',
        timestamp: Date.now() - 1555200 * 1000,
        caption: "Nữ sinh áo đoàn thanh niên tình nguyện 🇻🇳\n\nXinh xắn, nghiêm túc nhưng vẫn toát lên vẻ cuốn hút đặc biệt trong chiến dịch Mùa Hè Xanh!",
        feeling: "🇻🇳 đang tự hào",
        location: "Chiến dịch tình nguyện Mùa Hè Xanh",
        privacy: 'public',
        media: getMediaByFolder('35_Ao_Doan_Thanh_Nien'),
        reactions: {"like": 11500, "love": 9200, "care": 980, "haha": 50, "wow": 640, "sad": 0, "angry": 0, "total": 22370},
        commentsCount: 710,
        sharesCount: 380,
        comments: [
          {
            id: 'c_38_0',
            author: "Chí Thành",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            content: "Đoàn viên thanh niên gương mẫu xinh đẹp nhất năm 🇻🇳",
            time: "2 tháng 8",
            likes: 98,
            isVerified: false,
          }
        ],
        tags: ["#AoDoanThanhNien", "#MuaHeXanh", "#TinhNguyen"],
        category: '35_Ao_Doan_Thanh_Nien',
        pinned: false,
      },
    ];

    const profileData: SweetheartProfileData = {
      name: 'Thảo Baby',
      badge: 'Bé Thảo 2k5 ✨',
      nickname: 'Thảo Nguyễn • @tthaoisbaby 💖',
      handle: '@tthaoisbaby',
      avatar,
      coverImage,
      bio: '✨ Bé Thảo 2k5 🌸 • Cosplay, Outfits & Vlogs xinh xắn 💕 • Clip tự quay & album theo từng style 📸 • Xem vui vẻ nha đừng mang đi đâu tội bé 🥺',
      work: 'Content Creator & Cosplayer Tự Do 📸',
      education: 'Sinh viên Gen Z 2k5 • TP. Hồ Chí Minh',
      location: 'TP. Hồ Chí Minh, Việt Nam',
      hometown: 'Đà Lạt, Lâm Đồng',
      relationship: 'Đang tìm người nuông chiều 💖',
      joinedDate: 'Tháng 8 năm 2022',
      followersCount: 98450,
      friendsCount: 3820,
      followingCount: 245,
      hobbies: [
        'Cosplay 🎀',
        'Chụp ảnh Outfit 👗',
        'Quay clip Reels 🎥',
        'Trà sữa 🧋',
        'Anime & Game 🎮',
        'Đi biển 🏖️',
        'Cafe sống ảo ☕',
      ],
      featuredPhotos: featuredPhotos.length > 0 ? featuredPhotos : images.slice(0, 9),
      stories,
      posts,
      allMedia: mediaList,
      photoCount: images.length,
      videoCount: videos.length,
      categories,
    };

    let totalBytes = 0;
    for (const item of mediaList) {
      totalBytes += item.size;
    }

    return NextResponse.json({
      success: true,
      data: profileData,
      totalCount: mediaList.length,
      imageCount: images.length,
      videoCount: videos.length,
      totalBytes,
      categories: categories.map((c) => ({ name: c.name, count: c.count })),
      items: mediaList,
    });
  } catch (error: any) {
    console.error('Error serving sweetheart profile data:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi tải profile Thảo Baby' },
      { status: 500 }
    );
  }
}
