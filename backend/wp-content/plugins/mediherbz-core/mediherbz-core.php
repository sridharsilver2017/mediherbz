<?php
/**
 * Plugin Name: Mediherbz Core
 * Plugin URI:  https://mediherbz.com
 * Description: Technical foundation, brand management, custom herbal product fields, Razorpay payment verification, and headless REST API for Mediherbz e-commerce platform.
 * Version:     1.0.0
 * Author:      Mediherbz Engineering
 * Author URI:  https://mediherbz.com
 * Text Domain: mediherbz-core
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * WC requires at least: 7.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('MEDIHERBZ_CORE_VERSION', '1.0.0');
define('MEDIHERBZ_CORE_PATH', plugin_dir_path(__FILE__));
define('MEDIHERBZ_CORE_URL', plugin_dir_url(__FILE__));

// Require Core Files
require_once MEDIHERBZ_CORE_PATH . 'includes/class-mediherbz-activator.php';
require_once MEDIHERBZ_CORE_PATH . 'admin/class-mediherbz-admin-settings.php';
require_once MEDIHERBZ_CORE_PATH . 'product-fields/class-mediherbz-product-fields.php';
require_once MEDIHERBZ_CORE_PATH . 'api/class-mediherbz-rest-api.php';
require_once MEDIHERBZ_CORE_PATH . 'integrations/razorpay/class-mediherbz-razorpay.php';
require_once MEDIHERBZ_CORE_PATH . 'security/class-mediherbz-security.php';

register_activation_hook(__FILE__, array('Mediherbz_Activator', 'activate'));
register_deactivation_hook(__FILE__, array('Mediherbz_Activator', 'deactivate'));

function run_mediherbz_core() {
    new Mediherbz_Admin_Settings();
    new Mediherbz_Product_Fields();
    new Mediherbz_REST_API();
    new Mediherbz_Razorpay();
    new Mediherbz_Security();
}
add_action('plugins_loaded', 'run_mediherbz_core');

