import os
import urllib.request
import zipfile

output_dir = 'backend/mediherbz-images'
os.makedirs(output_dir, exist_ok=True)

# Curated image list mapping descriptive filenames to each product, blog, and category
images_to_download = [
    # Products
    ("product-kesh-ratna-hair-oil.jpg", "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=85"),
    ("product-kumkumadi-radiance-elixir.jpg", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=85"),
    ("product-ashwagandha-capsules.jpg", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=85"),
    ("product-triphala-churna.jpg", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85"),
    ("product-tulsi-ginger-tea.jpg", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=85"),
    ("product-sandalwood-turmeric-ubtan.jpg", "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=85"),
    ("product-total-youth-combo-kit.jpg", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85"),
    
    # Categories & Botanical Ingredients
    ("ingredient-herbal-leaves-ayurveda.jpg", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85"),
    ("ingredient-kashmiri-saffron.jpg", "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=85"),
    ("category-herbal-oils.jpg", "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=1000&q=85"),
    ("category-wellness-meditation.jpg", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=85"),

    # Brand Logo & Banners
    ("mediherbz-logo.png", "frontend/public/brand/mediherbz-logo.png"),
    ("banner-wellness-ayurveda.jpg", "frontend/public/hero/banner-wellness.jpg"),
]

downloaded_files = []

for filename, source in images_to_download:
    dest_path = os.path.join(output_dir, filename)
    if source.startswith('http'):
        print(f"Downloading {filename}...")
        try:
            req = urllib.request.Request(source, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as response, open(dest_path, 'wb') as out_file:
                out_file.write(response.read())
            downloaded_files.append(dest_path)
        except Exception as e:
            print(f"Failed to download {filename}: {e}")
    elif os.path.exists(source):
        print(f"Copying local {filename}...")
        with open(source, 'rb') as src, open(dest_path, 'wb') as dst:
            dst.write(src.read())
        downloaded_files.append(dest_path)

# Create a zip package for 1-click download & WordPress bulk upload
zip_path = 'backend/mediherbz-wordpress-media-bundle.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for f in downloaded_files:
        zipf.write(f, arcname=os.path.basename(f))

print(f"\nAll images downloaded and packaged into {zip_path}")
