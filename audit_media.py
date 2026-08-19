import os
import sys
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

desktop_dir = r"C:\Users\kieud\Desktop\Media_Da_Sap_Xep\2. Mai Hoa (mai_hoa_2k8)"
upload_media_dir = r"D:\Onsite Project\Upload\media\mai_hoa"
catalog_path = r"D:\Onsite Project\Upload\media\mai_hoa_catalog.json"

desktop_files = sorted(os.listdir(desktop_dir))
upload_files = sorted(os.listdir(upload_media_dir))

with open(catalog_path, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

catalog_filenames = sorted([item['filename'] for item in catalog])

print(f"=== AUDIT OF ALL MEDIA FILES ===")
print(f"Desktop folder files count: {len(desktop_files)}")
print(f"Upload media files count:  {len(upload_files)}")
print(f"Catalog items count:       {len(catalog_filenames)}")

missing_in_upload = set(desktop_files) - set(upload_files)
missing_in_catalog = set(upload_files) - set(catalog_filenames)

print(f"Missing in upload folder: {missing_in_upload or 'None'}")
print(f"Missing in catalog JSON:  {missing_in_catalog or 'None'}")

# Break down by type
photos = [f for f in upload_files if any(f.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.bmp'])]
videos = [f for f in upload_files if any(f.lower().endswith(ext) for ext in ['.mp4', '.mov', '.webm', '.avi', '.mkv'])]

print(f"\nTotal Photos ({len(photos)}):")
for p in photos:
    print(f"  📸 {p}")

print(f"\nTotal Videos ({len(videos)}):")
for v in videos:
    print(f"  🎬 {v}")
