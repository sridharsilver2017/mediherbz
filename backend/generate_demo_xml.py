import re
import html
import datetime

# Parse products and blogs from mockData.ts
with open('frontend/src/data/mockData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

products_data = [
    {
        "id": 101,
        "name": "Kesh Ratna Herbal Hair Vitalizer Oil",
        "slug": "kesh-ratna-herbal-hair-vitalizer-oil",
        "price": 649,
        "regular_price": 799,
        "short_description": "Potent Ayurvedic cold-pressed oil with Bhringraj, Brahmi, and Amla for thick, youthful hair.",
        "description": "<p>Mediherbz Kesh Ratna Hair Oil is formulated using classical Kshir Pak Vidhi. 21 vital herbs are slowly simmered in pure sesame and virgin coconut milk to deliver deep root nutrition, halt premature graying, and stimulate dormant follicles.</p>",
        "categories": ["Herbal Hair Care", "Herbal Oils"],
        "sku": "MED-OIL-KR100",
        "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
        "botanical_name": "Eclipta alba & Bacopa monnieri Infusion",
        "ingredients": "Bhringraj (Eclipta alba), Brahmi (Bacopa monnieri), Amla (Phyllanthus emblica), Neem Leaf extract, Cold Pressed Sesame Oil, Virgin Coconut Oil",
        "directions": "Apply 5-10 ml to scalp and hair shafts. Gently massage with fingertips in circular motions for 10 minutes."
    },
    {
        "id": 102,
        "name": "Kumkumadi Radiance Youth Elixir Serum",
        "slug": "kumkumadi-radiance-youth-elixir-serum",
        "price": 1250,
        "regular_price": 1499,
        "short_description": "Sacred facial elixir infused with pure Kashmiri saffron, sandalwood and 26 classical herbs.",
        "description": "<p>Experience clinical-grade botanical radiance with our Kumkumadi Youth Elixir. Handcrafted according to the sacred Ashtanga Hridayam recipe to deeply regenerate skin cells, diminish pigmentation, and unveil timeless luminous vitality.</p>",
        "categories": ["Herbal Skin Care", "Natural Beauty"],
        "sku": "MED-SER-KK30",
        "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        "botanical_name": "Crocus sativus & Santalum album Tailam",
        "ingredients": "Kashmiri Saffron (Crocus sativus), Red Sandalwood, Lodhra, Manjistha, Indian Lotus, Sesame Oil Base",
        "directions": "Take 3-4 drops on clean palm and gently press onto cleansed, slightly damp face and neck at night."
    },
    {
        "id": 103,
        "name": "Ashwagandha KSM-66 Organic Vitality Capsules",
        "slug": "ashwagandha-ksm66-organic-vitality-capsules",
        "price": 549,
        "regular_price": 699,
        "short_description": "Full-spectrum root extract standardized to 5% withanolides for deep calm, vitality & focus.",
        "description": "<p>Harness the restorative power of KSM-66 organic Ashwagandha. Known as the premier adaptogen in Ayurveda, it naturally regulates cortisol levels, elevates physical stamina, and supports mental tranquility.</p>",
        "categories": ["Herbal Supplements", "Wellness Essentials"],
        "sku": "MED-SUP-AG60",
        "image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
        "botanical_name": "Withania somnifera standardized extract",
        "ingredients": "Standardized KSM-66 Ashwagandha Root Extract (5% Withanolides 500mg), BioPerine (Black Pepper Extract 5mg)",
        "directions": "Take 1 capsule twice daily with warm milk or water after meals."
    },
    {
        "id": 104,
        "name": "Triphala Bio-Active Micronized Churna",
        "slug": "triphala-bio-active-micronized-churna",
        "price": 299,
        "regular_price": 349,
        "short_description": "Synergistic 1:1:1 ratio of Haritaki, Bibhitaki, and Amalaki for daily gut detox and digestion.",
        "description": "<p>A timeless Ayurvedic master formula. Mediherbz Triphala is micro-pulverized at low temperatures to preserve thermolabile antioxidants and bioflavonoids.</p>",
        "categories": ["Herbal Powders", "Ayurvedic Products"],
        "sku": "MED-POW-TP200",
        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        "botanical_name": "Terminalia chebula, Terminalia bellirica & Phyllanthus emblica",
        "ingredients": "Equal proportions of dried fruits of Haritaki, Bibhitaki, and Amalaki.",
        "directions": "Mix 3-5 grams in a glass of warm water before bedtime."
    },
    {
        "id": 105,
        "name": "Himalayan Tulsi Ginger Herbal Infusion Tea",
        "slug": "himalayan-tulsi-ginger-herbal-infusion-tea",
        "price": 399,
        "regular_price": 499,
        "short_description": "Caffeine-free therapeutic blend of Rama, Krishna, Vana Tulsi and sun-dried ginger root.",
        "description": "<p>Brew pure tranquility. Hand-picked wild Tulsi leaves blended with spicy sun-dried mountain ginger to soothe airways, bolster immune defenses, and soothe daily fatigue.</p>",
        "categories": ["Herbal Teas", "Wellness Essentials"],
        "sku": "MED-TEA-TG100",
        "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
        "botanical_name": "Ocimum sanctum & Zingiber officinale blend",
        "ingredients": "Rama Tulsi, Krishna Tulsi, Vana Tulsi, Sun-dried Himalayan Ginger, Lemongrass, Cardamom pod extract.",
        "directions": "Steep 1 tea bag or 2g loose blend in freshly boiled water for 4-5 minutes."
    },
    {
        "id": 106,
        "name": "Sandalwood & Turmeric Radiance Ubtan Paste",
        "slug": "sandalwood-turmeric-radiance-ubtan-paste",
        "price": 499,
        "regular_price": 599,
        "short_description": "Traditional micro-exfoliating bridal paste with raw wild turmeric, Mysore sandalwood, and saffron.",
        "description": "<p>Revive dull skin with authentic ceremonial Ayurvedic Ubtan. Naturally lifts dead epidermal cells, clarifies blemishes, and restores an even, luminous complexion.</p>",
        "categories": ["Herbal Skin Care", "Natural Beauty"],
        "sku": "MED-UBT-ST150",
        "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
        "botanical_name": "Santalum album & Curcuma aromatica",
        "ingredients": "Mysore Sandalwood powder, Wild Kasturi Manjal (Turmeric), Chickpea flour, Cold-pressed Sweet Almond Oil, Rose petal powder.",
        "directions": "Apply an even layer over face and neck. Allow to dry for 12-15 minutes, then gently scrub off in upward circular strokes with lukewarm water."
    },
    {
        "id": 107,
        "name": "Total Youth & Glow Complete Herbal Combo",
        "slug": "total-youth-glow-complete-herbal-combo-kit",
        "price": 2199,
        "regular_price": 2797,
        "short_description": "Our flagship 3-step ritual: Kesh Ratna Hair Oil, Kumkumadi Youth Elixir, and Sandalwood Ubtan in a luxury gift box.",
        "description": "<p>The ultimate holistic rejuvenation gift. Features our three most celebrated preparations packaged in a keepsake eco-friendly wooden box.</p>",
        "categories": ["Herbal Kits & Combos", "Ayurvedic Products"],
        "sku": "MED-KIT-TYG03",
        "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        "botanical_name": "Sacred Tri-Dosha Holistic Wellness Set",
        "ingredients": "1x Kesh Ratna Hair Vitalizer (100ml), 1x Kumkumadi Youth Elixir (30ml), 1x Sandalwood Radiance Ubtan (150g).",
        "directions": "Use weekly as a complete head-to-toe rejuvenating weekend ritual."
    }
]

blogs_data = [
    {
        "id": 201,
        "title": "The Ancient Secret of Kumkumadi: How Kashmiri Saffron Restores Natural Glow",
        "slug": "secret-of-kumkumadi-kashmiri-saffron-glow",
        "excerpt": "Discover the science and sacred Ayurvedic origins of Kumkumadi Tailam, the revered botanical oil that combats dullness and promotes cellular renewal.",
        "content": "<p>Kumkumadi Tailam has been celebrated in classic Ayurvedic treatises such as the <em>Ashtanga Hridayam</em> for over a thousand years. Regarded as 'liquid gold' for the complexion, this unique botanical preparation brings together the purity of Kashmiri saffron, red sandalwood, and over twenty-four potent herbal extracts.</p><h3>Why Kashmiri Saffron is Unrivaled</h3><p>The crocin content in pure high-altitude Kashmiri saffron gives it extraordinary anti-inflammatory and antioxidant properties. When combined with cooling sandalwood and nourishing goat milk, it balances pitta dosha, soothing redness and deeply revitalizing UV-stressed skin.</p><h3>How to Incorporate Kumkumadi Into Your Night Ritual</h3><p>A few warm drops massaged into damp skin before sleep works synergistically with the skin's circadian repair cycle, allowing you to wake up to a supple, luminous, and youthful radiance without relying on synthetic chemicals.</p>",
        "category": "Natural Beauty",
        "date": "2026-10-15 10:00:00"
    },
    {
        "id": 202,
        "title": "Bhringraj: The King of Hair Herbs and the Kshir Pak Vidhi Process",
        "slug": "bhringraj-king-of-hair-herbs-kshir-pak-vidhi",
        "excerpt": "Why modern chemical serums fall short compared to traditional slow-cooked herbal hair oils infused via ancient Ayurvedic milk-decoction methods.",
        "content": "<p>In Sanskrit, Bhringraj translates to 'the ruler of bees', referencing its ability to attract and revitalize life. In Ayurvedic trichology, it is revered as the undisputed king for strengthening hair follicles from root to tip.</p><h3>The Art of Kshir Pak Vidhi</h3><p>Unlike industrial oils made by simply adding artificial fragrance to mineral oil, authentic Mediherbz hair vitalizers are crafted through Kshir Pak Vidhi. Fresh botanical herbs are simmered gently with milk and pure sesame oil for over 72 hours until all water evaporates and only the herb-infused lipid core remains.</p>",
        "category": "Hair Care",
        "date": "2026-10-22 10:00:00"
    },
    {
        "id": 203,
        "title": "Ashwagandha for Modern Stress: Grounding the Mind and Boosting Vitality",
        "slug": "ashwagandha-modern-stress-grounding-vitality",
        "excerpt": "An adaptogenic guide to regulating cortisol, enhancing stamina, and cultivating balanced daily energy without caffeine crashes.",
        "content": "<p>Living in today’s hyper-connected, high-demand world constantly activates our sympathetic nervous system. In Ayurvedic medicine, this manifests as an aggravated Vata dosha—leading to restless sleep, mental fatigue, and diminished physical resilience.</p><h3>How Adaptogens Function</h3><p>Ashwagandha (Withania somnifera) is classified as a Rasayana, an herb that fosters longevity and systemic revitalization. Modern clinical studies confirm its efficacy in regulating serum cortisol levels and supporting deep restorative REM sleep.</p>",
        "category": "Herbal Living",
        "date": "2026-10-28 10:00:00"
    }
]

xml = f"""<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
	xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
	<title>Mediherbz Ayurvedic Wellness</title>
	<link>https://dev-medinerbz.pantheonsite.io</link>
	<description>For Young &amp; Vibrant Look</description>
	<pubDate>Mon, 23 Nov 2026 16:15:00 +0000</pubDate>
	<language>en-US</language>
	<wp:wxr_version>1.2</wp:wxr_version>
	<wp:base_site_url>https://dev-medinerbz.pantheonsite.io</wp:base_site_url>
	<wp:base_blog_url>https://dev-medinerbz.pantheonsite.io</wp:base_blog_url>

	<wp:author>
		<wp:author_id>1</wp:author_id>
		<wp:author_login><![CDATA[admin]]></wp:author_login>
		<wp:author_email><![CDATA[care@mediherbz.com]]></wp:author_email>
		<wp:author_display_name><![CDATA[Dr. Ananya Sharma (B.A.M.S.)]]></wp:author_display_name>
		<wp:author_first_name><![CDATA[Ananya]]></wp:author_first_name>
		<wp:author_last_name><![CDATA[Sharma]]></wp:author_last_name>
	</wp:author>
"""

# Products (type: product)
for p in products_data:
    cats_xml = "\n".join([f'<category domain="product_cat" nicename="{c.lower().replace(" ", "-").replace("&", "and")}"><![CDATA[{c}]]></category>' for c in p["categories"]])
    xml += f"""
	<item>
		<title><![CDATA[{p["name"]}]]></title>
		<link>https://dev-medinerbz.pantheonsite.io/product/{p["slug"]}/</link>
		<pubDate>Mon, 23 Nov 2026 12:00:00 +0000</pubDate>
		<dc:creator><![CDATA[admin]]></dc:creator>
		<guid isPermaLink="false">https://dev-medinerbz.pantheonsite.io/?post_type=product&#038;p={p["id"]}</guid>
		<description></description>
		<content:encoded><![CDATA[{p["description"]}]]></content:encoded>
		<excerpt:encoded><![CDATA[{p["short_description"]}]]></excerpt:encoded>
		<wp:post_id>{p["id"]}</wp:post_id>
		<wp:post_date><![CDATA[2026-11-23 12:00:00]]></wp:post_date>
		<wp:post_date_gmt><![CDATA[2026-11-23 12:00:00]]></wp:post_date_gmt>
		<wp:post_modified><![CDATA[2026-11-23 12:00:00]]></wp:post_modified>
		<wp:post_modified_gmt><![CDATA[2026-11-23 12:00:00]]></wp:post_modified_gmt>
		<wp:comment_status><![CDATA[open]]></wp:comment_status>
		<wp:ping_status><![CDATA[closed]]></wp:ping_status>
		<wp:post_name><![CDATA[{p["slug"]}]]></wp:post_name>
		<wp:status><![CDATA[publish]]></wp:status>
		<wp:post_parent>0</wp:post_parent>
		<wp:menu_order>0</wp:menu_order>
		<wp:post_type><![CDATA[product]]></wp:post_type>
		<wp:post_password><![CDATA[]]></wp:post_password>
		<wp:is_sticky>0</wp:is_sticky>
        {cats_xml}
		<wp:postmeta>
			<wp:meta_key><![CDATA[_sku]]></wp:meta_key>
			<wp:meta_value><![CDATA[{p["sku"]}]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_regular_price]]></wp:meta_key>
			<wp:meta_value><![CDATA[{p["regular_price"]}]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_sale_price]]></wp:meta_key>
			<wp:meta_value><![CDATA[{p["price"]}]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_price]]></wp:meta_key>
			<wp:meta_value><![CDATA[{p["price"]}]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_stock_status]]></wp:meta_key>
			<wp:meta_value><![CDATA[instock]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_manage_stock]]></wp:meta_key>
			<wp:meta_value><![CDATA[yes]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_stock]]></wp:meta_key>
			<wp:meta_value><![CDATA[50]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_mediherbz_botanical_name]]></wp:meta_key>
			<wp:meta_value><![CDATA[{p["botanical_name"]}]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_mediherbz_ingredients]]></wp:meta_key>
			<wp:meta_value><![CDATA[{p["ingredients"]}]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_mediherbz_directions_for_use]]></wp:meta_key>
			<wp:meta_value><![CDATA[{p["directions"]}]]></wp:meta_value>
		</wp:postmeta>
	</item>
"""

# Blogs (type: post)
for b in blogs_data:
    xml += f"""
	<item>
		<title><![CDATA[{b["title"]}]]></title>
		<link>https://dev-medinerbz.pantheonsite.io/blog/{b["slug"]}/</link>
		<pubDate>Mon, 23 Nov 2026 12:00:00 +0000</pubDate>
		<dc:creator><![CDATA[admin]]></dc:creator>
		<guid isPermaLink="false">https://dev-medinerbz.pantheonsite.io/?p={b["id"]}</guid>
		<description></description>
		<content:encoded><![CDATA[{b["content"]}]]></content:encoded>
		<excerpt:encoded><![CDATA[{b["excerpt"]}]]></excerpt:encoded>
		<wp:post_id>{b["id"]}</wp:post_id>
		<wp:post_date><![CDATA[{b["date"]}]]></wp:post_date>
		<wp:post_date_gmt><![CDATA[{b["date"]}]]></wp:post_date_gmt>
		<wp:post_modified><![CDATA[{b["date"]}]]></wp:post_modified>
		<wp:post_modified_gmt><![CDATA[{b["date"]}]]></wp:post_modified_gmt>
		<wp:comment_status><![CDATA[open]]></wp:comment_status>
		<wp:ping_status><![CDATA[open]]></wp:ping_status>
		<wp:post_name><![CDATA[{b["slug"]}]]></wp:post_name>
		<wp:status><![CDATA[publish]]></wp:status>
		<wp:post_parent>0</wp:post_parent>
		<wp:menu_order>0</wp:menu_order>
		<wp:post_type><![CDATA[post]]></wp:post_type>
		<category domain="category" nicename="{b["category"].lower().replace(" ", "-")}"><![CDATA[{b["category"]}]]></category>
	</item>
"""

xml += """
</channel>
</rss>
"""

with open('backend/mediherbz-demo-content.xml', 'w', encoding='utf-8') as f:
    f.write(xml)

print('Generated backend/mediherbz-demo-content.xml successfully!')
