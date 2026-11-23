<?php
if (!defined('ABSPATH')) {
    exit;
}

class Mediherbz_REST_API {
    private $namespace = 'mediherbz/v1';

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        // Health
        register_rest_route($this->namespace, '/health', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_health'),
            'permission_callback' => '__return_true',
        ));

        // Settings
        register_rest_route($this->namespace, '/settings', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_settings'),
            'permission_callback' => '__return_true',
        ));

        // Categories
        register_rest_route($this->namespace, '/categories', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_categories'),
            'permission_callback' => '__return_true',
        ));

        // Products
        register_rest_route($this->namespace, '/products', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_products'),
            'permission_callback' => '__return_true',
        ));

        // Single Product by Slug
        register_rest_route($this->namespace, '/products/slug/(?P<slug>[a-zA-Z0-9-]+)', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_product_by_slug'),
            'permission_callback' => '__return_true',
        ));

        // Track order
        register_rest_route($this->namespace, '/orders/track', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'track_order'),
            'permission_callback' => '__return_true',
        ));

        // 1-Click Demo Data Importer (can be triggered with secret key or admin)
        register_rest_route($this->namespace, '/seed-demo-data', array(
            'methods'             => array('GET', 'POST'),
            'callback'            => array($this, 'seed_demo_data'),
            'permission_callback' => '__return_true',
        ));

        // Auto-link all uploaded media images to products and posts
        register_rest_route($this->namespace, '/link-images', array(
            'methods'             => array('GET', 'POST'),
            'callback'            => array($this, 'link_images_to_products'),
            'permission_callback' => '__return_true',
        ));
    }

    public function get_health() {
        return rest_ensure_response(array(
            'status'    => 'ok',
            'version'   => MEDIHERBZ_CORE_VERSION,
            'timestamp' => current_time('mysql'),
        ));
    }

    public function get_settings() {
        $settings = get_option('mediherbz_brand_settings', array());
        return rest_ensure_response($settings);
    }

    public function get_categories() {
        $terms = get_terms(array(
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
        ));

        if (is_wp_error($terms)) {
            return rest_ensure_response(array());
        }

        $formatted = array();
        foreach ($terms as $t) {
            $formatted[] = array(
                'id'          => $t->term_id,
                'name'        => $t->name,
                'slug'        => $t->slug,
                'count'       => $t->count,
                'description' => $t->description,
            );
        }
        return rest_ensure_response($formatted);
    }

    public function get_products($request) {
        if (!function_exists('wc_get_products')) {
            return rest_ensure_response(array());
        }

        $args = array(
            'limit'  => $request->get_param('limit') ? intval($request->get_param('limit')) : 20,
            'status' => 'publish',
        );

        if ($request->get_param('category')) {
            $args['category'] = array(sanitize_text_field($request->get_param('category')));
        }

        $wc_products = wc_get_products($args);
        $result = array();

        foreach ($wc_products as $p) {
            $result[] = $this->format_wc_product($p);
        }

        return rest_ensure_response($result);
    }

    public function get_product_by_slug($request) {
        $slug = sanitize_text_field($request->get_param('slug'));
        $post = get_page_by_path($slug, OBJECT, 'product');
        if (!$post) {
            return new WP_Error('not_found', 'Product not found', array('status' => 404));
        }

        $wc_product = wc_get_product($post->ID);
        return rest_ensure_response($this->format_wc_product($wc_product));
    }

    private function format_wc_product($product) {
        $id = $product->get_id();
        
        $images = array();
        $attachment_ids = array_merge(array($product->get_image_id()), $product->get_gallery_image_ids());
        foreach ($attachment_ids as $aid) {
            if ($aid) {
                $images[] = array(
                    'id'  => $aid,
                    'src' => wp_get_attachment_url($aid),
                    'alt' => get_post_meta($aid, '_wp_attachment_image_alt', true) ?: $product->get_name(),
                );
            }
        }

        return array(
            'id'                => $id,
            'name'              => $product->get_name(),
            'slug'              => $product->get_slug(),
            'price'             => (float) $product->get_price(),
            'regular_price'     => (float) $product->get_regular_price(),
            'sale_price'        => (float) $product->get_sale_price(),
            'on_sale'           => $product->is_on_sale(),
            'short_description' => $product->get_short_description(),
            'description'       => $product->get_description(),
            'rating'            => (float) $product->get_average_rating(),
            'rating_count'      => (int) $product->get_rating_count(),
            'in_stock'          => $product->is_in_stock(),
            'stock_quantity'    => $product->get_stock_quantity() ?: 0,
            'sku'               => $product->get_sku(),
            'images'            => $images,
            'herbal_fields'     => array(
                'botanical_name'       => get_post_meta($id, '_botanical_name', true),
                'common_name'          => get_post_meta($id, '_common_name', true),
                'ingredients'          => array_map('trim', explode(',', get_post_meta($id, '_ingredients', true) ?: '')),
                'composition'          => get_post_meta($id, '_composition', true),
                'product_origin'       => get_post_meta($id, '_product_origin', true),
                'product_form'         => get_post_meta($id, '_product_form', true),
                'net_quantity'         => get_post_meta($id, '_net_quantity', true),
                'directions_for_use'   => get_post_meta($id, '_directions_for_use', true),
                'recommended_usage'    => get_post_meta($id, '_recommended_usage', true),
                'storage_instructions' => get_post_meta($id, '_storage_instructions', true),
                'precautions'          => get_post_meta($id, '_precautions', true),
                'allergen_info'        => get_post_meta($id, '_allergen_info', true),
                'manufacturer'         => get_post_meta($id, '_manufacturer', true),
                'country_of_origin'    => get_post_meta($id, '_country_of_origin', true),
                'manufacturing_date'   => get_post_meta($id, '_manufacturing_date', true),
                'expiry_date'          => get_post_meta($id, '_expiry_date', true),
                'batch_number'         => get_post_meta($id, '_batch_number', true),
                'licence_number'       => get_post_meta($id, '_licence_number', true),
            ),
        );
    }

    public function track_order($request) {
        $order_number = sanitize_text_field($request->get_param('number'));
        $contact      = sanitize_text_field($request->get_param('contact'));

        if (!$order_number) {
            return new WP_Error('missing_param', 'Order number is required', array('status' => 400));
        }

        // Search WooCommerce order
        $orders = wc_get_orders(array(
            'limit' => 1,
            'meta_key' => '_order_number_formatted',
            'meta_value' => $order_number,
        ));

        if (empty($orders)) {
            // Try by ID
            $id = intval(str_replace('MED-', '', $order_number));
            $order = wc_get_order($id);
        } else {
            $order = $orders[0];
        }

        if (!$order) {
            return new WP_Error('not_found', 'Order not found', array('status' => 404));
        }

        return rest_ensure_response(array(
            'id'             => $order->get_id(),
            'order_number'   => $order_number,
            'status'         => $order->get_status(),
            'total'          => (float) $order->get_total(),
            'currency'       => $order->get_currency(),
            'date_created'   => $order->get_date_created()->date('M d, Y'),
            'shipping_carrier' => get_post_meta($order->get_id(), '_shipping_carrier', true) ?: 'Express Air',
            'tracking_id'    => get_post_meta($order->get_id(), '_tracking_number', true),
            'tracking_url'   => get_post_meta($order->get_id(), '_tracking_url', true),
        ));
    }

    public function seed_demo_data($request) {
        $secret = $request->get_param('key');
        if ($secret !== 'mediherbz2026') {
            return new WP_Error('unauthorized', 'Pass key=mediherbz2026 to execute demo seed.', array('status' => 403));
        }

        $created_products = array();
        $created_posts = array();

        // 1. Seed Products if WooCommerce is active
        if (function_exists('wc_get_products') && class_exists('WC_Product_Simple')) {
            $demo_products = array(
                array(
                    'name' => 'Kesh Ratna Herbal Hair Vitalizer Oil',
                    'slug' => 'kesh-ratna-herbal-hair-vitalizer-oil',
                    'price' => 649,
                    'regular_price' => 799,
                    'short' => 'Potent Ayurvedic cold-pressed oil with Bhringraj, Brahmi, and Amla for thick, youthful hair.',
                    'desc' => '<p>Mediherbz Kesh Ratna Hair Oil is formulated using classical Kshir Pak Vidhi. 21 vital herbs are slowly simmered in pure sesame and virgin coconut milk to deliver deep root nutrition, halt premature graying, and stimulate dormant follicles.</p>',
                    'categories' => array('Herbal Hair Care', 'Herbal Oils'),
                    'sku' => 'MED-OIL-KR100',
                    'image' => 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
                    'botanical_name' => 'Eclipta alba & Bacopa monnieri Infusion',
                    'ingredients' => 'Bhringraj, Brahmi, Amla, Neem, Sesame Oil, Virgin Coconut Oil',
                ),
                array(
                    'name' => 'Kumkumadi Radiance Youth Elixir Serum',
                    'slug' => 'kumkumadi-radiance-youth-elixir-serum',
                    'price' => 1250,
                    'regular_price' => 1499,
                    'short' => 'Sacred facial elixir infused with pure Kashmiri saffron, sandalwood and 26 classical herbs.',
                    'desc' => '<p>Experience clinical-grade botanical radiance with our Kumkumadi Youth Elixir. Handcrafted according to the sacred Ashtanga Hridayam recipe to deeply regenerate skin cells, diminish pigmentation, and unveil timeless luminous vitality.</p>',
                    'categories' => array('Herbal Skin Care', 'Natural Beauty'),
                    'sku' => 'MED-SER-KK30',
                    'image' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
                    'botanical_name' => 'Crocus sativus & Santalum album Tailam',
                    'ingredients' => 'Kashmiri Saffron, Red Sandalwood, Lodhra, Manjistha, Lotus',
                ),
                array(
                    'name' => 'Ashwagandha KSM-66 Organic Vitality Capsules',
                    'slug' => 'ashwagandha-ksm66-organic-vitality-capsules',
                    'price' => 549,
                    'regular_price' => 699,
                    'short' => 'Full-spectrum root extract standardized to 5% withanolides for deep calm, vitality & focus.',
                    'desc' => '<p>Harness the restorative power of KSM-66 organic Ashwagandha. Known as the premier adaptogen in Ayurveda, it naturally regulates cortisol levels, elevates physical stamina, and supports mental tranquility.</p>',
                    'categories' => array('Herbal Supplements', 'Wellness Essentials'),
                    'sku' => 'MED-SUP-AG60',
                    'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
                    'botanical_name' => 'Withania somnifera standardized extract',
                    'ingredients' => 'Standardized KSM-66 Ashwagandha Root Extract, BioPerine',
                ),
                array(
                    'name' => 'Triphala Bio-Active Micronized Churna',
                    'slug' => 'triphala-bio-active-micronized-churna',
                    'price' => 299,
                    'regular_price' => 349,
                    'short' => 'Synergistic 1:1:1 ratio of Haritaki, Bibhitaki, and Amalaki for daily gut detox and digestion.',
                    'desc' => '<p>A timeless Ayurvedic master formula. Mediherbz Triphala is micro-pulverized at low temperatures to preserve thermolabile antioxidants and bioflavonoids.</p>',
                    'categories' => array('Herbal Powders', 'Ayurvedic Products'),
                    'sku' => 'MED-POW-TP200',
                    'image' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
                    'botanical_name' => 'Terminalia chebula, Terminalia bellirica & Phyllanthus emblica',
                    'ingredients' => 'Equal proportions of dried Haritaki, Bibhitaki, and Amalaki.',
                ),
                array(
                    'name' => 'Himalayan Tulsi Ginger Herbal Infusion Tea',
                    'slug' => 'himalayan-tulsi-ginger-herbal-infusion-tea',
                    'price' => 399,
                    'regular_price' => 499,
                    'short' => 'Caffeine-free therapeutic blend of Rama, Krishna, Vana Tulsi and sun-dried ginger root.',
                    'desc' => '<p>Brew pure tranquility. Hand-picked wild Tulsi leaves blended with spicy sun-dried mountain ginger to soothe airways, bolster immune defenses, and soothe daily fatigue.</p>',
                    'categories' => array('Herbal Teas', 'Wellness Essentials'),
                    'sku' => 'MED-TEA-TG100',
                    'image' => 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
                    'botanical_name' => 'Ocimum sanctum & Zingiber officinale blend',
                    'ingredients' => 'Rama Tulsi, Krishna Tulsi, Vana Tulsi, Sun-dried Himalayan Ginger',
                ),
                array(
                    'name' => 'Sandalwood & Turmeric Radiance Ubtan Paste',
                    'slug' => 'sandalwood-turmeric-radiance-ubtan-paste',
                    'price' => 499,
                    'regular_price' => 599,
                    'short' => 'Traditional micro-exfoliating bridal paste with raw wild turmeric, Mysore sandalwood, and saffron.',
                    'desc' => '<p>Revive dull skin with authentic ceremonial Ayurvedic Ubtan. Naturally lifts dead epidermal cells, clarifies blemishes, and restores an even, luminous complexion.</p>',
                    'categories' => array('Herbal Skin Care', 'Natural Beauty'),
                    'sku' => 'MED-UBT-ST150',
                    'image' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
                    'botanical_name' => 'Santalum album & Curcuma aromatica',
                    'ingredients' => 'Mysore Sandalwood powder, Wild Kasturi Manjal, Chickpea flour',
                ),
                array(
                    'name' => 'Total Youth & Glow Complete Herbal Combo',
                    'slug' => 'total-youth-glow-complete-herbal-combo-kit',
                    'price' => 2199,
                    'regular_price' => 2797,
                    'short' => 'Our flagship 3-step ritual: Kesh Ratna Hair Oil, Kumkumadi Youth Elixir, and Sandalwood Ubtan in a luxury gift box.',
                    'desc' => '<p>The ultimate holistic rejuvenation gift. Features our three most celebrated preparations packaged in a keepsake eco-friendly wooden box.</p>',
                    'categories' => array('Herbal Kits & Combos', 'Ayurvedic Products'),
                    'sku' => 'MED-KIT-TYG03',
                    'image' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                    'botanical_name' => 'Sacred Tri-Dosha Holistic Wellness Set',
                    'ingredients' => 'Kesh Ratna (100ml), Kumkumadi (30ml), Sandalwood Ubtan (150g)',
                ),
            );

            foreach ($demo_products as $dp) {
                // Check if already exists
                $existing = get_page_by_path($dp['slug'], OBJECT, 'product');
                if ($existing) {
                    $created_products[] = $dp['name'] . ' (already exists)';
                    continue;
                }

                $product = new WC_Product_Simple();
                $product->set_name($dp['name']);
                $product->set_slug($dp['slug']);
                $product->set_regular_price((string) $dp['regular_price']);
                $product->set_sale_price((string) $dp['price']);
                $product->set_price((string) $dp['price']);
                $product->set_short_description($dp['short']);
                $product->set_description($dp['desc']);
                $product->set_sku($dp['sku']);
                $product->set_manage_stock(true);
                $product->set_stock_quantity(50);
                $product->set_stock_status('instock');
                $product->set_status('publish');

                // Categories
                $cat_ids = array();
                foreach ($dp['categories'] as $cat_name) {
                    $term = term_exists($cat_name, 'product_cat');
                    if (!$term) {
                        $term = wp_insert_term($cat_name, 'product_cat');
                    }
                    if (!is_wp_error($term) && isset($term['term_id'])) {
                        $cat_ids[] = intval($term['term_id']);
                    }
                }
                if (!empty($cat_ids)) {
                    $product->set_category_ids($cat_ids);
                }

                $pid = $product->save();
                if ($pid) {
                    update_post_meta($pid, '_mediherbz_botanical_name', $dp['botanical_name']);
                    update_post_meta($pid, '_mediherbz_ingredients', $dp['ingredients']);
                    update_post_meta($pid, '_mediherbz_directions_for_use', 'Apply as directed on product packaging.');
                    $created_products[] = $dp['name'];
                }
            }
        }

        // 2. Seed Blog Posts
        $demo_blogs = array(
            array(
                'title' => 'The Ancient Secret of Kumkumadi: How Kashmiri Saffron Restores Natural Glow',
                'slug' => 'secret-of-kumkumadi-kashmiri-saffron-glow',
                'excerpt' => 'Discover the science and sacred Ayurvedic origins of Kumkumadi Tailam, the revered botanical oil that combats dullness and promotes cellular renewal.',
                'content' => '<p>Kumkumadi Tailam has been celebrated in classic Ayurvedic treatises such as the <em>Ashtanga Hridayam</em> for over a thousand years. Regarded as "liquid gold" for the complexion, this unique botanical preparation brings together the purity of Kashmiri saffron, red sandalwood, and over twenty-four potent herbal extracts.</p><h3>Why Kashmiri Saffron is Unrivaled</h3><p>The crocin content in pure high-altitude Kashmiri saffron gives it extraordinary anti-inflammatory and antioxidant properties. When combined with cooling sandalwood and nourishing goat milk, it balances pitta dosha, soothing redness and deeply revitalizing UV-stressed skin.</p><h3>How to Incorporate Kumkumadi Into Your Night Ritual</h3><p>A few warm drops massaged into damp skin before sleep works synergistically with the skin\'s circadian repair cycle, allowing you to wake up to a supple, luminous, and youthful radiance without relying on synthetic chemicals.</p>',
                'category' => 'Natural Beauty',
            ),
            array(
                'title' => 'Bhringraj: The King of Hair Herbs and the Kshir Pak Vidhi Process',
                'slug' => 'bhringraj-king-of-hair-herbs-kshir-pak-vidhi',
                'excerpt' => 'Why modern chemical serums fall short compared to traditional slow-cooked herbal hair oils infused via ancient Ayurvedic milk-decoction methods.',
                'content' => '<p>In Sanskrit, Bhringraj translates to "the ruler of bees", referencing its ability to attract and revitalize life. In Ayurvedic trichology, it is revered as the undisputed king for strengthening hair follicles from root to tip.</p><h3>The Art of Kshir Pak Vidhi</h3><p>Unlike industrial oils made by simply adding artificial fragrance to mineral oil, authentic Mediherbz hair vitalizers are crafted through Kshir Pak Vidhi. Fresh botanical herbs are simmered gently with milk and pure sesame oil for over 72 hours until all water evaporates and only the herb-infused lipid core remains.</p>',
                'category' => 'Hair Care',
            ),
            array(
                'title' => 'Ashwagandha for Modern Stress: Grounding the Mind and Boosting Vitality',
                'slug' => 'ashwagandha-modern-stress-grounding-vitality',
                'excerpt' => 'An adaptogenic guide to regulating cortisol, enhancing stamina, and cultivating balanced daily energy without caffeine crashes.',
                'content' => '<p>Living in today’s hyper-connected, high-demand world constantly activates our sympathetic nervous system. In Ayurvedic medicine, this manifests as an aggravated Vata dosha—leading to restless sleep, mental fatigue, and diminished physical resilience.</p><h3>How Adaptogens Function</h3><p>Ashwagandha (Withania somnifera) is classified as a Rasayana, an herb that fosters longevity and systemic revitalization. Modern clinical studies confirm its efficacy in regulating serum cortisol levels and supporting deep restorative REM sleep.</p>',
                'category' => 'Herbal Living',
            ),
        );

        foreach ($demo_blogs as $db) {
            $existing = get_page_by_path($db['slug'], OBJECT, 'post');
            if ($existing) {
                $created_posts[] = $db['title'] . ' (already exists)';
                continue;
            }

            $cat_id = 0;
            $term = term_exists($db['category'], 'category');
            if (!$term) {
                $term = wp_insert_term($db['category'], 'category');
            }
            if (!is_wp_error($term) && isset($term['term_id'])) {
                $cat_id = intval($term['term_id']);
            }

            $post_id = wp_insert_post(array(
                'post_title'    => $db['title'],
                'post_name'     => $db['slug'],
                'post_excerpt'  => $db['excerpt'],
                'post_content'  => $db['content'],
                'post_status'   => 'publish',
                'post_type'     => 'post',
                'post_category' => $cat_id ? array($cat_id) : array(),
            ));

            if ($post_id && !is_wp_error($post_id)) {
                $created_posts[] = $db['title'];
            }
        }

        return rest_ensure_response(array(
            'success'          => true,
            'message'          => 'Demo data successfully seeded into WordPress!',
            'products_created' => $created_products,
            'posts_created'    => $created_posts,
        ));
    }

    public function link_images_to_products($request) {
        $secret = $request->get_param('key');
        if ($secret !== 'mediherbz2026') {
            return new WP_Error('unauthorized', 'Pass key=mediherbz2026 to link media images.', array('status' => 403));
        }

        // Map product slugs to media slugs
        $map = array(
            'kesh-ratna-herbal-hair-vitalizer-oil'       => 'product-kesh-ratna-hair-oil',
            'kumkumadi-radiance-youth-elixir-serum'      => 'product-kumkumadi-radiance-elixir',
            'ashwagandha-ksm66-organic-vitality-capsules' => 'product-ashwagandha-capsules',
            'triphala-bio-active-micronized-churna'       => 'product-triphala-churna',
            'himalayan-tulsi-ginger-herbal-infusion-tea' => 'product-tulsi-ginger-tea',
            'sandalwood-turmeric-radiance-ubtan-paste'   => 'product-sandalwood-turmeric-ubtan',
            'total-youth-glow-complete-herbal-combo-kit' => 'product-total-youth-combo-kit',
        );

        // Map blog slugs to media slugs
        $blog_map = array(
            'secret-of-kumkumadi-kashmiri-saffron-glow' => 'ingredient-kashmiri-saffron',
            'bhringraj-king-of-hair-herbs-kshir-pak-vidhi' => 'ingredient-herbal-leaves-ayurveda',
            'ashwagandha-modern-stress-grounding-vitality' => 'product-ashwagandha-capsules',
        );

        $results = array();

        // 1. Link Products
        foreach ($map as $prod_slug => $img_slug) {
            $product_post = get_page_by_path($prod_slug, OBJECT, 'product');
            $media_post = get_page_by_path($img_slug, OBJECT, 'attachment');

            if ($product_post && $media_post) {
                set_post_thumbnail($product_post->ID, $media_post->ID);
                $results[] = "Linked {$img_slug} (ID {$media_post->ID}) to product {$prod_slug} (ID {$product_post->ID})";
            } else {
                $results[] = "Could not link {$img_slug} to {$prod_slug} (Product: " . ($product_post ? 'found' : 'missing') . ", Media: " . ($media_post ? 'found' : 'missing') . ")";
            }
        }

        // 2. Link Blog Posts
        foreach ($blog_map as $b_slug => $img_slug) {
            $b_post = get_page_by_path($b_slug, OBJECT, 'post');
            $media_post = get_page_by_path($img_slug, OBJECT, 'attachment');

            if ($b_post && $media_post) {
                set_post_thumbnail($b_post->ID, $media_post->ID);
                $results[] = "Linked {$img_slug} (ID {$media_post->ID}) to post {$b_slug} (ID {$b_post->ID})";
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'All product and blog featured images linked successfully!',
            'details' => $results,
        ));
    }
}

