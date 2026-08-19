import os
import sys
import shutil
import json
import cv2
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

src_dir = r"C:\Users\kieud\Desktop\Media_Da_Sap_Xep\2. Mai Hoa (mai_hoa_2k8)"
dest_project = r"D:\Onsite Project\Upload"
dest_media = os.path.join(dest_project, "media", "mai_hoa")
dest_thumbs = os.path.join(dest_project, "media", "mai_hoa_thumbs")

os.makedirs(dest_media, exist_ok=True)
os.makedirs(dest_thumbs, exist_ok=True)

files = sorted(os.listdir(src_dir))
print(f"Copying and processing {len(files)} files from {src_dir} to {dest_media}...")

image_exts = {'.jpg', '.jpeg', '.png', '.webp', '.jfif', '.bmp'}
video_exts = {'.mp4', '.mov', '.webm', '.avi', '.mkv'}

media_items = []

for idx, f in enumerate(files):
    src_file = os.path.join(src_dir, f)
    dst_file = os.path.join(dest_media, f)
    shutil.copy2(src_file, dst_file)
    
    ext = os.path.splitext(f)[1].lower()
    base_name = os.path.splitext(f)[0]
    thumb_name = f"{base_name}.webp"
    thumb_path = os.path.join(dest_thumbs, thumb_name)
    
    is_video = ext in video_exts
    w, h, duration = 0, 0, 0
    
    if is_video:
        try:
            cap = cv2.VideoCapture(dst_file)
            fps = cap.get(cv2.CAP_PROP_FPS) or 30
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = round(total_frames / fps if fps > 0 else 0, 1)
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # Extract middle frame for thumbnail
            mid_frame = int(total_frames * 0.3)
            cap.set(cv2.CAP_PROP_POS_FRAMES, mid_frame)
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = cap.read()
            if ret:
                # Resize thumbnail maintaining aspect ratio
                fh, fw = frame.shape[:2]
                max_dim = 600
                scale = min(max_dim / fw, max_dim / fh, 1.0)
                new_w, new_h = int(fw * scale), int(fh * scale)
                resized = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
                
                # Convert BGR to RGB and save as WebP
                rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(rgb)
                pil_img.save(thumb_path, 'WEBP', quality=80)
            cap.release()
        except Exception as e:
            print(f"Error thumbnailing video {f}: {e}")
    else:
        try:
            pil_img = Image.open(dst_file)
            w, h = pil_img.size
            pil_img.thumbnail((600, 600), Image.Resampling.LANCZOS)
            pil_img.convert('RGB').save(thumb_path, 'WEBP', quality=82)
        except Exception as e:
            print(f"Error thumbnailing image {f}: {e}")
    
    media_items.append({
        'id': f"mh_{idx+1}",
        'filename': f,
        'isVideo': is_video,
        'ext': ext.replace('.', ''),
        'size': os.path.getsize(dst_file),
        'width': w,
        'height': h,
        'duration': duration,
        'url': f"/api/maihoa/media?file={f}",
        'thumbUrl': f"/api/maihoa/media?file={f}&thumb=true"
    })
    print(f"Processed [{idx+1}/{len(files)}] {f} ({'Video' if is_video else 'Image'})")

# Save catalog JSON
json_out = os.path.join(dest_project, "media", "mai_hoa_catalog.json")
with open(json_out, 'w', encoding='utf-8') as jf:
    json.dump(media_items, jf, ensure_ascii=False, indent=2)

print(f"\n✅ All {len(media_items)} items copied & thumbnailed! Catalog saved to {json_out}")
