<?php
/**
 * Mediherbz Core Plugin Cleanup
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete options
delete_option('mediherbz_brand_settings');
delete_option('mediherbz_razorpay_key_id');
delete_option('mediherbz_razorpay_key_secret');

