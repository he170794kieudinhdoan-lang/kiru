import os
import sys
import cv2
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

media_dir = r"D:\Onsite Project\Upload\media\mai_hoa"
files = sorted(os.listdir(media_dir))

print("=== DEEP INSPECTION OF ALL MEDIA FILES ===")

for idx, f in enumerate(files, 1):
    fpath = os.path.join(media_dir, f)
    ext = os.path.splitext(f)[1].lower()
    is_video = ext in ['.mp4', '.mov', '.webm', '.avi']
    
    if is_video:
        cap = cv2.VideoCapture(fpath)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        dur = round(frames / fps if fps > 0 else 0, 1)
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Save a montage of 4 frames (10%, 35%, 65%, 90%) to scratch for inspection
        cap.release()
        print(f"[{idx:2d}] {f} | Duration: {dur}s | Res: {w}x{h}")
    else:
        print(f"[{idx:2d}] {f} | Photo")
