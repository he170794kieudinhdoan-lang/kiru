# Kiru Vault - Ứng Dụng Di Động (React Native + Expo)

Ứng dụng chia sẻ và lưu trữ ảnh/video tạm thời (tự huỷ sau 30 phút) theo mã Key 4 chữ số, được xây dựng bằng **React Native** và **Expo SDK 57**, kết nối trực tiếp với **Supabase Storage**.

---

## 📱 Lưu ý quan trọng về định dạng tệp trên Điện thoại:
> [!IMPORTANT]
> - **File `.exe`** là file thực thi dành cho **máy tính Windows**, **không thể cài đặt trực tiếp trên điện thoại**.
> - Để cài đặt và sử dụng trên điện thoại:
>   - **Android**: Cần file cài đặt định dạng **`.apk`**.
>   - **iOS (iPhone/iPad)**: Chạy qua ứng dụng **Expo Go** (quét mã QR) hoặc build file **`.ipa`**.

---

## 🚀 1. Chạy thử ngay trên điện thoại qua Expo Go (Không cần chờ build)

Bạn có thể chạy thử ngay lập tức trên cả điện thoại Android và iPhone:

1. **Cài đặt ứng dụng Expo Go trên điện thoại:**
   - [Tải Expo Go trên Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [Tải Expo Go trên App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)

2. **Chạy lệnh khởi động máy chủ Expo:**
   ```bash
   cd mobile-app
   npx expo start
   ```

3. **Mở app trên điện thoại:**
   - **Android:** Mở ứng dụng **Expo Go** -> Chọn **Scan QR Code** và quét mã QR trên màn hình terminal.
   - **iPhone:** Mở ứng dụng **Camera** mặc định trên iPhone -> Quét mã QR -> Bấm vào thông báo để mở trong **Expo Go**.

---

## 📦 2. Cách tạo Link tải file APK cài đặt trực tiếp cho Android (EAS Build)

Expo cung cấp dịch vụ **EAS Build** (miễn phí) để đóng gói ứng dụng thành file **`.apk`** và tạo ra **đường link tải trực tiếp** cho bạn và người khác cài đặt.

### Bước 1: Đăng nhập Expo CLI
Nếu chưa có tài khoản, hãy đăng ký miễn phí tại [expo.dev/signup](https://expo.dev/signup).
```bash
cd mobile-app
npx eas-cli login
```

### Bước 2: Khởi tạo cấu hình dự án EAS (chỉ cần làm 1 lần đầu)
```bash
npx eas-cli project:init
```

### Bước 3: Chạy lệnh Build APK và nhận link tải
```bash
npx eas-cli build -p android --profile preview
```

### Bước 4: Tải về và cài đặt
- Sau vài phút, hệ thống Cloud của Expo sẽ hoàn tất quá trình build.
- Terminal sẽ in ra **đường link download trực tiếp file `.apk`** (dạng `https://expo.dev/artifacts/eas/...apk`) kèm mã QR để quét tải về ngay trên điện thoại Android.
- Người dùng chỉ cần tải về, bấm **Cài đặt** (Cho phép cài đặt nguồn ngoài nếu điện thoại hỏi) là dùng được như app bình thường!

---

## 🛠️ Cấu trúc thư mục ứng dụng di động:
```
mobile-app/
├── src/
│   ├── constants/
│   │   └── config.ts            # Cấu hình URL & Key Supabase
│   ├── lib/
│   │   ├── supabase.ts          # Kết nối Supabase Storage & logic tự xoá 30 phút
│   │   └── utils.ts             # Các hàm định dạng bytes, thời gian countdown
│   └── components/
│       ├── Header.tsx           # Thanh điều hướng trên cùng phong cách Neo-brutalism
│       ├── KeyEntryView.tsx     # Màn hình nhập mã 4 số & Key gần đây
│       ├── KeyVaultView.tsx     # Màn hình kho lưu trữ chính
│       ├── UploadSection.tsx    # Chọn ảnh/video từ thư viện máy hoặc chụp camera
│       ├── MediaGallery.tsx     # Danh sách lưới hiển thị tệp & đếm ngược 30 phút
│       ├── MediaModal.tsx       # Xem chi tiết ảnh/video, tải về máy & chia sẻ
│       └── GuideModal.tsx       # Bảng hướng dẫn sử dụng nhanh
├── App.tsx                      # Component gốc của ứng dụng
├── app.json                     # Cấu hình app icon, splash screen & quyền thiết bị
├── eas.json                     # Cấu hình EAS Build APK Android
└── package.json
```

---

## ✨ Tính năng nổi bật trên App Mobile:
1. **Giao diện Neo-brutalism hiện đại**: Thiết kế viền đen nổi bật, màu sắc bắt mắt (Vàng, Xanh Lime, Hồng Neon, Cyan).
2. **Nhập mã khoá 4 số siêu nhanh**: Ghi nhớ danh sách Key vừa truy cập trong bộ nhớ máy (`AsyncStorage`).
3. **Tải lên đa phương tiện**: Hỗ trợ chọn nhiều ảnh/video cùng lúc từ thư viện máy hoặc quay chụp trực tiếp từ camera.
4. **Tải về thư viện máy**: Lưu trực tiếp ảnh và video vào Album ảnh trên điện thoại (`MediaLibrary`).
5. **Đồng hồ đếm ngược thời gian thực**: Hiển thị thời gian còn lại trước khi tệp tự động huỷ sau 30 phút.
6. **Tự động xoá tệp hết hạn**: Tự động dọn dẹp và huỷ tệp vĩnh viễn trên Supabase Storage ngay khi hết thời gian 30 phút.
