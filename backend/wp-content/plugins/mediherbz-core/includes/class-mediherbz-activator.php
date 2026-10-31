<?php
if (!defined('ABSPATH')) {
    exit;
}

class Mediherbz_Activator {
    public static function activate() {
        // Set default brand options if not existing
        if (!get_option('mediherbz_brand_settings')) {
            $defaults = array(
                'brand_name'      => 'Mediherbz',
                'tagline'         => 'For Young & Vibrant Look',
                'logo_url'        => '/brand/mediherbz-logo.png',
                'logo_footer_url' => '/brand/logo-footer.png',
                'favicon_url'     => '/brand/favicon-32x32.png',
                'primary_color'   => '#18833B',
                'deep_green'      => '#12632F',
                'lime_color'      => '#A6C928',
                'orange_color'    => '#F28A13',
                'cream_bg'        => '#FAF9F2',
                'contact_email'   => 'care@mediherbz.com',
                'support_phone'   => '+91 98765 43210',
                'address'         => 'Mediherbz Herbal Laboratories, Botanical Park, Kerala, India',
                'currency'        => 'INR',
                'currency_symbol' => '₹',
                'cors_origins'    => 'http://localhost:3000,https://www.mediherbz.com',
            );
            update_option('mediherbz_brand_settings', $defaults);
        }

        // Create standard categories if WooCommerce is active
        if (taxonomy_exists('product_cat')) {
            $categories = array(
                'Herbal Supplements',
                'Ayurvedic Products',
                'Herbal Skin Care',
                'Herbal Hair Care',
                'Herbal Oils',
                'Herbal Powders',
                'Herbal Teas',
                'Natural Beauty',
                'Organic Products',
                'Wellness Essentials',
                'Herbal Kits & Combos',
            );

            foreach ($categories as $cat) {
                if (!term_exists($cat, 'product_cat')) {
                    wp_insert_term($cat, 'product_cat');
                }
            }
        }

        flush_rewrite_rules();
    }

    public static function deactivate() {
        flush_rewrite_rules();
    }
}

