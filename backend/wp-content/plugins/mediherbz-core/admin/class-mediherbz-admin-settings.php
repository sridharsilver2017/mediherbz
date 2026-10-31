<?php
if (!defined('ABSPATH')) {
    exit;
}

class Mediherbz_Admin_Settings {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function add_admin_menu() {
        add_menu_page(
            'Mediherbz Brand & Store',
            'Mediherbz',
            'manage_options',
            'mediherbz-settings',
            array($this, 'render_settings_page'),
            'dashicons-palmtree',
            56
        );
    }

    public function register_settings() {
        register_setting('mediherbz_settings_group', 'mediherbz_brand_settings', array(
            'sanitize_callback' => array($this, 'sanitize_settings')
        ));
    }

    public function sanitize_settings($input) {
        $clean = array();
        $clean['brand_name']      = sanitize_text_field($input['brand_name'] ?? 'Mediherbz');
        $clean['tagline']         = sanitize_text_field($input['tagline'] ?? 'For Young & Vibrant Look');
        $clean['logo_url']        = esc_url_raw($input['logo_url'] ?? '');
        $clean['logo_footer_url'] = esc_url_raw($input['logo_footer_url'] ?? '');
        $clean['favicon_url']     = esc_url_raw($input['favicon_url'] ?? '');
        $clean['primary_color']   = sanitize_hex_color($input['primary_color'] ?? '#18833B');
        $clean['deep_green']      = sanitize_hex_color($input['deep_green'] ?? '#12632F');
        $clean['lime_color']      = sanitize_hex_color($input['lime_color'] ?? '#A6C928');
        $clean['orange_color']    = sanitize_hex_color($input['orange_color'] ?? '#F28A13');
        $clean['contact_email']   = sanitize_email($input['contact_email'] ?? 'care@mediherbz.com');
        $clean['support_phone']   = sanitize_text_field($input['support_phone'] ?? '');
        $clean['address']         = sanitize_textarea_field($input['address'] ?? '');
        $clean['currency']        = sanitize_text_field($input['currency'] ?? 'INR');
        $clean['currency_symbol'] = sanitize_text_field($input['currency_symbol'] ?? '₹');
        $clean['cors_origins']    = sanitize_text_field($input['cors_origins'] ?? 'http://localhost:3000,https://www.mediherbz.com');
        return $clean;
    }

    public function render_settings_page() {
        $settings = get_option('mediherbz_brand_settings', array());
        ?>
        <div class="wrap">
            <h1><span class="dashicons dashicons-palmtree" style="font-size:32px;width:32px;height:32px;color:#18833B;"></span> Mediherbz Brand &amp; Headless API Configuration</h1>
            <p>Configure brand visual identity, typography tokens, AYUSH compliance information, and CORS storefront origins without touching React code.</p>
            
            <form method="post" action="options.php" style="background:#fff;padding:24px;border-radius:12px;border:1px solid #ccd0d4;max-width:850px;margin-top:20px;">
                <?php
                settings_fields('mediherbz_settings_group');
                do_settings_sections('mediherbz_settings_group');
                ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">Brand Name</th>
                        <td><input type="text" name="mediherbz_brand_settings[brand_name]" value="<?php echo esc_attr($settings['brand_name'] ?? 'Mediherbz'); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row">Official Tagline</th>
                        <td><input type="text" name="mediherbz_brand_settings[tagline]" value="<?php echo esc_attr($settings['tagline'] ?? 'For Young & Vibrant Look'); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row">Primary Brand Color (Green)</th>
                        <td><input type="color" name="mediherbz_brand_settings[primary_color]" value="<?php echo esc_attr($settings['primary_color'] ?? '#18833B'); ?>" /> <code>#18833B</code></td>
                    </tr>
                    <tr>
                        <th scope="row">Accent Color (Lime)</th>
                        <td><input type="color" name="mediherbz_brand_settings[lime_color]" value="<?php echo esc_attr($settings['lime_color'] ?? '#A6C928'); ?>" /> <code>#A6C928</code></td>
                    </tr>
                    <tr>
                        <th scope="row">Secondary Accent (Orange)</th>
                        <td><input type="color" name="mediherbz_brand_settings[orange_color]" value="<?php echo esc_attr($settings['orange_color'] ?? '#F28A13'); ?>" /> <code>#F28A13</code></td>
                    </tr>
                    <tr>
                        <th scope="row">Support Email</th>
                        <td><input type="email" name="mediherbz_brand_settings[contact_email]" value="<?php echo esc_attr($settings['contact_email'] ?? 'care@mediherbz.com'); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row">Support Phone / WhatsApp</th>
                        <td><input type="text" name="mediherbz_brand_settings[support_phone]" value="<?php echo esc_attr($settings['support_phone'] ?? '+91 98765 43210'); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row">Physical Lab Address</th>
                        <td><textarea name="mediherbz_brand_settings[address]" rows="3" class="large-text"><?php echo esc_textarea($settings['address'] ?? ''); ?></textarea></td>
                    </tr>
                    <tr>
                        <th scope="row">Approved CORS Domains (comma separated)</th>
                        <td>
                            <input type="text" name="mediherbz_brand_settings[cors_origins]" value="<?php echo esc_attr($settings['cors_origins'] ?? 'http://localhost:3000,https://www.mediherbz.com'); ?>" class="large-text" />
                            <p class="description">Domains permitted to query <code>/wp-json/mediherbz/v1/</code> via browser fetches.</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('Save Mediherbz Settings'); ?>
            </form>
        </div>
        <?php
    }
}

