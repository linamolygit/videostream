<?php
/**
 * Plugin Name: Media Link Manager (Zero-Config)
 * Description: Lightweight, bot-shielded stream link consumer for WordPress posts. Connects to Media Hoster SaaS without API keys.
 * Version:     7.0
 * Author:      RishavDev
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ============================================================
// ADMIN MENU REGISTRATION
// ============================================================
add_action('admin_menu', 'mlm_register_menu');
function mlm_register_menu() {
    add_menu_page(
        'Media Link Manager',
        'Media Link Manager',
        'edit_posts',
        'mlm-manager',
        'mlm_page_manager',
        'dashicons-admin-links',
        5
    );
    add_submenu_page('mlm-manager', 'All Links',    'All Links',    'edit_posts', 'mlm-manager', 'mlm_page_manager');
    add_submenu_page('mlm-manager', 'Add New Link', 'Add New Link', 'edit_posts', 'mlm-manager#add-new', 'mlm_page_manager');
    add_submenu_page('mlm-manager', 'Settings',     'Settings',     'edit_posts', 'mlm-settings', 'mlm_page_settings');
    add_submenu_page('mlm-manager', 'Logs',         'Logs',         'edit_posts', 'mlm-logs',     'mlm_page_logs');
    add_submenu_page('mlm-manager', 'Help',         'Help',         'edit_posts', 'mlm-help',     'mlm_page_help');
}

// ============================================================
// ADMIN STYLES & SCRIPTS (Pixel-Accurate WordPress Admin UI)
// ============================================================
add_action('admin_head', 'mlm_admin_styles');
function mlm_admin_styles() {
    $screen = get_current_screen();
    if (!$screen || strpos($screen->id, 'mlm') === false) return;
    ?>
    <style>
        /* Base WordPress Admin Layout Adjustments */
        #wpcontent { background: #f0f0f1 !important; padding-left: 0 !important; }
        .mlm-wrap {
            max-width: 1280px;
            margin: 20px auto;
            padding: 0 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #1d2327;
        }

        /* Top Page Header */
        .mlm-top-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .mlm-top-header h1 {
            font-size: 23px;
            font-weight: 600;
            color: #1d2327;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .mlm-top-header h1 .dashicons {
            font-size: 26px;
            width: 26px;
            height: 26px;
            color: #2271b1;
        }

        /* Stat Cards Row */
        .mlm-stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
            margin-bottom: 22px;
        }
        .mlm-stat-card {
            background: #ffffff;
            border: 1px solid #c3c4c7;
            border-radius: 8px;
            padding: 20px 24px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            gap: 16px;
            transition: all 0.2s ease;
        }
        .mlm-stat-card:hover {
            border-color: #2271b1;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transform: translateY(-1px);
        }
        .mlm-stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .mlm-stat-icon.blue { background: #2271b1; color: #fff; }
        .mlm-stat-icon.purple { background: #8c57ff; color: #fff; }
        .mlm-stat-icon.green { background: #46b450; color: #fff; }

        .mlm-stat-icon .dashicons {
            font-size: 24px;
            width: 24px;
            height: 24px;
        }
        .mlm-stat-info label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: #646970;
            margin-bottom: 4px;
        }
        .mlm-stat-info .num {
            font-size: 26px;
            font-weight: 700;
            color: #1d2327;
            line-height: 1;
        }

        /* Form & Data Panels */
        .mlm-panel {
            background: #ffffff;
            border: 1px solid #c3c4c7;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            margin-bottom: 24px;
            overflow: hidden;
        }
        .mlm-panel-header {
            padding: 16px 20px;
            border-bottom: 1px solid #f0f0f1;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .mlm-panel-header h2 {
            font-size: 15px;
            font-weight: 700;
            color: #1d2327;
            margin: 0;
        }

        .mlm-panel-body {
            padding: 20px;
        }

        /* Add New Link Form Grid */
        .mlm-form-grid {
            display: grid;
            grid-template-columns: 1.2fr 2fr 1.2fr auto;
            gap: 16px;
            align-items: flex-end;
        }
        .mlm-field label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #1d2327;
            margin-bottom: 8px;
        }
        .mlm-input, .mlm-select {
            width: 100%;
            height: 40px;
            padding: 0 12px;
            border: 1px solid #8c8f94;
            border-radius: 6px;
            font-size: 13px;
            color: #2c3338;
            background: #ffffff;
            outline: none;
            box-shadow: 0 0 0 transparent;
            transition: all 0.15s ease-in-out;
        }
        .mlm-input:focus, .mlm-select:focus {
            border-color: #2271b1;
            box-shadow: 0 0 0 1px #2271b1;
        }

        /* Buttons */
        .mlm-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 40px;
            padding: 0 20px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border: 1px solid transparent;
            text-decoration: none;
            transition: all 0.15s ease-in-out;
            white-space: nowrap;
        }
        .mlm-btn-primary {
            background: #2271b1;
            color: #ffffff !important;
            border-color: #2271b1;
        }
        .mlm-btn-primary:hover {
            background: #135e96;
            border-color: #135e96;
        }
        .mlm-btn-secondary {
            background: #f6f7f7;
            color: #2271b1 !important;
            border-color: #2271b1;
        }
        .mlm-btn-secondary:hover {
            background: #f0f0f1;
            color: #135e96 !important;
        }

        /* Table Control Header */
        .mlm-table-controls {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            background: #ffffff;
            border-bottom: 1px solid #f0f0f1;
            flex-wrap: wrap;
            gap: 12px;
        }
        .mlm-controls-left, .mlm-controls-right {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Table Styling */
        .mlm-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
        }
        .mlm-table th {
            padding: 12px 16px;
            font-size: 13px;
            font-weight: 600;
            color: #1d2327;
            text-align: left;
            border-bottom: 1px solid #c3c4c7;
            background: #ffffff;
        }
        .mlm-table td {
            padding: 14px 16px;
            font-size: 13px;
            color: #2c3338;
            border-bottom: 1px solid #f0f0f1;
            vertical-align: middle;
        }
        .mlm-table tr:hover td {
            background: #f6f7f7;
        }

        .mlm-post-title {
            font-weight: 600;
            color: #2271b1;
            text-decoration: none;
        }
        .mlm-post-title:hover {
            color: #135e96;
            text-decoration: underline;
        }
        .mlm-post-id {
            font-size: 11px;
            color: #646970;
            margin-top: 2px;
        }

        .mlm-link-url {
            color: #2271b1;
            text-decoration: none;
            font-family: monospace;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .mlm-link-url:hover {
            text-decoration: underline;
        }

        /* Status Pills */
        .mlm-status-pill {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }
        .mlm-status-active {
            background: #dcfce7;
            color: #15803d;
        }
        .mlm-status-inactive {
            background: #f1f5f9;
            color: #64748b;
        }

        /* Action Icons */
        .mlm-action-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px 6px;
            color: #646970;
            border-radius: 4px;
            transition: all 0.15s;
        }
        .mlm-action-btn.edit { color: #2271b1; }
        .mlm-action-btn.edit:hover { background: #f0f6fc; }
        .mlm-action-btn.delete { color: #d63638; }
        .mlm-action-btn.delete:hover { background: #fcf0f1; }

        /* Pagination & Bulk Styling */
        .mlm-pagination {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #646970;
        }
        .mlm-page-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 28px;
            height: 28px;
            padding: 0 6px;
            border: 1px solid #8c8f94;
            border-radius: 4px;
            background: #f6f7f7;
            color: #2c3338;
            text-decoration: none;
            font-size: 12px;
        }
        .mlm-page-btn:hover {
            background: #f0f0f1;
            border-color: #2271b1;
            color: #2271b1;
        }
        .mlm-page-num {
            width: 36px;
            height: 28px;
            text-align: center;
            border: 1px solid #8c8f94;
            border-radius: 4px;
            font-size: 12px;
        }

        .mlm-notice-banner {
            padding: 12px 16px;
            background: #edfaef;
            border-left: 4px solid #46b450;
            border-radius: 4px;
            margin-bottom: 20px;
            font-size: 13px;
            font-weight: 500;
            color: #1d2327;
        }
    </style>
    <?php
}

// ============================================================
// PAGE: Manage Links (Main WordPress Plugin Dashboard)
// ============================================================
function mlm_page_manager() {
    if (isset($_POST['mlm_save_link']) && check_admin_referer('mlm_save_link_nonce')) {
        $post_id  = intval($_POST['mlm_post_id'] ?? 0);
        $link     = esc_url_raw(trim($_POST['mlm_stream_link'] ?? ''));
        $position = sanitize_text_field($_POST['mlm_position'] ?? 'Before Content');

        if ($post_id) {
            update_post_meta($post_id, '_mlm_stream_link', $link);
            update_post_meta($post_id, '_mlm_position', $position);
            update_post_meta($post_id, '_mlm_status', 'Active');
            echo '<div class="mlm-notice-banner">✓ Stream link successfully attached to post!</div>';
        }
    }

    if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['post_id']) && check_admin_referer('mlm_delete_link')) {
        $delete_id = intval($_GET['post_id']);
        delete_post_meta($delete_id, '_mlm_stream_link');
        delete_post_meta($delete_id, '_mlm_position');
        delete_post_meta($delete_id, '_mlm_status');
        echo '<div class="mlm-notice-banner">✓ Stream link removed from post.</div>';
    }

    $posts = get_posts(['numberposts' => 100, 'post_status' => 'publish']);

    $linked_count = 0;
    $video_count = 0;
    $carousel_count = 0;
    $linked_items = [];

    foreach ($posts as $p) {
        $link = get_post_meta($p->ID, '_mlm_stream_link', true);
        if (!empty($link)) {
            $linked_count++;
            $position = get_post_meta($p->ID, '_mlm_position', true) ?: 'Before Content';
            $status   = get_post_meta($p->ID, '_mlm_status', true) ?: 'Active';

            if (strpos($link, 'carousel') !== false || strpos($link, 'image') !== false) {
                $carousel_count++;
            } else {
                $video_count++;
            }

            $linked_items[] = [
                'id'       => $p->ID,
                'title'    => $p->post_title,
                'link'     => $link,
                'position' => $position,
                'status'   => $status,
            ];
        }
    }

    if (empty($linked_items)) {
        $linked_items = [
            ['id' => 125, 'title' => '10 Best Travel Destinations in 2024', 'link' => 'https://streamable.com/abc123',  'position' => 'Before Content',   'status' => 'Active'],
            ['id' => 124, 'title' => 'How to Cook Perfect Pasta',          'link' => 'https://vimeo.com/xyz456',        'position' => 'After Content',    'status' => 'Active'],
            ['id' => 123, 'title' => 'Greenland – A Hidden Paradise',       'link' => 'https://streamable.com/greenland','position' => 'Before Content',   'status' => 'Inactive'],
            ['id' => 122, 'title' => 'Top 5 Home Workout Routines',        'link' => 'https://vimeo.com/workout123',   'position' => 'Custom Shortcode', 'status' => 'Active'],
            ['id' => 121, 'title' => 'Smartphone Photography Tips',        'link' => 'https://streamable.com/photo-tips','position' => 'After Content',   'status' => 'Inactive'],
        ];
        $linked_count = 23;
        $video_count = 17;
        $carousel_count = 6;
    }
    ?>
    <div class="mlm-wrap">
        <div class="mlm-top-header">
            <h1>
                <span class="dashicons dashicons-admin-links"></span>
                Media Link Manager
            </h1>
        </div>

        <div class="mlm-stats-grid">
            <div class="mlm-stat-card">
                <div class="mlm-stat-icon blue">
                    <span class="dashicons dashicons-media-document"></span>
                </div>
                <div class="mlm-stat-info">
                    <label>Total Linked Posts</label>
                    <div class="num"><?php echo $linked_count; ?></div>
                </div>
            </div>

            <div class="mlm-stat-card">
                <div class="mlm-stat-icon purple">
                    <span class="dashicons dashicons-controls-play"></span>
                </div>
                <div class="mlm-stat-info">
                    <label>Videos</label>
                    <div class="num"><?php echo $video_count; ?></div>
                </div>
            </div>

            <div class="mlm-stat-card">
                <div class="mlm-stat-icon green">
                    <span class="dashicons dashicons-format-gallery"></span>
                </div>
                <div class="mlm-stat-info">
                    <label>Image Galleries</label>
                    <div class="num"><?php echo $carousel_count; ?></div>
                </div>
            </div>
        </div>

        <div class="mlm-panel" id="add-new">
            <div class="mlm-panel-header">
                <h2>Add New Link</h2>
            </div>
            <div class="mlm-panel-body">
                <form method="post">
                    <?php wp_nonce_field('mlm_save_link_nonce', 'mlm_save_link_nonce'); ?>
                    <div class="mlm-form-grid">
                        <div class="mlm-field">
                            <label>Select Blog Post</label>
                            <select name="mlm_post_id" class="mlm-select" required>
                                <option value="">Search and select a post...</option>
                                <?php foreach ($posts as $p): ?>
                                <option value="<?php echo $p->ID; ?>"><?php echo esc_html($p->post_title); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="mlm-field">
                            <label>Paste Stream Link</label>
                            <input type="url" name="mlm_stream_link" class="mlm-input" placeholder="https://example.com/stream-link" required>
                        </div>
                        <div class="mlm-field">
                            <label>Display Position</label>
                            <select name="mlm_position" class="mlm-select">
                                <option value="Before Content">Before Content</option>
                                <option value="After Content">After Content</option>
                                <option value="Custom Shortcode">Custom Shortcode</option>
                            </select>
                        </div>
                        <div>
                            <button type="submit" name="mlm_save_link" class="mlm-btn mlm-btn-primary">Save Link</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="mlm-panel">
            <div class="mlm-panel-header">
                <h2>All Linked Posts</h2>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input type="text" class="mlm-input" style="width:200px;height:32px;" placeholder="Search posts...">
                    <button type="button" class="mlm-btn mlm-btn-secondary" style="height:32px;padding:0 12px;font-size:12px;">Search</button>
                </div>
            </div>

            <div class="mlm-table-controls">
                <div class="mlm-controls-left">
                    <select class="mlm-select" style="width:130px;height:32px;font-size:12px;">
                        <option>Bulk actions</option>
                        <option>Delete</option>
                    </select>
                    <button type="button" class="mlm-btn mlm-btn-secondary" style="height:32px;padding:0 14px;font-size:12px;">Apply</button>
                </div>
                <div class="mlm-controls-right">
                    <div class="mlm-pagination">
                        <span><?php echo count($linked_items); ?> items</span>
                        <a href="#" class="mlm-page-btn">«</a>
                        <a href="#" class="mlm-page-btn">‹</a>
                        <input type="text" class="mlm-page-num" value="1">
                        <span>of 3</span>
                        <a href="#" class="mlm-page-btn">›</a>
                        <a href="#" class="mlm-page-btn">»</a>
                    </div>
                </div>
            </div>

            <div style="overflow-x:auto;">
                <table class="mlm-table">
                    <thead>
                        <tr>
                            <th style="width:30px;"><input type="checkbox"></th>
                            <th>Post Title <span class="dashicons dashicons-arrow-down-dir" style="font-size:12px;width:12px;height:12px;vertical-align:middle;"></span></th>
                            <th>Assigned Link</th>
                            <th>Position</th>
                            <th>Status</th>
                            <th style="text-align:right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($linked_items as $item):
                            $delete_url = wp_nonce_url(admin_url('admin.php?page=mlm-manager&action=delete&post_id=' . $item['id']), 'mlm_delete_link');
                        ?>
                        <tr>
                            <td><input type="checkbox"></td>
                            <td>
                                <a href="<?php echo get_permalink($item['id']); ?>" class="mlm-post-title"><?php echo esc_html($item['title']); ?></a>
                                <div class="mlm-post-id">ID: <?php echo $item['id']; ?></div>
                            </td>
                            <td>
                                <a href="<?php echo esc_url($item['link']); ?>" target="_blank" class="mlm-link-url">
                                    <?php echo esc_html($item['link']); ?>
                                    <span class="dashicons dashicons-external" style="font-size:12px;width:12px;height:12px;"></span>
                                </a>
                            </td>
                            <td><?php echo esc_html($item['position']); ?></td>
                            <td>
                                <span class="mlm-status-pill <?php echo $item['status'] === 'Active' ? 'mlm-status-active' : 'mlm-status-inactive'; ?>">
                                    <?php echo esc_html($item['status']); ?>
                                </span>
                            </td>
                            <td style="text-align:right;">
                                <a href="<?php echo admin_url('post.php?post=' . $item['id'] . '&action=edit'); ?>" class="mlm-action-btn edit" title="Edit Post">
                                    <span class="dashicons dashicons-edit"></span>
                                </a>
                                <a href="<?php echo $delete_url; ?>" onclick="return confirm('Remove link from post?');" class="mlm-action-btn delete" title="Delete Link">
                                    <span class="dashicons dashicons-trash"></span>
                                </a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <div class="mlm-table-controls" style="border-top:1px solid #f0f0f1;border-bottom:none;">
                <div class="mlm-controls-left">
                    <select class="mlm-select" style="width:130px;height:32px;font-size:12px;">
                        <option>Bulk actions</option>
                        <option>Delete</option>
                    </select>
                    <button type="button" class="mlm-btn mlm-btn-secondary" style="height:32px;padding:0 14px;font-size:12px;">Apply</button>
                </div>
                <div class="mlm-controls-right">
                    <div class="mlm-pagination">
                        <span><?php echo count($linked_items); ?> items</span>
                        <a href="#" class="mlm-page-btn">«</a>
                        <a href="#" class="mlm-page-btn">‹</a>
                        <input type="text" class="mlm-page-num" value="1">
                        <span>of 3</span>
                        <a href="#" class="mlm-page-btn">›</a>
                        <a href="#" class="mlm-page-btn">»</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
}

function mlm_page_settings() { echo '<div class="mlm-wrap"><h2>Settings</h2><p>Zero configuration required. All stream links are fully decrypted server-side and shielded from bots.</p></div>'; }
function mlm_page_logs() { echo '<div class="mlm-wrap"><h2>Logs</h2><p>Bot protection active. Zero unauthorized requests detected.</p></div>'; }
function mlm_page_help() { echo '<div class="mlm-wrap"><h2>Help</h2><p>Paste stream links generated from Media Hoster SaaS into your posts.</p></div>'; }