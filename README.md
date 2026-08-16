# ⚡ SUPA VAULT — Key-Based Media Storage (Neobrutalism UI)

Website upload & chia sẻ tệp media (ảnh & video) cực đơn giản, lưu trữ trực tiếp trên **Supabase Storage**, xây dựng bằng **Next.js (App Router)** và phong cách thiết kế **Neobrutalism UI**.

---

## ✨ Tính Năng Chính

1. 🔑 **Xác thực bằng Mã Key đơn giản**:
   - Nhập mã Key để mở phòng/thư mục lưu trữ.
   - Bất kỳ ai có mã Key đều có thể xem, tải xuống và tải thêm tệp media vào thư mục đó.
   - Hỗ trợ lưu lịch sử Key đã truy cập gần đây trên trình duyệt.
   - Hỗ trợ đường dẫn chia sẻ trực tiếp: `https://your-site.com/?key=MA_KEY_CUA_BAN`

2. 🚀 **Tạo Key mới nhanh chóng**:
   - Tự động sinh mã Key phong cách (VD: `CYBER-VAULT-8821`, `NEO-ROOM-4029`) hoặc tự đặt tên tuỳ ý.
   - Nhấn tạo để lập tức mở thư mục và tải tệp lên.

3. 📁 **Tải lên & Quản lý Media (Ảnh & Video)**:
   - Kéo & thả nhiều tệp cùng lúc (Drag & Drop).
   - Hỗ trợ tất cả định dạng ảnh (`PNG, JPG, JPEG, WEBP, GIF, SVG...`) và video (`MP4, WEBM, MOV, MKV...`).
   - Thanh tiến trình tải lên từng tệp theo thời gian thực + hiệu ứng pháo hoa Confetti.
   - Xem trước ảnh độ phân giải cao hoặc phát video trực tiếp với trình phát HTML5.
   - Tải file về máy với 1 cú click (Direct Download).
   - Copy đường dẫn tệp công khai (Public CDN Link).
   - Xoá tệp khỏi thư mục với hộp thoại xác nhận.

4. 🎨 **Thiết kế Neobrutalism ấn tượng**:
   - Viền đen đậm, đổ bóng cứng cáp (`shadow-neo`), màu sắc tương phản cao (Vàng, Hồng, Cyan, Lime).
   - Micro-interactions, stickers, font chữ Grotesk & Monospace đặc trưng.

5. ⚙️ **Cấu hình Supabase linh hoạt**:
   - Thiết lập qua file `.env.local` hoặc nhập trực tiếp trong giao diện cài đặt trên web (lưu trong `localStorage`).

---

## 🛠️ Cài Đặt & Chạy Dự Án

### 1. Khởi chạy server phát triển:

\`\`\`bash
npm run dev
\`\`\`

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Cấu Hình Supabase Storage

### Cách 1: Thiết lập qua file `.env.local`

Tạo hoặc chỉnh sửa file `.env.local` ở thư mục gốc:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SUPABASE_BUCKET=vault-media
\`\`\`

### Cách 2: Nhập trực tiếp trên giao diện Web

Nhấn vào nút **"Cấu hình Supabase"** ở góc trên thanh điều hướng, điền **Supabase Project URL** và **Anon Public Key**, sau đó bấm **"Lưu & Áp Dụng"**.

---

## 📜 SQL Tạo Bucket & Phân Quyền Trong Supabase

Vào mục **SQL Editor** trong bảng điều khiển Supabase của bạn và chạy đoạn lệnh sau:

\`\`\`sql
-- 1. Tạo Bucket 'vault-media' công khai
insert into storage.buckets (id, name, public)
values ('vault-media', 'vault-media', true)
on conflict (id) do update set public = true;

-- 2. Cấp quyền upload, xem và xoá file công khai cho bucket
create policy "Allow public access on vault-media"
on storage.objects for all
using (bucket_id = 'vault-media')
with check (bucket_id = 'vault-media');
\`\`\`
