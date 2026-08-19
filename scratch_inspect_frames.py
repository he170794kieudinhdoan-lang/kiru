import os
import sys
import json
import cv2

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

media_dir = r"D:\Onsite Project\Upload\media\mai_hoa"
files = sorted(os.listdir(media_dir))

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
        
        # Capture frames at 25%, 50%, 75%
        for pct in [0.25, 0.5, 0.75]:
            fno = int(frames * pct)
            cap.set(cv2.CAP_PROP_POS_FRAMES, fno)
            ret, frame = cap.read()
            if ret:
                mean_val = frame.mean(axis=(0,1))
        cap.release()
        print(f"[{idx:2d}] {f} ({dur}s, {w}x{h})")
    else:
        print(f"[{idx:2d}] {f} (Image)")
