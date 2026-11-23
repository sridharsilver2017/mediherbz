import os
import urllib.request
import zipfile

output_dir = 'backend/mediherbz-category-images'
os.makedirs(output_dir, exist_ok=True)

categories = [
    ("category-herbal-supplements.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=85"),
    ("category-ayurvedic-products.jpg", "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=85"),
    ("category-herbal-skin-care.jpg", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=85"),
    ("category-herbal-hair-care.jpg", "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=85"),
    ("category-herbal-oils.jpg", "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=85"),
    ("category-herbal-powders.jpg", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=85"),
    ("category-herbal-teas.jpg", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=85"),
    ("category-natural-beauty.jpg", "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=85"),
    ("category-organic-products.jpg", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=85"),
    ("category-wellness-essentials.jpg", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=85"),
    ("category-herbal-kits-combos.jpg", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=85"),
]

downloaded = []
for filename, url in categories:
    dest = os.path.join(output_dir, filename)
    print(f"Downloading {filename}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as res, open(dest, 'wb') as f:
            f.write(res.read())
        downloaded.append(dest)
    except Exception as e:
        print(f"Error {filename}: {e}")

# Also copy into general images folder
images_all_dir = 'backend/mediherbz-images'
for d in downloaded:
    fname = os.path.basename(d)
    with open(d, 'rb') as src, open(os.path.join(images_all_dir, fname), 'wb') as dst:
        dst.write(src.read())

zip_path = 'backend/mediherbz-categories-media-bundle.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for d in downloaded:
        zipf.write(d, arcname=os.path.basename(d))

# Also refresh main bundle with everything
all_images = [os.path.join(images_all_dir, f) for f in os.listdir(images_all_dir) if f.endswith(('.jpg', '.png'))]
with zipfile.ZipFile('backend/mediherbz-wordpress-media-bundle.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    for f in all_images:
        zipf.write(f, arcname=os.path.basename(f))

print(f"\nAll 11 category images packaged into {zip_path}")
