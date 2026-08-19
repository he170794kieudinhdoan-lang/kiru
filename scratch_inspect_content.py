import os
import sys
import json
import cv2

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

media_dir = r"D:\Onsite Project\Upload\media\mai_hoa"
files = sorted(os.listdir(media_dir))

print(f"=== DETAILED CONTENT ANALYSIS FOR {len(files)} FILES ===")

for idx, f in enumerate(files, 1):
    fpath = os.path.join(media_dir, f)
    ext = os.path.splitext(f)[1].lower()
    is_video = ext in ['.mp4', '.mov', '.webm', '.avi']
    
    if is_video:
        cap = cv2.VideoCapture(fpath)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = round(frames / fps if fps > 0 else 0, 1)
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Check average brightness or color
        ret, frame = cap.read()
        mean_bgr = frame.mean(axis=(0,1)) if ret else [0,0,0]
        cap.release()
        
        print(f"[{idx:2d}] VIDEO: {f}")
        print(f"     Duration: {duration}s | Res: {w}x{h} | Mean color (BGR): {mean_bgr.astype(int)}")
    else:
        print(f"[{idx:2d}] IMAGE: {f}")
