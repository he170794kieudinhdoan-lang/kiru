import os
import sys
import json
import cv2
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

dest_project = r"D:\Onsite Project\Upload"
dest_media = os.path.join(dest_project, "media", "sweetheart")
dest_thumbs = os.path.join(dest_project, "media", "sweetheart_thumbs")

video_exts = {'.mp4', '.mov', '.webm', '.avi', '.mkv'}
image_exts = {'.jpg', '.jpeg', '.png', '.webp', '.jfif', '.bmp'}

SUPABASE_BASE_URL = 'https://rtumniwnckicetqyqpvn.supabase.co/storage/v1/object/public/vault-media'

media_items = []

folders = sorted(os.listdir(dest_media))
idx_counter = 1

for folder in folders:
    folder_path = os.path.join(dest_media, folder)
    if not os.path.isdir(folder_path):
        continue
    
    clean_title = folder.split('_', 1)[1].replace('_', ' ') if '_' in folder else folder
    files = sorted(os.listdir(folder_path))
    
    for f in files:
        ext = os.path.splitext(f)[1].lower()
        if ext not in video_exts and ext not in image_exts:
            continue
        
        full_path = os.path.join(folder_path, f)
        base_name = os.path.splitext(f)[0]
        rel_path = f"{folder}/{f}"
        thumb_rel_path = f"{folder}/{base_name}.webp"
        
        is_video = ext in video_exts
        w, h, duration = 0, 0, 0
        file_size = os.path.getsize(full_path)
        
        if is_video:
            try:
                cap = cv2.VideoCapture(full_path)
                fps = cap.get(cv2.CAP_PROP_FPS) or 30
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                duration = round(total_frames / fps if fps > 0 else 0, 1)
                w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                cap.release()
            except Exception as e:
                print(f"Error reading video metadata {f}: {e}")
        else:
            try:
                with Image.open(full_path) as pil_img:
                    w, h = pil_img.size
            except Exception as e:
                print(f"Error reading image metadata {f}: {e}")
        
        item = {
            'id': f"sw_{idx_counter}",
            'filename': f,
            'relPath': rel_path,
            'folder': folder,
            'folderTitle': clean_title,
            'isVideo': is_video,
            'ext': ext.replace('.', ''),
            'size': file_size,
            'width': w or (1080 if not is_video else 720),
            'height': h or (1920 if not is_video else 1280),
            'duration': duration,
            'url': f"/api/sweetheart/media?file={rel_path}",
            'thumbUrl': f"/api/sweetheart/media?file={rel_path}&thumb=true",
            'supabaseUrl': f"{SUPABASE_BASE_URL}/sweetheart/originals/{rel_path}",
            'supabaseThumbUrl': f"{SUPABASE_BASE_URL}/sweetheart/thumbs/{thumb_rel_path}",
        }
        
        media_items.append(item)
        idx_counter += 1

json_out = os.path.join(dest_project, "media", "sweetheart_catalog.json")
with open(json_out, 'w', encoding='utf-8') as jf:
    json.dump(media_items, jf, ensure_ascii=False, indent=2)

print(f"✅ Generated sweetheart catalog with {len(media_items)} items saved to {json_out}")
