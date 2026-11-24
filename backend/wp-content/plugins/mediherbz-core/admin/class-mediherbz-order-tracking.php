<?php
/**
 * Dedicated WooCommerce Order Tracking & Dispatch Meta Box
 * Supports both WooCommerce HPOS and Legacy Post Storage.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Mediherbz_Order_Tracking {

    public function __construct() {
        add_action('add_meta_boxes', array($this, 'add_tracking_meta_box'), 10, 2);
        add_action('add_meta_boxes_woocommerce_page_wc-orders', array($this, 'add_tracking_meta_box'), 10, 2);
        add_action('woocommerce_process_shop_order_meta', array($this, 'save_tracking_meta'));
        add_action('save_post_shop_order', array($this, 'save_tracking_meta'));
    }

    public function add_tracking_meta_box() {
        $screens = array('shop_order', 'woocommerce_page_wc-orders');
        if (function_exists('wc_get_page_screen_id')) {
            $hpos_screen = wc_get_page_screen_id('shop_order');
            if ($hpos_screen && !in_array($hpos_screen, $screens, true)) {
                $screens[] = $hpos_screen;
            }
        }

        foreach ($screens as $screen) {
            add_meta_box(
                'mediherbz_order_tracking_box',
                '🚚 Mediherbz Shipment & Tracking',
                array($this, 'render_meta_box'),
                $screen,
                'side',
                'high'
            );
        }
    }

    public function render_meta_box($post_or_order) {
        $order = ($post_or_order instanceof WC_Order) ? $post_or_order : wc_get_order($post_or_order->ID ?? 0);
        if (!$order) {
            echo '<p>Order not loaded.</p>';
            return;
        }

        wp_nonce_field('mediherbz_save_tracking', 'mediherbz_tracking_nonce');

        $carrier      = $order->get_meta('_shipping_carrier') ?: 'Express BlueDart Air';
        $tracking_id  = $order->get_meta('_tracking_number') ?: '';
        $tracking_url = $order->get_meta('_tracking_url') ?: '';
        ?>
        <div style="padding: 6px 0;">
            <p style="margin-bottom: 12px;">
                <label for="mediherbz_carrier" style="font-weight: 600; display: block; margin-bottom: 4px;">Shipping Carrier:</label>
                <input type="text" id="mediherbz_carrier" name="mediherbz_carrier" value="<?php echo esc_attr($carrier); ?>" list="mediherbz_carriers_list" style="width: 100%;" placeholder="e.g. BlueDart Air, Delhivery" />
                <datalist id="mediherbz_carriers_list">
                    <option value="Express BlueDart Air">
                    <option value="Delhivery Surface / Express">
                    <option value="DTDC Express Air">
                    <option value="India Post Speed Post">
                    <option value="Shiprocket Priority">
                    <option value="Shadowfax Courier">
                </datalist>
            </p>

            <p style="margin-bottom: 12px;">
                <label for="mediherbz_tracking_number" style="font-weight: 600; display: block; margin-bottom: 4px;">Tracking ID / AWB Number:</label>
                <input type="text" id="mediherbz_tracking_number" name="mediherbz_tracking_number" value="<?php echo esc_attr($tracking_id); ?>" style="width: 100%;" placeholder="e.g. BD-89210041IN" />
            </p>

            <p style="margin-bottom: 12px;">
                <label for="mediherbz_tracking_url" style="font-weight: 600; display: block; margin-bottom: 4px;">Carrier Tracking URL (Optional):</label>
                <input type="url" id="mediherbz_tracking_url" name="mediherbz_tracking_url" value="<?php echo esc_url($tracking_url); ?>" style="width: 100%;" placeholder="https://www.bluedart.com/tracking..." />
                <span class="description" style="font-size: 11px; color: #666; display: block; margin-top: 4px;">The customer will see a 1-click button to view courier status.</span>
            </p>
        </div>
        <?php
    }

    public function save_tracking_meta($order_id) {
        if (!isset($_POST['mediherbz_tracking_nonce']) || !wp_verify_nonce($_POST['mediherbz_tracking_nonce'], 'mediherbz_save_tracking')) {
            return;
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        $carrier      = sanitize_text_field($_POST['mediherbz_carrier'] ?? '');
        $tracking_id  = sanitize_text_field($_POST['mediherbz_tracking_number'] ?? '');
        $tracking_url = esc_url_raw($_POST['mediherbz_tracking_url'] ?? '');

        $old_tracking = $order->get_meta('_tracking_number');

        $order->update_meta_data('_shipping_carrier', $carrier);
        $order->update_meta_data('_tracking_number', $tracking_id);
        $order->update_meta_data('_tracking_url', $tracking_url);

        // Also save to legacy post meta for backward compatibility
        update_post_meta($order_id, '_shipping_carrier', $carrier);
        update_post_meta($order_id, '_tracking_number', $tracking_id);
        update_post_meta($order_id, '_tracking_url', $tracking_url);

        // Add order note if tracking ID was just entered or updated
        if (!empty($tracking_id) && $tracking_id !== $old_tracking) {
            $order->add_order_note(
                sprintf('Shipment dispatched via %s with Tracking ID: %s', $carrier ?: 'Courier', $tracking_id),
                false,
                true
            );
        }

        $order->save();
    }
}
