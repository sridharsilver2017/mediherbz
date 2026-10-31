<?php
if (!defined('ABSPATH')) {
    exit;
}

class Mediherbz_Product_Fields {
    private $fields = array(
        '_botanical_name'         => 'Botanical / Latin Name',
        '_common_name'            => 'Common / Sanskrit Name',
        '_ingredients'            => 'Key Ingredients (comma separated)',
        '_composition'            => 'Medicinal Composition / Ratio',
        '_product_origin'         => 'Regional Origin (e.g. Kerala, Kashmir)',
        '_product_form'           => 'Form (Oil, Churna, Serum, Capsule, Tea)',
        '_net_quantity'           => 'Net Weight / Volume (e.g. 100ml, 200g)',
        '_directions_for_use'     => 'Directions for Use',
        '_recommended_usage'      => 'Recommended Frequency',
        '_storage_instructions'   => 'Storage Instructions',
        '_precautions'            => 'Precautions & Contraindications',
        '_allergen_info'          => 'Allergen Information',
        '_manufacturer'           => 'Licensed Manufacturer Name',
        '_country_of_origin'      => 'Country of Origin',
        '_manufacturing_date'     => 'Manufacturing Date',
        '_expiry_date'            => 'Expiry Date / Shelf Life',
        '_batch_number'           => 'Batch Number',
        '_licence_number'         => 'AYUSH / FSSAI License Number',
        '_certifications'         => 'Certifications (comma separated, e.g. GMP, Organic)',
    );

    public function __construct() {
        add_action('woocommerce_product_data_tabs', array($this, 'add_herbal_product_tab'));
        add_action('woocommerce_product_data_panels', array($this, 'render_herbal_product_panel'));
        add_action('woocommerce_process_product_meta', array($this, 'save_herbal_product_fields'));
    }

    public function add_herbal_product_tab($tabs) {
        $tabs['mediherbz_herbal_tab'] = array(
            'label'    => '🌿 Herbal & AYUSH Details',
            'target'   => 'mediherbz_herbal_data',
            'class'    => array('show_if_simple', 'show_if_variable'),
            'priority' => 25,
        );
        return $tabs;
    }

    public function render_herbal_product_panel() {
        global $post;
        ?>
        <div id="mediherbz_herbal_data" class="panel woocommerce_options_panel">
            <div class="options_group">
                <p><strong>Strict Botanical &amp; Legal Metrology Fields for Mediherbz Herbal Platform</strong></p>
                <?php
                foreach ($this->fields as $key => $label) {
                    $val = get_post_meta($post->ID, $key, true);
                    if (strpos($key, 'directions') !== false || strpos($key, 'precautions') !== false || strpos($key, 'composition') !== false) {
                        woocommerce_wp_textarea_input(array(
                            'id'          => $key,
                            'label'       => $label,
                            'value'       => $val,
                            'description' => 'Will be exposed via headless API to customer storefront.',
                            'desc_tip'    => true,
                        ));
                    } else {
                        woocommerce_wp_text_input(array(
                            'id'          => $key,
                            'label'       => $label,
                            'value'       => $val,
                            'desc_tip'    => true,
                        ));
                    }
                }
                ?>
            </div>
        </div>
        <?php
    }

    public function save_herbal_product_fields($post_id) {
        foreach ($this->fields as $key => $label) {
            if (isset($_POST[$key])) {
                $sanitized = sanitize_textarea_field(wp_unslash($_POST[$key]));
                update_post_meta($post_id, $key, $sanitized);
            }
        }
    }
}

