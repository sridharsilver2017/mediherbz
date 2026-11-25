<?php
if (!defined('ABSPATH')) {
    exit;
}

class Mediherbz_REST_API {
    private $namespace = 'mediherbz/v1';

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
        add_filter('rest_pre_serve_request', array($this, 'prevent_dynamic_caching'), 10, 4);
        add_action('woocommerce_new_order', array($this, 'clear_orders_cache'));
        add_action('woocommerce_order_status_changed', array($this, 'clear_orders_cache'));
    }

    public function clear_orders_cache() {
        delete_transient('mediherbz_orders_stats');
        global $wpdb;
        $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_mediherbz_orders_%' OR option_name LIKE '_transient_timeout_mediherbz_orders_%' OR option_name LIKE '_transient_mediherbz_cust_%' OR option_name LIKE '_transient_timeout_mediherbz_cust_%'");
    }

    public function prevent_dynamic_caching($served, $result, $request, $server) {
        $route = $request ? $request->get_route() : '';
        if (
            strpos($route, '/mediherbz/v1/admin/orders') !== false ||
            strpos($route, '/mediherbz/v1/orders/track') !== false ||
            strpos($route, '/mediherbz/v1/customer/orders') !== false ||
            strpos($route, '/mediherbz/v1/customer/wishlist') !== false
        ) {
            header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
            header('Pragma: no-cache');
            header('Expires: 0');
        }
        return $served;
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
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'get_settings'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array($this, 'update_settings'),
                'permission_callback' => '__return_true',
            ),
        ));

        // Admin Email & Password Authentication
        register_rest_route($this->namespace, '/auth/admin-login', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'admin_login'),
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

        // Create order (Razorpay or COD)
        register_rest_route($this->namespace, '/orders/create', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'create_order'),
            'permission_callback' => '__return_true',
        ));

        // Customer order history
        register_rest_route($this->namespace, '/customer/orders', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_customer_orders'),
            'permission_callback' => '__return_true',
        ));

        // Customer Authentication & Management
        register_rest_route($this->namespace, '/customer/login', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'customer_login'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route($this->namespace, '/customer/register', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'customer_register'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route($this->namespace, '/customer/profile', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'update_customer_profile'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route($this->namespace, '/customer/address', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'save_customer_address'),
            'permission_callback' => '__return_true',
        ));

        // Customer Wishlist (Cloud Sync)
        register_rest_route($this->namespace, '/customer/wishlist', array(
            array(
                'methods'             => 'GET',
                'callback'            => array($this, 'get_customer_wishlist'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array($this, 'save_customer_wishlist'),
                'permission_callback' => '__return_true',
            ),
        ));

        // Admin Orders list
        register_rest_route($this->namespace, '/admin/orders', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_admin_orders'),
            'permission_callback' => '__return_true',
        ));

        // Admin update order status
        register_rest_route($this->namespace, '/admin/orders/update-status', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'update_admin_order_status'),
            'permission_callback' => '__return_true',
        ));

        // Admin update order tracking
        register_rest_route($this->namespace, '/admin/orders/update-tracking', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'update_admin_order_tracking'),
            'permission_callback' => '__return_true',
        ));

        // Coupons validation
        register_rest_route($this->namespace, '/coupons/validate', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'validate_coupon'),
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
        if (!headers_sent()) {
            header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
            header('Pragma: no-cache');
            header('Expires: 0');
        }
        $settings = get_option('mediherbz_brand_settings', array());
        return rest_ensure_response($settings);
    }

    public function check_admin_permission($request) {
        return $this->verify_admin_token($request);
    }

    private function verify_admin_token($request) {
        $auth_header = $request->get_header('authorization');
        if (empty($auth_header)) {
            return false;
        }

        if (preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
            $token = trim($matches[1]);
            $decoded = base64_decode($token, true);
            if (!$decoded) return false;
            $parts = explode('|', $decoded);
            if (count($parts) === 3) {
                list($user_id, $issued_at, $signature) = $parts;
                // Check token expiration (7 days)
                if (time() - (int)$issued_at > 7 * DAY_IN_SECONDS) {
                    return false;
                }
                $secret = defined('AUTH_KEY') ? AUTH_KEY : 'mediherbz_secret_key_2026';
                $expected = hash_hmac('sha256', $user_id . '|' . $issued_at, $secret);
                if (hash_equals($expected, $signature)) {
                    $user = get_userdata((int)$user_id);
                    return ($user && (user_can($user, 'manage_options') || in_array('administrator', (array)$user->roles, true)));
                }
            }
        }
        return false;
    }

    public function admin_login(WP_REST_Request $request) {
        $params = $request->get_json_params();
        if (empty($params)) {
            $params = $request->get_body_params();
        }

        $email_or_user = '';
        if (!empty($params['email'])) {
            $email_or_user = sanitize_text_field($params['email']);
        } elseif (!empty($params['username'])) {
            $email_or_user = sanitize_text_field($params['username']);
        }
        $password = isset($params['password']) ? (string)$params['password'] : '';

        if (empty($email_or_user) || empty($password)) {
            return new WP_Error('missing_fields', 'Please provide email or username and password.', array('status' => 400));
        }

        $user = wp_authenticate($email_or_user, $password);

        if (is_wp_error($user)) {
            return new WP_Error('invalid_credentials', 'Invalid email or password.', array('status' => 401));
        }

        if (!user_can($user, 'manage_options') && !in_array('administrator', (array)$user->roles, true) && !in_array('shop_manager', (array)$user->roles, true)) {
            return new WP_Error('forbidden', 'Access denied. Administrator privileges required.', array('status' => 403));
        }

        $issued_at = time();
        $payload   = $user->ID . '|' . $issued_at;
        $secret    = defined('AUTH_KEY') ? AUTH_KEY : 'mediherbz_secret_key_2026';
        $signature = hash_hmac('sha256', $payload, $secret);
        $token     = base64_encode($payload . '|' . $signature);

        return rest_ensure_response(array(
            'success'  => true,
            'token'    => $token,
            'username' => $user->user_login,
            'user'     => array(
                'id'           => $user->ID,
                'email'        => $user->user_email,
                'display_name' => $user->display_name ?: $user->user_login,
                'role'         => !empty($user->roles) ? $user->roles[0] : 'administrator',
            ),
        ));
    }

    public function update_settings(WP_REST_Request $request) {
        $params = $request->get_json_params();
        if (empty($params)) {
            $params = $request->get_body_params();
        }

        $existing = get_option('mediherbz_brand_settings', array());
        $merged   = array_merge($existing, $params);
        update_option('mediherbz_brand_settings', $merged);

        return rest_ensure_response(array(
            'success'  => true,
            'settings' => $merged,
        ));
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
            if ($t->slug === 'uncategorized') continue;
            $thumb_id = get_term_meta($t->term_id, 'thumbnail_id', true);
            $img_url = $thumb_id ? wp_get_attachment_url($thumb_id) : '';
            if (!$img_url) {
                // Check if matching upload file exists
                $img_url = home_url('/wp-content/uploads/2026/11/category-' . $t->slug . '.jpg');
            }
            $formatted[] = array(
                'id'          => $t->term_id,
                'name'        => $t->name,
                'slug'        => $t->slug,
                'count'       => $t->count,
                'description' => $t->description,
                'image'       => $img_url,
            );
        }
        return rest_ensure_response($formatted);
    }

    public function get_products($request) {
        $result = array();

        if (function_exists('wc_get_products')) {
            $args = array(
                'limit'  => $request->get_param('limit') ? intval($request->get_param('limit')) : 20,
                'status' => 'publish',
            );

            if ($request->get_param('category')) {
                $args['category'] = array(sanitize_text_field($request->get_param('category')));
            }

            $wc_products = wc_get_products($args);
            if (!empty($wc_products)) {
                foreach ($wc_products as $p) {
                    $result[] = $this->format_wc_product($p);
                }
            }
        }

        // Fallback: If wc_get_products returns empty or not synced yet, query product post type directly
        if (empty($result)) {
            $query_args = array(
                'post_type'      => 'product',
                'post_status'    => 'publish',
                'posts_per_page' => $request->get_param('limit') ? intval($request->get_param('limit')) : 20,
            );
            $posts = get_posts($query_args);
            foreach ($posts as $post) {
                if (function_exists('wc_get_product')) {
                    $wc_p = wc_get_product($post->ID);
                    if ($wc_p) {
                        $result[] = $this->format_wc_product($wc_p);
                        continue;
                    }
                }
                // Fallback raw post format
                $img_id = get_post_thumbnail_id($post->ID);
                $result[] = array(
                    'id'                => $post->ID,
                    'name'              => $post->post_title,
                    'slug'              => $post->post_name,
                    'price'             => (float) get_post_meta($post->ID, '_price', true) ?: 0,
                    'regular_price'     => (float) get_post_meta($post->ID, '_regular_price', true) ?: 0,
                    'sale_price'        => (float) get_post_meta($post->ID, '_sale_price', true) ?: 0,
                    'on_sale'           => !empty(get_post_meta($post->ID, '_sale_price', true)),
                    'short_description' => $post->post_excerpt,
                    'description'       => $post->post_content,
                    'in_stock'          => get_post_meta($post->ID, '_stock_status', true) !== 'outofstock',
                    'images'            => $img_id ? array(array('id' => $img_id, 'src' => wp_get_attachment_url($img_id), 'alt' => $post->post_title)) : array(),
                    'categories'        => array(),
                    'herbal_fields'     => array(
                        'botanical_name'      => get_post_meta($post->ID, '_mediherbz_botanical_name', true) ?: '',
                        'ingredients'         => explode(',', get_post_meta($post->ID, '_mediherbz_ingredients', true) ?: ''),
                        'directions_for_use'  => get_post_meta($post->ID, '_mediherbz_directions_for_use', true) ?: '',
                    ),
                );
            }
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

        $order = null;

        // 1. Try by numeric ID extracted from string (e.g. MED-56 or 56 or #56)
        $clean_id = intval(preg_replace('/[^0-9]/', '', $order_number));
        if ($clean_id > 0) {
            $order = function_exists('wc_get_order') ? wc_get_order($clean_id) : null;
        }

        // 2. Try by custom formatted order number
        if (!$order && function_exists('wc_get_orders')) {
            $orders = wc_get_orders(array(
                'limit' => 1,
                'meta_key' => '_order_number_formatted',
                'meta_value' => $order_number,
            ));
            if (!empty($orders)) {
                $order = $orders[0];
            }
        }

        if (!$order) {
            return new WP_Error('not_found', 'Order not found', array('status' => 404));
        }

        $carrier = ($order->get_meta('_shipping_carrier') ?: get_post_meta($order->get_id(), '_shipping_carrier', true)) ?: 'Express Air';
        $tracking_id = $order->get_meta('_tracking_number') ?: get_post_meta($order->get_id(), '_tracking_number', true) ?: '';
        $tracking_url = $order->get_meta('_tracking_url') ?: get_post_meta($order->get_id(), '_tracking_url', true) ?: '';

        return rest_ensure_response(array(
            'id'               => $order->get_id(),
            'order_number'     => 'MED-' . $order->get_id(),
            'status'           => $order->get_status(),
            'total'            => (float) $order->get_total(),
            'currency'         => $order->get_currency(),
            'date_created'     => $order->get_date_created() ? $order->get_date_created()->date('M d, Y') : current_time('M d, Y'),
            'shipping_carrier' => $carrier,
            'tracking_id'      => $tracking_id,
            'tracking_url'     => $tracking_url,
        ));
    }

    public function create_order($request) {
        $params         = $request->get_json_params();
        $customer       = $params['customer'] ?? array();
        $items          = $params['items'] ?? array();
        $payment_method = sanitize_text_field($params['payment_method'] ?? 'cod');
        $payment_id     = sanitize_text_field($params['payment_id'] ?? '');
        $coupon         = sanitize_text_field($params['coupon'] ?? '');
        $discount_total = floatval($params['discount_total'] ?? 0);
        $shipping_total = floatval($params['shipping_total'] ?? 0);
        $total          = floatval($params['total'] ?? 0);

        if (empty($items)) {
            return new WP_Error('empty_cart', 'Cart items are required to create an order.', array('status' => 400));
        }

        if (!function_exists('wc_create_order')) {
            return new WP_Error('wc_missing', 'WooCommerce is not available.', array('status' => 500));
        }

        $order = wc_create_order();

        foreach ($items as $item) {
            $pid = intval($item['product']['id'] ?? 0);
            $qty = intval($item['quantity'] ?? 1);
            $price = floatval($item['variation']['price'] ?? $item['product']['price'] ?? 0);

            $wc_prod = wc_get_product($pid);
            if ($wc_prod) {
                $order->add_product($wc_prod, $qty, array(
                    'subtotal' => $price * $qty,
                    'total'    => $price * $qty,
                ));
            }
        }

        $address = array(
            'first_name' => sanitize_text_field($customer['firstName'] ?? ''),
            'last_name'  => sanitize_text_field($customer['lastName'] ?? ''),
            'email'      => sanitize_email($customer['email'] ?? ''),
            'phone'      => sanitize_text_field($customer['phone'] ?? ''),
            'address_1'  => sanitize_text_field($customer['address'] ?? ''),
            'city'       => sanitize_text_field($customer['city'] ?? ''),
            'state'      => sanitize_text_field($customer['state'] ?? ''),
            'postcode'   => sanitize_text_field($customer['postcode'] ?? ''),
            'country'    => 'IN',
        );
        $order->set_address($address, 'billing');
        $order->set_address($address, 'shipping');

        if ($shipping_total > 0 && class_exists('WC_Order_Item_Shipping')) {
            $item_shipping = new WC_Order_Item_Shipping();
            $item_shipping->set_method_title('Express Air Delivery');
            $item_shipping->set_total($shipping_total);
            $order->add_item($item_shipping);
        }

        if ($discount_total > 0) {
            $order->set_discount_total($discount_total);
        }

        if ($payment_method === 'razorpay') {
            $order->set_payment_method('razorpay');
            $order->set_payment_method_title('Razorpay (Online Payment)');
            $order->payment_complete($payment_id);
            $order->update_status('processing', 'Paid via Razorpay: ' . $payment_id);
        } else {
            $order->set_payment_method('cod');
            $order->set_payment_method_title('Cash on Delivery (COD)');
            $order->update_status('processing', 'Cash on Delivery order placed via Mediherbz Storefront');
        }

        if (!empty($customer['notes'])) {
            $order->set_customer_note(sanitize_textarea_field($customer['notes']));
        }

        $order->calculate_totals();

        $order_id = $order->get_id();
        $order_number = 'MED-' . $order_id;

        $order->update_meta_data('_order_number_formatted', $order_number);
        if ($payment_id) {
            $order->update_meta_data('_razorpay_payment_id', $payment_id);
        }
        $order->save();
        $this->clear_orders_cache();

        // Trigger WooCommerce core customer and admin email notifications
        if (function_exists('WC') && WC()->mailer()) {
            $emails = WC()->mailer()->get_emails();
            if (!empty($emails)) {
                if (isset($emails['WC_Email_New_Order'])) {
                    $emails['WC_Email_New_Order']->trigger($order_id, $order);
                }
                if (isset($emails['WC_Email_Customer_Processing_Order'])) {
                    $emails['WC_Email_Customer_Processing_Order']->trigger($order_id, $order);
                }
            }
        }

        return rest_ensure_response(array(
            'success'          => true,
            'order_id'         => $order_id,
            'order_number'     => $order_number,
            'payment_method'   => $payment_method,
            'total'            => (float) $order->get_total(),
            'date_created'     => current_time('mysql'),
            'message'          => 'Order created successfully in WooCommerce.',
        ));
    }

    public function customer_login(WP_REST_Request $request) {
        $params        = $request->get_json_params() ?: $request->get_body_params();
        $email_or_user = !empty($params['email']) ? sanitize_text_field($params['email']) : (!empty($params['username']) ? sanitize_text_field($params['username']) : '');
        $password      = isset($params['password']) ? (string)$params['password'] : '';

        if (empty($email_or_user)) {
            return new WP_Error('missing_fields', 'Please enter your email address.', array('status' => 400));
        }

        // 1. Password-based authentication
        if (!empty($password)) {
            $user = wp_authenticate($email_or_user, $password);
            if (!is_wp_error($user)) {
                $issued_at = time();
                $payload   = $user->ID . '|' . $issued_at;
                $secret    = defined('AUTH_KEY') ? AUTH_KEY : 'mediherbz_secret_key_2026';
                $signature = hash_hmac('sha256', $payload, $secret);
                $token     = base64_encode($payload . '|' . $signature);

                $billing_address = array(
                    'first_name' => get_user_meta($user->ID, 'billing_first_name', true) ?: $user->first_name,
                    'last_name'  => get_user_meta($user->ID, 'billing_last_name', true) ?: $user->last_name,
                    'email'      => $user->user_email,
                    'phone'      => get_user_meta($user->ID, 'billing_phone', true) ?: '',
                    'address_1'  => get_user_meta($user->ID, 'billing_address_1', true) ?: '',
                    'city'       => get_user_meta($user->ID, 'billing_city', true) ?: '',
                    'state'      => get_user_meta($user->ID, 'billing_state', true) ?: '',
                    'postcode'   => get_user_meta($user->ID, 'billing_postcode', true) ?: '',
                    'country'    => 'India',
                );

                $cust_orders = $this->get_customer_orders_array($user->user_email, get_user_meta($user->ID, 'billing_phone', true) ?: '');
                $raw_wishlist = get_user_meta($user->ID, 'mediherbz_wishlist', true);
                $wishlist_ids = is_array($raw_wishlist) ? array_values(array_map('intval', $raw_wishlist)) : array();

                return rest_ensure_response(array(
                    'success'  => true,
                    'token'    => $token,
                    'profile'  => array(
                        'id'            => $user->ID,
                        'first_name'    => $user->first_name ?: $user->display_name,
                        'last_name'     => $user->last_name ?: '',
                        'email'         => $user->user_email,
                        'phone'         => get_user_meta($user->ID, 'billing_phone', true) ?: '',
                        'dosha'         => get_user_meta($user->ID, 'mediherbz_dosha', true) ?: 'Tridoshic',
                        'member_since'  => date('F Y', strtotime($user->user_registered)),
                        'wellness_goal' => get_user_meta($user->ID, 'mediherbz_goal', true) ?: 'Holistic Herbal Wellness',
                    ),
                    'billing'  => $billing_address,
                    'orders'   => $cust_orders,
                    'wishlist' => $wishlist_ids,
                ));
            } else {
                return new WP_Error('invalid_credentials', 'Invalid email or password. Please try again.', array('status' => 401));
            }
        }

        // 2. Seamless customer lookup by email
        $existing_user = get_user_by('email', $email_or_user) ?: get_user_by('login', $email_or_user);
        $orders        = function_exists('wc_get_orders') ? wc_get_orders(array('billing_email' => $email_or_user, 'limit' => 1)) : array();

        $first_name = '';
        $last_name  = '';
        $phone      = '';
        $billing    = null;

        if ($existing_user) {
            $first_name = $existing_user->first_name ?: $existing_user->display_name;
            $last_name  = $existing_user->last_name ?: '';
            $phone      = get_user_meta($existing_user->ID, 'billing_phone', true) ?: '';
            $billing    = array(
                'first_name' => $first_name,
                'last_name'  => $last_name,
                'email'      => $existing_user->user_email,
                'phone'      => $phone,
                'address_1'  => get_user_meta($existing_user->ID, 'billing_address_1', true) ?: '',
                'city'       => get_user_meta($existing_user->ID, 'billing_city', true) ?: '',
                'state'      => get_user_meta($existing_user->ID, 'billing_state', true) ?: '',
                'postcode'   => get_user_meta($existing_user->ID, 'billing_postcode', true) ?: '',
                'country'    => 'India',
            );
        } elseif (!empty($orders)) {
            $o          = $orders[0];
            $first_name = $o->get_billing_first_name() ?: 'Ayurvedic';
            $last_name  = $o->get_billing_last_name() ?: 'Customer';
            $phone      = $o->get_billing_phone() ?: '';
            $billing    = array(
                'first_name' => $first_name,
                'last_name'  => $last_name,
                'email'      => $email_or_user,
                'phone'      => $phone,
                'address_1'  => $o->get_billing_address_1() ?: '',
                'city'       => $o->get_billing_city() ?: '',
                'state'      => $o->get_billing_state() ?: '',
                'postcode'   => $o->get_billing_postcode() ?: '',
                'country'    => 'India',
            );
        } else {
            $first_name = ucfirst(explode('@', $email_or_user)[0]);
            $last_name  = '';
        }

        $cust_orders = $this->get_customer_orders_array($email_or_user, $phone);
        $raw_wishlist = $existing_user ? get_user_meta($existing_user->ID, 'mediherbz_wishlist', true) : array();
        $wishlist_ids = is_array($raw_wishlist) ? array_values(array_map('intval', $raw_wishlist)) : array();

        return rest_ensure_response(array(
            'success'  => true,
            'token'    => base64_encode($email_or_user . '|' . time()),
            'profile'  => array(
                'id'            => $existing_user ? $existing_user->ID : 0,
                'first_name'    => $first_name ?: 'Ayurvedic',
                'last_name'     => $last_name ?: '',
                'email'         => $email_or_user,
                'phone'         => $phone,
                'dosha'         => $existing_user ? (get_user_meta($existing_user->ID, 'mediherbz_dosha', true) ?: 'Tridoshic') : 'Tridoshic',
                'member_since'  => $existing_user ? date('F Y', strtotime($existing_user->user_registered)) : date('F Y'),
                'wellness_goal' => 'Holistic Herbal Wellness',
            ),
            'billing'  => $billing,
            'orders'   => $cust_orders,
            'wishlist' => $wishlist_ids,
        ));
    }

    public function customer_register(WP_REST_Request $request) {
        $params     = $request->get_json_params() ?: $request->get_body_params();
        $email      = sanitize_email($params['email'] ?? '');
        $password   = isset($params['password']) ? (string)$params['password'] : '';
        $first_name = sanitize_text_field($params['first_name'] ?? '');
        $last_name  = sanitize_text_field($params['last_name'] ?? '');
        $phone      = sanitize_text_field($params['phone'] ?? '');

        if (empty($email) || !is_email($email)) {
            return new WP_Error('invalid_email', 'Please provide a valid email address.', array('status' => 400));
        }

        if (email_exists($email)) {
            if (!empty($password)) {
                $user = wp_authenticate($email, $password);
                if (!is_wp_error($user)) {
                    return $this->customer_login($request);
                }
            }
            return new WP_Error('email_exists', 'An account with this email already exists. Please sign in.', array('status' => 409));
        }

        $username = sanitize_user(explode('@', $email)[0]);
        if (username_exists($username)) {
            $username .= '_' . wp_rand(100, 999);
        }

        $password_to_set = !empty($password) ? $password : wp_generate_password(12);
        $user_id         = wp_create_user($username, $password_to_set, $email);

        if (is_wp_error($user_id)) {
            return new WP_Error('registration_failed', $user_id->get_error_message(), array('status' => 500));
        }

        wp_update_user(array(
            'ID'           => $user_id,
            'first_name'   => $first_name,
            'last_name'    => $last_name,
            'display_name' => trim($first_name . ' ' . $last_name) ?: $username,
            'role'         => 'customer',
        ));

        if (!empty($phone)) {
            update_user_meta($user_id, 'billing_phone', $phone);
        }
        update_user_meta($user_id, 'mediherbz_dosha', sanitize_text_field($params['dosha'] ?? 'Tridoshic'));

        $issued_at = time();
        $payload   = $user_id . '|' . $issued_at;
        $secret    = defined('AUTH_KEY') ? AUTH_KEY : 'mediherbz_secret_key_2026';
        $signature = hash_hmac('sha256', $payload, $secret);
        $token     = base64_encode($payload . '|' . $signature);

        return rest_ensure_response(array(
            'success' => true,
            'token'   => $token,
            'profile' => array(
                'id'            => $user_id,
                'first_name'    => $first_name ?: $username,
                'last_name'     => $last_name,
                'email'         => $email,
                'phone'         => $phone,
                'dosha'         => sanitize_text_field($params['dosha'] ?? 'Tridoshic'),
                'member_since'  => date('F Y'),
                'wellness_goal' => 'Holistic Herbal Wellness',
            ),
        ));
    }

    public function update_customer_profile(WP_REST_Request $request) {
        $params     = $request->get_json_params() ?: $request->get_body_params();
        $email      = sanitize_email($params['email'] ?? '');
        $first_name = sanitize_text_field($params['first_name'] ?? '');
        $last_name  = sanitize_text_field($params['last_name'] ?? '');
        $phone      = sanitize_text_field($params['phone'] ?? '');
        $dosha      = sanitize_text_field($params['dosha'] ?? '');

        if ($email) {
            $user = get_user_by('email', $email);
            if ($user) {
                if ($first_name || $last_name) {
                    wp_update_user(array(
                        'ID'         => $user->ID,
                        'first_name' => $first_name ?: $user->first_name,
                        'last_name'  => $last_name ?: $user->last_name,
                    ));
                }
                if ($phone) {
                    update_user_meta($user->ID, 'billing_phone', $phone);
                }
                if ($dosha) {
                    update_user_meta($user->ID, 'mediherbz_dosha', $dosha);
                }
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Profile updated successfully.',
        ));
    }

    public function save_customer_address(WP_REST_Request $request) {
        $params = $request->get_json_params() ?: $request->get_body_params();
        $email  = sanitize_email($params['email'] ?? '');

        if ($email) {
            $user = get_user_by('email', $email);
            if ($user) {
                if (!empty($params['first_name'])) update_user_meta($user->ID, 'billing_first_name', sanitize_text_field($params['first_name']));
                if (!empty($params['last_name']))  update_user_meta($user->ID, 'billing_last_name', sanitize_text_field($params['last_name']));
                if (!empty($params['phone']))      update_user_meta($user->ID, 'billing_phone', sanitize_text_field($params['phone']));
                if (!empty($params['address_1']))  update_user_meta($user->ID, 'billing_address_1', sanitize_text_field($params['address_1']));
                if (!empty($params['city']))       update_user_meta($user->ID, 'billing_city', sanitize_text_field($params['city']));
                if (!empty($params['state']))      update_user_meta($user->ID, 'billing_state', sanitize_text_field($params['state']));
                if (!empty($params['postcode']))   update_user_meta($user->ID, 'billing_postcode', sanitize_text_field($params['postcode']));
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Address saved successfully.',
        ));
    }

    public function get_customer_wishlist(WP_REST_Request $request) {
        $email = sanitize_email($request->get_param('email'));
        if (!$email) {
            return rest_ensure_response(array('success' => true, 'product_ids' => array(), 'items' => array()));
        }

        $user = get_user_by('email', $email) ?: get_user_by('login', $email);
        $product_ids = array();
        if ($user) {
            $raw = get_user_meta($user->ID, 'mediherbz_wishlist', true);
            if (is_array($raw)) {
                $product_ids = array_values(array_unique(array_filter(array_map('intval', $raw))));
            }
        }
        if (empty($product_ids)) {
            $raw = get_option('mediherbz_wishlist_' . md5(strtolower($email)), array());
            if (is_array($raw)) {
                $product_ids = array_values(array_unique(array_filter(array_map('intval', $raw))));
            }
        }

        // Format live product data from WooCommerce
        $items = array();
        if (!empty($product_ids) && function_exists('wc_get_product')) {
            foreach ($product_ids as $pid) {
                $product = wc_get_product(intval($pid));
                if ($product && $product->exists() && $product->get_status() === 'publish') {
                    $items[] = $this->format_wc_product($product);
                }
            }
        }

        return rest_ensure_response(array(
            'success'     => true,
            'product_ids' => $product_ids,
            'items'       => $items,
        ));
    }

    public function save_customer_wishlist(WP_REST_Request $request) {
        $params      = $request->get_json_params() ?: $request->get_body_params();
        $email       = sanitize_email($params['email'] ?? '');
        $product_ids = isset($params['product_ids']) && is_array($params['product_ids']) 
            ? array_values(array_unique(array_filter(array_map('intval', $params['product_ids'])))) 
            : array();

        if ($email) {
            $user = get_user_by('email', $email) ?: get_user_by('login', $email);
            if ($user) {
                update_user_meta($user->ID, 'mediherbz_wishlist', $product_ids);
            }
            // Always persist to options fallback keyed by email so guest and customer sessions never lose it
            update_option('mediherbz_wishlist_' . md5(strtolower($email)), $product_ids);
        }

        return rest_ensure_response(array(
            'success'     => true,
            'count'       => count($product_ids),
            'product_ids' => $product_ids,
            'message'     => 'Wishlist saved to cloud account successfully.',
        ));
    }

    public function get_customer_orders_array($email, $phone = '') {
        if (!$email && !$phone) {
            return array();
        }

        $cache_key = 'mediherbz_cust_' . md5(strtolower($email) . '_' . $phone);
        $cached    = get_transient($cache_key);
        if ($cached !== false && is_array($cached)) {
            return $cached;
        }

        $args = array(
            'limit'   => 50,
            'orderby' => 'date',
            'order'   => 'DESC',
        );

        if ($email) {
            $args['billing_email'] = $email;
        } elseif ($phone) {
            $args['billing_phone'] = $phone;
        }

        $orders    = function_exists('wc_get_orders') ? wc_get_orders($args) : array();
        $formatted = array();
        static $cust_img_cache = array();

        foreach ($orders as $o) {
            $order_id  = $o->get_id();
            $order_num = ($o->get_meta('_order_number_formatted') ?: get_post_meta($order_id, '_order_number_formatted', true)) ?: ('MED-' . $order_id);
            $items     = array();
            foreach ($o->get_items() as $item_id => $item) {
                $product_id = $item->get_product_id();
                $img_url    = '';
                if ($product_id) {
                    if (!isset($cust_img_cache[$product_id])) {
                        $thumb_id = get_post_thumbnail_id($product_id);
                        $cust_img_cache[$product_id] = $thumb_id ? wp_get_attachment_url($thumb_id) : '';
                    }
                    $img_url = $cust_img_cache[$product_id];
                }

                $items[]  = array(
                    'id'         => $item_id,
                    'product_id' => $product_id ?: $item_id,
                    'name'       => $item->get_name(),
                    'quantity'   => $item->get_quantity(),
                    'subtotal'   => floatval($item->get_subtotal()),
                    'total'      => floatval($item->get_total()),
                    'image'      => $img_url,
                );
            }

            $carrier  = ($o->get_meta('_shipping_carrier') ?: get_post_meta($order_id, '_shipping_carrier', true)) ?: 'Express Air';
            $tracking = ($o->get_meta('_tracking_number') ?: get_post_meta($order_id, '_tracking_number', true)) ?: '';

            $formatted[] = array(
                'id'                   => $order_id,
                'order_number'         => $order_num,
                'status'               => $o->get_status(),
                'currency'             => $o->get_currency(),
                'total'                => floatval($o->get_total()),
                'subtotal'             => floatval($o->get_subtotal() ?: $o->get_total()),
                'shipping_total'       => floatval($o->get_shipping_total()),
                'discount_total'       => floatval($o->get_discount_total()),
                'tax_total'            => floatval($o->get_total_tax()),
                'date_created'         => $o->get_date_created() ? $o->get_date_created()->date('M d, Y') : '',
                'items'                => $items,
                'shipping_carrier'     => $carrier,
                'tracking_id'          => $tracking,
                'tracking_url'         => 'https://mediherbz.pages.dev/track-order?order=' . urlencode($order_num),
                'payment_method'       => $o->get_payment_method(),
                'payment_method_title' => $o->get_payment_method_title(),
                'is_paid'              => $o->is_paid(),
                'billing'              => array(
                    'first_name' => $o->get_billing_first_name(),
                    'last_name'  => $o->get_billing_last_name(),
                    'email'      => $o->get_billing_email(),
                    'phone'      => $o->get_billing_phone(),
                    'address_1'  => $o->get_billing_address_1(),
                    'address_2'  => $o->get_billing_address_2(),
                    'city'       => $o->get_billing_city(),
                    'state'      => $o->get_billing_state(),
                    'postcode'   => $o->get_billing_postcode(),
                    'country'    => $o->get_billing_country() ?: 'India',
                ),
                'shipping'             => array(
                    'first_name' => $o->get_shipping_first_name() ?: $o->get_billing_first_name(),
                    'last_name'  => $o->get_shipping_last_name() ?: $o->get_billing_last_name(),
                    'email'      => $o->get_billing_email(),
                    'phone'      => $o->get_billing_phone(),
                    'address_1'  => $o->get_shipping_address_1() ?: $o->get_billing_address_1(),
                    'address_2'  => $o->get_shipping_address_2() ?: $o->get_billing_address_2(),
                    'city'       => $o->get_shipping_city() ?: $o->get_billing_city(),
                    'state'      => $o->get_shipping_state() ?: $o->get_billing_state(),
                    'postcode'   => $o->get_shipping_postcode() ?: $o->get_billing_postcode(),
                    'country'    => $o->get_shipping_country() ?: 'India',
                ),
            );
        }

        set_transient($cache_key, $formatted, 60);
        return $formatted;
    }

    public function get_customer_orders($request) {
        $email = sanitize_email($request->get_param('email'));
        $phone = sanitize_text_field($request->get_param('phone'));

        if (!$email && !$phone) {
            return rest_ensure_response(array());
        }

        $formatted = $this->get_customer_orders_array($email, $phone);
        return rest_ensure_response($formatted);
    }

    public function get_admin_orders($request) {
        if (!function_exists('wc_get_orders')) {
            return rest_ensure_response(array('orders' => array(), 'stats' => array('total_count' => 0, 'processing' => 0, 'completed' => 0, 'on_hold' => 0, 'cancelled' => 0, 'total_rev' => 0, 'cod_count' => 0, 'online_count' => 0)));
        }

        $limit         = min(100, max(1, intval($request->get_param('limit') ?: 40)));
        $status        = sanitize_text_field($request->get_param('status') ?: 'any');
        $search        = sanitize_text_field($request->get_param('search') ?: '');
        $force_refresh = $request->get_param('force') === '1' || $request->get_param('force') === 'true';

        // 1. Instant 30s Server Cache for Unfiltered Polls (sub-50ms repeat response)
        $cache_key = 'mediherbz_orders_' . md5($status . '_' . $limit . '_' . $search);
        if (empty($search) && !$force_refresh) {
            $cached_payload = get_transient($cache_key);
            if ($cached_payload !== false && is_array($cached_payload) && !empty($cached_payload['stats']['total_count'])) {
                return rest_ensure_response($cached_payload);
            }
        }

        // 2. High-Performance SQL Query for Global Store Order Statistics
        global $wpdb;
        $stats = array(
            'total_count' => 0,
            'processing'  => 0,
            'completed'   => 0,
            'on_hold'     => 0,
            'cancelled'   => 0,
            'total_rev'   => 0,
            'cod_count'   => 0,
            'online_count'=> 0,
        );

        $counts = $wpdb->get_results("
            SELECT post_status, COUNT(*) as cnt 
            FROM {$wpdb->posts} 
            WHERE post_type = 'shop_order' 
            AND post_status IN ('wc-processing', 'wc-completed', 'wc-on-hold', 'wc-cancelled', 'wc-pending')
            GROUP BY post_status
        ");

        if (!empty($counts)) {
            foreach ($counts as $row) {
                $raw_st = str_replace('wc-', '', $row->post_status);
                $c = intval($row->cnt);
                $stats['total_count'] += $c;
                if ($raw_st === 'on-hold') {
                    $stats['on_hold'] = $c;
                } elseif (isset($stats[$raw_st])) {
                    $stats[$raw_st] = $c;
                }
            }
        }

        // Fallback using WooCommerce built-in order counts (supports HPOS custom order tables)
        if ($stats['total_count'] === 0 && function_exists('wc_orders_count')) {
            $stats['processing']  = intval(wc_orders_count('processing'));
            $stats['completed']   = intval(wc_orders_count('completed'));
            $stats['on_hold']     = intval(wc_orders_count('on-hold'));
            $stats['cancelled']   = intval(wc_orders_count('cancelled'));
            $stats['total_count'] = $stats['processing'] + $stats['completed'] + $stats['on_hold'] + $stats['cancelled'];
        }

        $rev_row = $wpdb->get_row("
            SELECT 
                SUM(CASE WHEN p.post_status NOT IN ('wc-cancelled', 'wc-failed', 'trash') THEN CAST(pm.meta_value AS DECIMAL(10,2)) ELSE 0 END) as total_rev,
                SUM(CASE WHEN pm_pay.meta_value = 'cod' THEN 1 ELSE 0 END) as cod_count,
                SUM(CASE WHEN pm_pay.meta_value != 'cod' AND pm_pay.meta_value IS NOT NULL THEN 1 ELSE 0 END) as online_count
            FROM {$wpdb->posts} p
            LEFT JOIN {$wpdb->postmeta} pm ON (p.ID = pm.post_id AND pm.meta_key = '_order_total')
            LEFT JOIN {$wpdb->postmeta} pm_pay ON (p.ID = pm_pay.post_id AND pm_pay.meta_key = '_payment_method')
            WHERE p.post_type = 'shop_order'
        ");
        if ($rev_row) {
            $stats['total_rev']    = floatval($rev_row->total_rev ?: 0);
            $stats['cod_count']    = intval($rev_row->cod_count ?: 0);
            $stats['online_count'] = intval($rev_row->online_count ?: 0);
        }

        // Secondary fallback to calculate revenue from SQL if needed
        if ($stats['total_rev'] == 0 && $stats['total_count'] > 0) {
            $sql_rev = $wpdb->get_var("
                SELECT SUM(CAST(meta_value AS DECIMAL(10,2))) 
                FROM {$wpdb->postmeta} 
                WHERE meta_key = '_order_total' 
                AND post_id IN (SELECT ID FROM {$wpdb->posts} WHERE post_type = 'shop_order' AND post_status NOT IN ('wc-cancelled', 'wc-failed', 'trash'))
            ");
            if ($sql_rev) {
                $stats['total_rev'] = floatval($sql_rev);
            }
        }

        // 3. Optimized Orders Fetching
        $args = array(
            'limit'   => $limit,
            'orderby' => 'date',
            'order'   => 'DESC',
        );

        if ($status && $status !== 'any') {
            $args['status'] = $status;
        }

        $orders = wc_get_orders($args);
        $formatted = array();
        static $img_cache = array();

        foreach ($orders as $o) {
            $order_id = $o->get_id();
            $order_num = ($o->get_meta('_order_number_formatted') ?: get_post_meta($order_id, '_order_number_formatted', true)) ?: ('MED-' . $order_id);

            // Filter by search term if provided
            $cust_name = trim($o->get_billing_first_name() . ' ' . $o->get_billing_last_name());
            $cust_phone = $o->get_billing_phone();
            $cust_email = $o->get_billing_email();

            if (!empty($search)) {
                $s_lower = strtolower($search);
                $match = (
                    strpos(strtolower($order_num), $s_lower) !== false ||
                    strpos(strval($order_id), $s_lower) !== false ||
                    strpos(strtolower($cust_name), $s_lower) !== false ||
                    strpos(strtolower($cust_phone), $s_lower) !== false ||
                    strpos(strtolower($cust_email), $s_lower) !== false
                );
                if (!$match) continue;
            }

            // Line items extracted without heavy N+1 WC_Product loads
            $items = array();
            foreach ($o->get_items() as $item_id => $item) {
                $product_id = $item->get_product_id();
                $img_url = '';
                if ($product_id) {
                    if (!isset($img_cache[$product_id])) {
                        $thumb_id = get_post_thumbnail_id($product_id);
                        $img_cache[$product_id] = $thumb_id ? wp_get_attachment_url($thumb_id) : '';
                    }
                    $img_url = $img_cache[$product_id];
                }

                $items[] = array(
                    'id'       => $item_id,
                    'name'     => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'total'    => floatval($item->get_total()),
                    'sku'      => '',
                    'image'    => $img_url,
                );
            }

            $carrier      = ($o->get_meta('_shipping_carrier') ?: get_post_meta($order_id, '_shipping_carrier', true)) ?: 'Express BlueDart Air';
            $tracking_id  = ($o->get_meta('_tracking_number') ?: get_post_meta($order_id, '_tracking_number', true)) ?: '';
            $tracking_url = ($o->get_meta('_tracking_url') ?: get_post_meta($order_id, '_tracking_url', true)) ?: '';

            $formatted[] = array(
                'id'                   => $order_id,
                'order_number'         => $order_num,
                'status'               => $o->get_status(),
                'total'                => floatval($o->get_total()),
                'subtotal'             => floatval($o->get_subtotal()),
                'shipping_total'       => floatval($o->get_shipping_total()),
                'discount_total'       => floatval($o->get_discount_total()),
                'currency'             => $o->get_currency(),
                'date_created'         => $o->get_date_created() ? $o->get_date_created()->date('M d, Y h:i A') : '',
                'customer'             => array(
                    'first_name' => $o->get_billing_first_name(),
                    'last_name'  => $o->get_billing_last_name(),
                    'name'       => $cust_name ?: 'Customer',
                    'email'      => $cust_email,
                    'phone'      => $cust_phone,
                    'address'    => trim($o->get_billing_address_1() . ' ' . $o->get_billing_address_2()),
                    'city'       => $o->get_billing_city(),
                    'state'      => $o->get_billing_state(),
                    'postcode'   => $o->get_billing_postcode(),
                    'country'    => $o->get_billing_country(),
                ),
                'items'                => $items,
                'item_count'           => $o->get_item_count(),
                'shipping_carrier'     => $carrier,
                'tracking_id'          => $tracking_id,
                'tracking_url'         => $tracking_url,
                'payment_method'       => $o->get_payment_method(),
                'payment_method_title' => $o->get_payment_method_title(),
                'is_paid'              => $o->is_paid(),
                'customer_note'        => $o->get_customer_note(),
            );
        }

        // Safeguard: If stats total_count is 0 but orders exist in database, reflect actual count
        if ($stats['total_count'] === 0 && !empty($formatted)) {
            $stats['total_count'] = count($formatted);
            $stats['processing']  = count($formatted);
        }

        $response_data = array(
            'success' => true,
            'stats'   => $stats,
            'orders'  => $formatted,
            'count'   => count($formatted),
        );

        // Store short 20s transient for fast sub-50ms repeat polling
        if (empty($search)) {
            set_transient($cache_key, $response_data, 20);
        }

        return rest_ensure_response($response_data);
    }

    public function update_admin_order_status($request) {
        $params   = $request->get_json_params();
        $order_id = intval($params['order_id'] ?? 0);
        $status   = sanitize_text_field($params['status'] ?? '');
        $note     = sanitize_text_field($params['note'] ?? '');

        if (!$order_id || !$status) {
            return new WP_Error('invalid_params', 'Order ID and Status required', array('status' => 400));
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('not_found', 'Order not found', array('status' => 404));
        }

        $order->update_status($status, $note ?: 'Status updated via Mediherbz Orders App');
        $order->save();
        $this->clear_orders_cache();
        $this->clear_orders_cache();

        return rest_ensure_response(array(
            'success'    => true,
            'order_id'   => $order_id,
            'status'     => $order->get_status(),
            'message'    => 'Order status updated successfully.',
        ));
    }

    public function update_admin_order_tracking($request) {
        $params       = $request->get_json_params();
        $order_id     = intval($params['order_id'] ?? 0);
        $carrier      = sanitize_text_field($params['shipping_carrier'] ?? '');
        $tracking_id  = sanitize_text_field($params['tracking_id'] ?? '');
        $tracking_url = esc_url_raw($params['tracking_url'] ?? '');
        $mark_shipped = !empty($params['mark_shipped']);

        if (!$order_id) {
            return new WP_Error('invalid_params', 'Order ID is required', array('status' => 400));
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('not_found', 'Order not found', array('status' => 404));
        }

        if ($carrier) {
            $order->update_meta_data('_shipping_carrier', $carrier);
            update_post_meta($order_id, '_shipping_carrier', $carrier);
        }
        if ($tracking_id) {
            $order->update_meta_data('_tracking_number', $tracking_id);
            update_post_meta($order_id, '_tracking_number', $tracking_id);
        }
        if ($tracking_url) {
            $order->update_meta_data('_tracking_url', $tracking_url);
            update_post_meta($order_id, '_tracking_url', $tracking_url);
        }

        if ($tracking_id) {
            $order->add_order_note(
                sprintf('Shipment dispatched via %s (Waybill #%s)', $carrier ?: 'Courier', $tracking_id),
                false,
                true
            );
        }

        if ($mark_shipped && $order->get_status() === 'processing') {
            $order->update_status('completed', sprintf('Dispatched via %s (AWB #%s)', $carrier, $tracking_id));
        }

        $order->save();
        $this->clear_orders_cache();
        $this->clear_orders_cache();

        return rest_ensure_response(array(
            'success'          => true,
            'order_id'         => $order_id,
            'shipping_carrier' => $carrier,
            'tracking_id'      => $tracking_id,
            'tracking_url'     => $tracking_url,
            'status'           => $order->get_status(),
            'message'          => 'Tracking information saved to WooCommerce.',
        ));
    }

    public function validate_coupon($request) {
        $params   = $request->get_json_params();
        $code     = strtoupper(trim($params['code'] ?? ''));
        $subtotal = floatval($params['subtotal'] ?? 0);

        $coupons = array(
            'MED10'     => array('discount_pct' => 10, 'min_spend' => 0, 'description' => '10% OFF on all botanical wellness orders'),
            'AYURVEDA'  => array('discount_pct' => 15, 'min_spend' => 499, 'description' => '15% OFF Ayurvedic special discount on orders over ₹499'),
            'FIRST50'   => array('discount_amt' => 50, 'min_spend' => 299, 'description' => 'Flat ₹50 OFF for new herbal wellness customers'),
            'FREESHIP'  => array('free_shipping' => true, 'min_spend' => 0, 'description' => 'Complimentary Free Express Shipping'),
        );

        if (!isset($coupons[$code])) {
            return new WP_Error('invalid_coupon', 'Coupon code is invalid or has expired.', array('status' => 400));
        }

        $c = $coupons[$code];
        if ($subtotal < $c['min_spend']) {
            return new WP_Error('min_spend_required', 'Minimum order of ₹' . $c['min_spend'] . ' required for this coupon.', array('status' => 400));
        }

        $discount_amt = 0;
        if (!empty($c['discount_pct'])) {
            $discount_amt = round(($subtotal * $c['discount_pct']) / 100);
        } elseif (!empty($c['discount_amt'])) {
            $discount_amt = min($c['discount_amt'], $subtotal);
        }

        return rest_ensure_response(array(
            'valid'         => true,
            'code'          => $code,
            'discount_amt'  => $discount_amt,
            'free_shipping' => !empty($c['free_shipping']),
            'description'   => $c['description'],
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

        // 3. Link Categories
        $cat_map = array(
            'ayurvedic-products'   => array('category-ayurvedic-products'),
            'herbal-hair-care'     => array('category-herbal-hair-care'),
            'herbal-kits-combos'   => array('category-herbal-kits-combos'),
            'herbal-oils'          => array('category-herbal-oils-2', 'category-herbal-oils'),
            'herbal-powders'       => array('category-herbal-powders'),
            'herbal-skin-care'     => array('category-herbal-skin-care'),
            'herbal-supplements'   => array('category-herbal-supplements'),
            'herbal-teas'          => array('category-herbal-teas'),
            'natural-beauty'       => array('category-natural-beauty'),
            'organic-products'     => array('category-organic-products'),
            'wellness-essentials'  => array('category-wellness-essentials', 'category-wellness-meditation'),
        );

        foreach ($cat_map as $cat_slug => $img_slugs) {
            $term = get_term_by('slug', $cat_slug, 'product_cat');
            if (!$term) continue;

            $media_post = null;
            foreach ($img_slugs as $img_slug) {
                $media_post = get_page_by_path($img_slug, OBJECT, 'attachment');
                if ($media_post) break;
            }

            if (!$media_post) {
                // Fallback query by post_title or slug
                $attachments = get_posts(array(
                    'post_type'      => 'attachment',
                    'name'           => 'category-' . $cat_slug,
                    'posts_per_page' => 1,
                    'post_status'    => 'inherit',
                ));
                if (!empty($attachments)) {
                    $media_post = $attachments[0];
                }
            }

            if ($media_post) {
                update_term_meta($term->term_id, 'thumbnail_id', $media_post->ID);
                $results[] = "Linked media ID {$media_post->ID} to category {$cat_slug} (Term ID {$term->term_id})";
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'All product and blog featured images linked successfully!',
            'details' => $results,
        ));
    }
}

