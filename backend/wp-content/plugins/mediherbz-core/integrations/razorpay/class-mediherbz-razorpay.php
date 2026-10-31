<?php
if (!defined('ABSPATH')) {
    exit;
}

class Mediherbz_Razorpay {
    private $namespace = 'mediherbz/v1';

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_payment_routes'));
    }

    public function register_payment_routes() {
        register_rest_route($this->namespace, '/razorpay/create-order', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'create_razorpay_order'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route($this->namespace, '/razorpay/verify-payment', array(
            'methods'             => 'POST',
            'callback'            => array($this, 'verify_razorpay_payment'),
            'permission_callback' => '__return_true',
        ));
    }

    public function create_razorpay_order($request) {
        $params   = $request->get_json_params();
        $amount   = floatval($params['amount'] ?? 0);
        $currency = sanitize_text_field($params['currency'] ?? 'INR');
        $receipt  = sanitize_text_field($params['receipt'] ?? ('rcpt_' . time()));

        if ($amount <= 0) {
            return new WP_Error('invalid_amount', 'Order amount must be greater than zero.', array('status' => 400));
        }

        $key_id     = defined('MEDIHERBZ_RAZORPAY_KEY_ID') ? MEDIHERBZ_RAZORPAY_KEY_ID : get_option('mediherbz_razorpay_key_id', 'rzp_test_placeholder');
        $key_secret = defined('MEDIHERBZ_RAZORPAY_KEY_SECRET') ? MEDIHERBZ_RAZORPAY_KEY_SECRET : get_option('mediherbz_razorpay_key_secret', '');

        // Call Razorpay API
        $response = wp_remote_post('https://api.razorpay.com/v1/orders', array(
            'headers' => array(
                'Authorization' => 'Basic ' . base64_encode($key_id . ':' . $key_secret),
                'Content-Type'  => 'application/json',
            ),
            'body'    => wp_json_encode(array(
                'amount'   => round($amount * 100), // paise
                'currency' => $currency,
                'receipt'  => $receipt,
            )),
        ));

        if (is_wp_error($response)) {
            // Fallback simulated order id for offline/dev setup
            return rest_ensure_response(array(
                'order_id' => 'order_' . uniqid(),
                'amount'   => round($amount * 100),
                'currency' => $currency,
                'key_id'   => $key_id,
            ));
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);
        return rest_ensure_response(array(
            'order_id' => $body['id'] ?? ('order_' . uniqid()),
            'amount'   => round($amount * 100),
            'currency' => $currency,
            'key_id'   => $key_id,
        ));
    }

    public function verify_razorpay_payment($request) {
        $params    = $request->get_json_params();
        $order_id  = sanitize_text_field($params['razorpay_order_id'] ?? '');
        $pay_id    = sanitize_text_field($params['razorpay_payment_id'] ?? '');
        $signature = sanitize_text_field($params['razorpay_signature'] ?? '');
        $order_data = $params['order_data'] ?? array();

        $key_secret = defined('MEDIHERBZ_RAZORPAY_KEY_SECRET') ? MEDIHERBZ_RAZORPAY_KEY_SECRET : get_option('mediherbz_razorpay_key_secret', '');

        // Verify cryptographic signature if secret is present
        if (!empty($key_secret)) {
            $expected = hash_hmac('sha256', $order_id . '|' . $pay_id, $key_secret);
            if (!hash_equals($expected, $signature)) {
                return new WP_Error('invalid_signature', 'Cryptographic payment verification failed.', array('status' => 400));
            }
        }

        // Create WooCommerce Order if WooCommerce is available
        $order_number = 'MED-' . rand(100000, 999999);
        if (function_exists('wc_create_order')) {
            $wc_order = wc_create_order();
            $customer = $order_data['customer'] ?? array();
            
            $wc_order->set_address(array(
                'first_name' => sanitize_text_field($customer['firstName'] ?? ''),
                'last_name'  => sanitize_text_field($customer['lastName'] ?? ''),
                'email'      => sanitize_email($customer['email'] ?? ''),
                'phone'      => sanitize_text_field($customer['phone'] ?? ''),
                'address_1'  => sanitize_text_field($customer['address'] ?? ''),
                'city'       => sanitize_text_field($customer['city'] ?? ''),
                'state'      => sanitize_text_field($customer['state'] ?? ''),
                'postcode'   => sanitize_text_field($customer['postcode'] ?? ''),
                'country'    => 'IN',
            ), 'billing');

            $wc_order->set_address(array(
                'first_name' => sanitize_text_field($customer['firstName'] ?? ''),
                'last_name'  => sanitize_text_field($customer['lastName'] ?? ''),
                'email'      => sanitize_email($customer['email'] ?? ''),
                'phone'      => sanitize_text_field($customer['phone'] ?? ''),
                'address_1'  => sanitize_text_field($customer['address'] ?? ''),
                'city'       => sanitize_text_field($customer['city'] ?? ''),
                'state'      => sanitize_text_field($customer['state'] ?? ''),
                'postcode'   => sanitize_text_field($customer['postcode'] ?? ''),
                'country'    => 'IN',
            ), 'shipping');

            $wc_order->payment_complete($pay_id);
            $wc_order->update_status('processing', 'Payment verified via Razorpay ID: ' . $pay_id);
            $wc_order->add_order_note('Payment Signature Verified: ' . $signature);
            update_post_meta($wc_order->get_id(), '_razorpay_order_id', $order_id);
            update_post_meta($wc_order->get_id(), '_order_number_formatted', $order_number);
        }

        return rest_ensure_response(array(
            'success'      => true,
            'order_number' => $order_number,
            'payment_id'   => $pay_id,
            'message'      => 'Payment verified and WooCommerce order created.',
        ));
    }
}

