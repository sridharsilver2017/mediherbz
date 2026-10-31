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
}

