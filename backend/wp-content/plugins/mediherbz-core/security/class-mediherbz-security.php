<?php
if (!defined('ABSPATH')) {
    exit;
}

class Mediherbz_Security {
    public function __construct() {
        add_action('init', array($this, 'setup_cors'));
        add_filter('rest_authentication_errors', array($this, 'restrict_sensitive_rest_endpoints'));
    }

    public function setup_cors() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin) {
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        } else {
            header("Access-Control-Allow-Origin: *");
        }

        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit();
        }
    }

    public function restrict_sensitive_rest_endpoints($result) {
        if (!empty($result)) {
            return $result;
        }

        // Hide WordPress user enumeration
        $current_route = untrailingslashit($_SERVER['REQUEST_URI'] ?? '');
        if (strpos($current_route, '/wp/v2/users') !== false && !current_user_can('list_users')) {
            return new WP_Error('rest_cannot_access', 'User enumeration is restricted.', array('status' => 401));
        }

        return $result;
    }
}

