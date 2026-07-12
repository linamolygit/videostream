<?php
/**
 * Plugin Name: Media Link Manager
 * Description: Cloud Media Dashboard - Connects WordPress with Next.js VOD platform & Cloudflare Workers.
 * Version:     6.0
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
        'manage_options',
        'mlm-dashboard',
        'mlm_page_dashboard',
        'dashicons-video-alt3',
        4
    );
    add_submenu_page('mlm-dashboard', 'Dashboard',      'Dashboard',      'manage_options', 'mlm-dashboard',   'mlm_page_dashboard');
    add_submenu_page('mlm-dashboard', 'Media Links',    'Media Links',    'manage_options', 'mlm-links',       'mlm_page_links');
    add_submenu_page('mlm-dashboard', 'Add New Link',   'Add New Link',   'manage_options', 'mlm-add',         'mlm_page_add');
    add_submenu_page('mlm-dashboard', 'Blog Posts',     'Blog Posts',     'manage_options', 'mlm-posts',       'mlm_page_posts');
    add_submenu_page('mlm-dashboard', 'Analytics',      'Analytics',      'manage_options', 'mlm-analytics',   'mlm_page_analytics');
    add_submenu_page('mlm-dashboard', 'Settings',       'Settings',       'manage_options', 'mlm-settings',    'mlm_page_settings');
    add_submenu_page('mlm-dashboard', 'Documentation',  'Documentation',  'manage_options', 'mlm-docs',        'mlm_page_docs');
}

// ============================================================
// GLOBAL ADMIN STYLES (injected once)
// ============================================================
add_action('admin_head', 'mlm_admin_styles');
function mlm_admin_styles() {
    $screen = get_current_screen();
    if (!$screen || strpos($screen->id, 'mlm') === false) return;
    ?>
    <style>
        /* ---- Reset WP chrome on our pages ---- */
        #wpcontent { background: #f0f2f8 !important; }
        #wpbody-content .wrap { margin: 0; }
        .mlm-wrap * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

        /* ---- Layout ---- */
        .mlm-wrap { display: flex; min-height: 100vh; background: #f0f2f8; }
        .mlm-sidebar {
            width: 220px; min-height: 100vh; background: #fff;
            border-right: 1px solid #e8eaf0; padding: 0; flex-shrink: 0;
            position: sticky; top: 32px; height: calc(100vh - 32px); overflow-y: auto;
        }
        .mlm-sidebar-brand {
            padding: 22px 20px 18px; border-bottom: 1px solid #f0f2f8;
            display: flex; align-items: center; gap: 10px;
        }
        .mlm-brand-icon {
            width: 36px; height: 36px; background: linear-gradient(135deg, #6c63ff, #4a90e2);
            border-radius: 8px; display: flex; align-items: center; justify-content: center;
        }
        .mlm-brand-icon svg { width: 20px; height: 20px; fill: #fff; }
        .mlm-brand-text { line-height: 1.2; }
        .mlm-brand-text strong { display: block; font-size: 13px; color: #1a1a2e; font-weight: 700; }
        .mlm-brand-text span { font-size: 10px; color: #888; }
        .mlm-nav { padding: 10px 0; }
        .mlm-nav a {
            display: flex; align-items: center; gap: 10px; padding: 10px 20px;
            color: #555; text-decoration: none; font-size: 13px; font-weight: 500;
            border-left: 3px solid transparent; transition: all 0.15s;
        }
        .mlm-nav a:hover { background: #f5f7ff; color: #6c63ff; }
        .mlm-nav a.active { background: #f0eeff; color: #6c63ff; border-left-color: #6c63ff; font-weight: 600; }
        .mlm-nav a .nav-icon { width: 16px; height: 16px; opacity: 0.7; }
        .mlm-nav .nav-divider { height: 1px; background: #f0f2f8; margin: 8px 0; }
        .mlm-upgrade-box {
            margin: 15px; padding: 15px; background: linear-gradient(135deg, #6c63ff11, #4a90e211);
            border: 1px solid #6c63ff33; border-radius: 10px;
        }
        .mlm-upgrade-box p { font-size: 11px; color: #555; margin: 0 0 8px; }
        .mlm-upgrade-box ul { margin: 0 0 10px; padding-left: 14px; }
        .mlm-upgrade-box ul li { font-size: 11px; color: #555; margin-bottom: 3px; }
        .mlm-upgrade-btn {
            display: block; text-align: center; background: linear-gradient(135deg, #6c63ff, #4a90e2);
            color: #fff !important; padding: 8px; border-radius: 6px; font-size: 12px;
            font-weight: 600; text-decoration: none !important;
        }

        /* ---- Main Content ---- */
        .mlm-main { flex: 1; padding: 25px 30px; min-width: 0; }
        .mlm-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px; }
        .mlm-page-header h1 { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .mlm-page-header p { font-size: 13px; color: #888; margin: 4px 0 0; }
        .mlm-header-right { display: flex; align-items: center; gap: 12px; }
        .mlm-btn {
            display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px;
            border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
            border: none; text-decoration: none; transition: all 0.2s;
        }
        .mlm-btn-primary { background: linear-gradient(135deg, #6c63ff, #4a90e2); color: #fff !important; box-shadow: 0 4px 12px rgba(108,99,255,0.3); }
        .mlm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(108,99,255,0.4); }
        .mlm-btn-secondary { background: #fff; color: #555 !important; border: 1px solid #e0e3ec; }
        .mlm-btn-sm { padding: 5px 10px; font-size: 11px; }
        .mlm-btn-danger { background: #fff0f0; color: #e53e3e !important; border: 1px solid #fecaca; }

        /* ---- Stat Cards ---- */
        .mlm-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 25px; }
        .mlm-stat-card {
            background: #fff; border-radius: 12px; padding: 18px 20px;
            border: 1px solid #e8eaf0; display: flex; align-items: center; gap: 14px;
        }
        .mlm-stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mlm-stat-icon svg { width: 20px; height: 20px; }
        .mlm-stat-body {}
        .mlm-stat-label { font-size: 11px; color: #888; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .mlm-stat-value { font-size: 26px; font-weight: 700; color: #1a1a2e; line-height: 1.2; margin: 2px 0; }
        .mlm-stat-change { font-size: 11px; font-weight: 600; }
        .mlm-stat-change.up { color: #22c55e; }
        .mlm-stat-change.down { color: #ef4444; }

        /* ---- Card ---- */
        .mlm-card { background: #fff; border-radius: 12px; border: 1px solid #e8eaf0; overflow: hidden; }
        .mlm-card-header { padding: 16px 20px; border-bottom: 1px solid #f0f2f8; display: flex; align-items: center; justify-content: space-between; }
        .mlm-card-header h2 { font-size: 14px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .mlm-card-header p { font-size: 12px; color: #888; margin: 2px 0 0; }
        .mlm-card-body { padding: 20px; }

        /* ---- Table ---- */
        .mlm-table { width: 100%; border-collapse: collapse; }
        .mlm-table th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; font-weight: 600; padding: 10px 14px; text-align: left; border-bottom: 1px solid #f0f2f8; }
        .mlm-table td { padding: 12px 14px; border-bottom: 1px solid #f8f9fc; font-size: 13px; color: #333; vertical-align: middle; }
        .mlm-table tr:last-child td { border-bottom: none; }
        .mlm-table tr:hover td { background: #fafbff; }
        .mlm-thumb { width: 48px; height: 36px; object-fit: cover; border-radius: 6px; display: block; background: #eee; }
        .mlm-thumb-wrap { width: 48px; height: 36px; border-radius: 6px; overflow: hidden; background: linear-gradient(135deg, #6c63ff22, #4a90e222); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mlm-title-cell { display: flex; align-items: center; gap: 10px; }
        .mlm-title-info strong { font-size: 13px; color: #1a1a2e; display: block; }
        .mlm-title-info span { font-size: 11px; color: #888; }
        .mlm-badge { display: inline-block; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .mlm-badge-video { background: #ede9fe; color: #6c63ff; }
        .mlm-badge-carousel { background: #fef3c7; color: #d97706; }
        .mlm-badge-active { background: #dcfce7; color: #16a34a; }
        .mlm-badge-inactive { background: #f1f5f9; color: #64748b; }
        .mlm-url-cell { font-size: 11px; color: #6c63ff; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
        .mlm-actions-cell { display: flex; align-items: center; gap: 4px; }
        .mlm-action-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e8eaf0; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none; transition: all 0.15s; }
        .mlm-action-btn:hover { background: #f5f7ff; border-color: #6c63ff; }
        .mlm-action-btn svg { width: 13px; height: 13px; }
        .mlm-action-btn.delete:hover { background: #fff0f0; border-color: #fecaca; }

        /* ---- Quick Add Form ---- */
        .mlm-quick-add { background: #fafbff; border-radius: 12px; border: 1px solid #e8eaf0; padding: 20px; margin-top: 20px; }
        .mlm-quick-add h3 { font-size: 14px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
        .mlm-quick-add > p { font-size: 12px; color: #888; margin: 0 0 15px; }
        .mlm-form-row { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
        .mlm-form-group { flex: 1; min-width: 140px; }
        .mlm-form-group label { display: block; font-size: 11px; font-weight: 600; color: #555; margin-bottom: 5px; }
        .mlm-input {
            width: 100%; padding: 9px 12px; border: 1px solid #e0e3ec; border-radius: 7px;
            font-size: 13px; color: #333; background: #fff; outline: none; transition: border 0.2s;
        }
        .mlm-input:focus { border-color: #6c63ff; box-shadow: 0 0 0 3px rgba(108,99,255,0.08); }
        .mlm-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 30px; }

        /* ---- Post Preview Panel ---- */
        .mlm-two-col { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .mlm-preview-panel { background: #fff; border-radius: 12px; border: 1px solid #e8eaf0; overflow: hidden; }
        .mlm-preview-header { padding: 14px 16px; border-bottom: 1px solid #f0f2f8; display: flex; justify-content: space-between; align-items: center; }
        .mlm-preview-header h3 { font-size: 13px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .mlm-preview-body { padding: 16px; }
        .mlm-preview-title { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px; }
        .mlm-preview-thumb { width: 100%; aspect-ratio: 16/9; background: linear-gradient(135deg, #1a1a2e, #2d2d5a); border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; margin-bottom: 10px; }
        .mlm-preview-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .mlm-play-btn { width: 44px; height: 44px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: absolute; }
        .mlm-play-btn svg { width: 18px; height: 18px; fill: #6c63ff; margin-left: 2px; }
        .mlm-preview-text { font-size: 11px; color: #666; line-height: 1.5; margin-bottom: 10px; }
        .mlm-watch-btn { display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #6c63ff, #4a90e2); color: #fff; border: none; border-radius: 7px; padding: 9px 16px; font-size: 12px; font-weight: 600; cursor: pointer; width: 100%; justify-content: center; }

        /* ---- Analytics mini chart ---- */
        .mlm-mini-chart { height: 100px; width: 100%; position: relative; }
        .mlm-chart-bars { display: flex; align-items: flex-end; gap: 3px; height: 80px; padding: 0 0 5px; }
        .mlm-bar { flex: 1; border-radius: 3px 3px 0 0; min-height: 4px; }
        .mlm-chart-labels { display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }

        /* ---- Messages ---- */
        .mlm-notice { padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
        .mlm-notice-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
        .mlm-notice-error { background: #fff0f0; border: 1px solid #fecaca; color: #dc2626; }

        /* ---- Settings Form ---- */
        .mlm-settings-form .mlm-form-group { margin-bottom: 18px; min-width: 100%; }
        .mlm-settings-form .mlm-input { max-width: 480px; }
        .mlm-input-hint { font-size: 11px; color: #888; margin-top: 4px; }
        .mlm-input-wrap { position: relative; }
        .mlm-input-wrap .mlm-input { padding-right: 36px; }
        .mlm-input-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #888; padding: 0; }

        /* ---- Responsive ---- */
        @media (max-width: 1100px) {
            .mlm-stats-grid { grid-template-columns: repeat(2, 1fr); }
            .mlm-two-col { grid-template-columns: 1fr; }
        }
        @media (max-width: 780px) {
            .mlm-sidebar { display: none; }
        }
    </style>
    <script>
    function mlmCopyUUID(uuid) {
        navigator.clipboard.writeText(uuid).then(function() {
            var el = document.getElementById('mlm-copy-msg');
            if (el) { el.style.display = 'inline'; setTimeout(function(){ el.style.display='none'; }, 2000); }
        });
    }
    function mlmTogglePassword(id) {
        var inp = document.getElementById(id);
        if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
    }
    </script>
    <?php
}

// ============================================================
// HELPER: Sidebar HTML
// ============================================================
function mlm_sidebar($active = 'mlm-dashboard') {
    $pages = [
        'mlm-dashboard' => ['Dashboard', '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>'],
        'mlm-links'     => ['Media Links', '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm1-4H8v2h8v-2z"/></svg>'],
        'mlm-add'       => ['Add New Link', '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>'],
        'mlm-posts'     => ['Blog Posts', '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>'],
        'mlm-analytics' => ['Analytics', '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>'],
        'mlm-settings'  => ['Settings', '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 8.5 12 8.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm7.43-2.47c.04-.34.07-.68.07-1.03s-.03-.69-.07-1.03l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 3.18 14.25 3 14 3h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.34-.07.69-.07 1.03s.03.69.07 1.03l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63z"/></svg>'],
        'mlm-docs'      => ['Documentation', '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8zm0-4h8v2H8zm0-4h4v2H8z"/></svg>'],
    ];
    $upgrade_items = ['Unlimited Links', 'Advanced Analytics', 'Custom Domains', 'Priority Support'];
    echo '<div class="mlm-sidebar">';
    echo '<div class="mlm-sidebar-brand">
        <div class="mlm-brand-icon"><svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg></div>
        <div class="mlm-brand-text"><strong>Media Link Manager</strong><span>Cloud Media Dashboard</span></div>
    </div>';
    echo '<nav class="mlm-nav">';
    foreach ($pages as $slug => $info) {
        $cls = ($active === $slug) ? ' active' : '';
        echo '<a href="' . admin_url('admin.php?page=' . $slug) . '" class="mlm-nav' . $cls . '">' . $info[1] . $info[0] . '</a>';
    }
    echo '<div class="nav-divider"></div>';
    echo '<a href="' . admin_url('admin.php?page=mlm-docs') . '" class="mlm-nav"><svg class="nav-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>Help & Support</a>';
    echo '</nav>';
    echo '<div class="mlm-upgrade-box">';
    echo '<p>⭐ Upgrade to Pro</p><ul>';
    foreach ($upgrade_items as $item) echo '<li>✓ ' . $item . '</li>';
    echo '</ul>';
    echo '<a href="#" class="mlm-upgrade-btn">Upgrade Now</a>';
    echo '</div>';
    echo '</div>';
}

// ============================================================
// HELPER: Get stats from Next.js
// ============================================================
function mlm_get_api_stats() {
    $nextjs_url = rtrim(get_option('ems_nextjs_api_url', ''), '/');
    $api_token  = get_option('ems_api_token', '');
    if (empty($nextjs_url) || empty($api_token)) return null;
    $resp = wp_remote_get($nextjs_url . '/api/videos', [
        'headers' => ['Authorization' => 'Bearer ' . $api_token],
        'timeout' => 5,
    ]);
    if (is_wp_error($resp)) return null;
    $body = json_decode(wp_remote_retrieve_body($resp), true);
    return isset($body['videos']) ? $body['videos'] : null;
}

// ============================================================
// PAGE: Dashboard
// ============================================================
function mlm_page_dashboard() {
    $videos = mlm_get_api_stats();
    $total_links = $videos ? count($videos) : 0;
    $nextjs_url = get_option('ems_nextjs_api_url', '');
    ?>
    <div class="mlm-wrap">
        <?php mlm_sidebar('mlm-dashboard'); ?>
        <div class="mlm-main">
            <!-- Header -->
            <div class="mlm-page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Manage and track all your remote media links in one place.</p>
                </div>
                <div class="mlm-header-right">
                    <a href="<?php echo admin_url('admin.php?page=mlm-settings'); ?>" class="mlm-btn mlm-btn-secondary">
                        <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 8.5 12 8.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm7.43-2.47c.04-.34.07-.68.07-1.03s-.03-.69-.07-1.03l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 3.18 14.25 3 14 3h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.63c-.04.34-.07.69-.07 1.03s.03.69.07 1.03l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.63z"/></svg>
                        Quick Setup
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=mlm-add'); ?>" class="mlm-btn mlm-btn-primary">
                        <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        Add New Link
                    </a>
                </div>
            </div>

            <!-- Stats -->
            <div class="mlm-stats-grid">
                <?php
                $stats = [
                    ['Total Links', $total_links, '12% this month', 'up', '#ede9fe', '#6c63ff', '<path fill="currentColor" d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm1-4H8v2h8v-2z"/>'],
                    ['Total Views', '—', '18% this month', 'up', '#fef3c7', '#d97706', '<path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>'],
                    ['Total Clicks', '—', '22% this month', 'up', '#dcfce7', '#16a34a', '<path fill="currentColor" d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>'],
                    ['Bandwidth', '—', '16% this month', 'up', '#e0f2fe', '#0284c7', '<path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>'],
                ];
                foreach ($stats as $s) :
                ?>
                <div class="mlm-stat-card">
                    <div class="mlm-stat-icon" style="background:<?php echo $s[4]; ?>; color:<?php echo $s[5]; ?>;">
                        <svg viewBox="0 0 24 24"><?php echo $s[6]; ?></svg>
                    </div>
                    <div class="mlm-stat-body">
                        <div class="mlm-stat-label"><?php echo $s[0]; ?></div>
                        <div class="mlm-stat-value"><?php echo $s[1]; ?></div>
                        <div class="mlm-stat-change <?php echo $s[3]; ?>">↑ <?php echo $s[2]; ?></div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>

            <!-- Two column: media list + preview panel -->
            <div class="mlm-two-col">
                <div>
                    <!-- Recent Media Links Table -->
                    <div class="mlm-card" style="margin-bottom:20px;">
                        <div class="mlm-card-header">
                            <div><h2>Your Media Links</h2><p>All your video and image links hosted on external servers.</p></div>
                            <div style="display:flex;gap:8px;">
                                <input type="text" class="mlm-input" placeholder="Search links..." style="width:160px;padding:6px 10px;font-size:12px;">
                                <a href="<?php echo admin_url('admin.php?page=mlm-add'); ?>" class="mlm-btn mlm-btn-primary mlm-btn-sm">+ Add New Link</a>
                            </div>
                        </div>
                        <div>
                        <?php if (empty($nextjs_url)): ?>
                            <div style="padding:30px;text-align:center;color:#888;">
                                <p>⚙️ Please configure your Next.js API URL in <a href="<?php echo admin_url('admin.php?page=mlm-settings'); ?>">Settings</a> first.</p>
                            </div>
                        <?php elseif (!$videos): ?>
                            <div style="padding:30px;text-align:center;color:#888;">
                                <p>No media links found or could not connect to API.</p>
                                <a href="<?php echo admin_url('admin.php?page=mlm-add'); ?>" class="mlm-btn mlm-btn-primary" style="margin-top:10px;">Add Your First Link</a>
                            </div>
                        <?php else: ?>
                            <table class="mlm-table">
                                <thead><tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Source URL</th>
                                    <th>UUID / Shortcode</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr></thead>
                                <tbody>
                                <?php foreach (array_slice($videos, 0, 8) as $v): ?>
                                <tr>
                                    <td>
                                        <div class="mlm-title-cell">
                                            <div class="mlm-thumb-wrap">
                                                <?php if (!empty($v['thumbnail_path'])): ?>
                                                    <img src="<?php echo esc_url($v['thumbnail_path']); ?>" class="mlm-thumb" alt="">
                                                <?php else: ?>
                                                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#6c63ff" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                                                <?php endif; ?>
                                            </div>
                                            <div class="mlm-title-info">
                                                <strong><?php echo esc_html($v['title'] ?? 'Untitled'); ?></strong>
                                                <span><?php echo isset($v['created_at']) ? date('M j, Y', strtotime($v['created_at'])) : ''; ?></span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span class="mlm-badge mlm-badge-video">Video</span></td>
                                    <td><span class="mlm-url-cell" title="<?php echo esc_attr($v['original_source_url'] ?? ''); ?>"><?php echo esc_html($v['original_source_url'] ?? '—'); ?></span></td>
                                    <td>
                                        <code style="background:#f0eeff;color:#6c63ff;padding:3px 7px;border-radius:4px;font-size:11px;"><?php echo esc_html($v['video_uuid'] ?? ''); ?></code>
                                        <span id="mlm-copy-msg" style="display:none;font-size:10px;color:#16a34a;margin-left:4px;">Copied!</span>
                                        <button onclick="mlmCopyUUID('<?php echo esc_js($v['video_uuid'] ?? ''); ?>')" style="background:none;border:none;cursor:pointer;padding:2px;margin-left:4px;" title="Copy UUID">
                                            <svg width="12" height="12" viewBox="0 0 24 24"><path fill="#888" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                                        </button>
                                    </td>
                                    <td><span class="mlm-badge mlm-badge-active">Active</span></td>
                                    <td>
                                        <div class="mlm-actions-cell">
                                            <a href="<?php echo admin_url('admin.php?page=mlm-links&preview=' . esc_attr($v['video_uuid'] ?? '')); ?>" class="mlm-action-btn" title="Preview">
                                                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                            </a>
                                            <a href="<?php echo admin_url('admin.php?page=mlm-add&edit=' . esc_attr($v['id'] ?? '')); ?>" class="mlm-action-btn" title="Edit">
                                                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                                </tbody>
                            </table>
                        <?php endif; ?>
                        </div>
                    </div>

                    <!-- Quick Add Form -->
                    <div class="mlm-quick-add">
                        <h3>Quick Add New Link</h3>
                        <p>Add a new video or image carousel link from your external server.</p>
                        <form method="post" action="<?php echo admin_url('admin.php?page=mlm-add'); ?>">
                            <div class="mlm-form-row">
                                <div class="mlm-form-group" style="flex:2;">
                                    <label>Video/Image URL</label>
                                    <input name="quick_url" class="mlm-input" placeholder="https://your-server.com/media/your-file.mp4" type="url">
                                </div>
                                <div class="mlm-form-group">
                                    <label>Type</label>
                                    <select name="quick_type" class="mlm-input mlm-select">
                                        <option>Video</option>
                                        <option>Image Carousel</option>
                                    </select>
                                </div>
                                <div class="mlm-form-group">
                                    <label>Link Title</label>
                                    <input name="quick_title" class="mlm-input" placeholder="Link Title (optional)" type="text">
                                </div>
                                <div>
                                    <label style="font-size:11px;color:transparent;">-</label><br>
                                    <a href="<?php echo admin_url('admin.php?page=mlm-add'); ?>" class="mlm-btn mlm-btn-primary">+ Add Link</a>
                                </div>
                            </div>
                            <p style="font-size:11px;color:#aaa;margin-top:10px;">Supports: MP4, WebM, JPG, PNG and direct links from your server or CDN.</p>
                        </form>
                    </div>

                    <!-- Feature Highlights -->
                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-top:20px;">
                        <?php
                        $features = [
                            ['🌐', 'Remote Hosting', 'Host your media anywhere'],
                            ['⚡', 'Lightning Fast', 'Global CDN Delivery'],
                            ['📊', 'Track Everything', 'Real-time Analytics'],
                            ['🔧', 'Easy Integration', 'Enterprise Grade Shortcodes'],
                            ['🔒', 'Secure & Reliable', 'Enterprise Grade Security'],
                        ];
                        foreach ($features as $f):
                        ?>
                        <div style="background:#fff;border-radius:10px;border:1px solid #e8eaf0;padding:14px;text-align:center;">
                            <div style="font-size:22px;margin-bottom:6px;"><?php echo $f[0]; ?></div>
                            <div style="font-size:11px;font-weight:700;color:#1a1a2e;margin-bottom:3px;"><?php echo $f[1]; ?></div>
                            <div style="font-size:10px;color:#888;"><?php echo $f[2]; ?></div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Right: Preview + Mini Analytics -->
                <div>
                    <div class="mlm-preview-panel" style="margin-bottom:16px;">
                        <div class="mlm-preview-header">
                            <h3>Post Preview</h3>
                            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#888" d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                        </div>
                        <div class="mlm-preview-body">
                            <div class="mlm-preview-title">How Your Video Appears in Posts</div>
                            <div class="mlm-preview-thumb">
                                <div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a1a2e,#2d2d5a);display:flex;align-items:center;justify-content:center;">
                                    <div class="mlm-play-btn">
                                        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <p class="mlm-preview-text">When a visitor clicks play on your WordPress post, the secure ghost player loads the video from your CDN through our Cloudflare Edge Worker.</p>
                            <button class="mlm-watch-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    <div class="mlm-card">
                        <div class="mlm-card-header">
                            <div><h2>Analytics Overview</h2></div>
                        </div>
                        <div class="mlm-card-body">
                            <div class="mlm-chart-bars">
                                <?php
                                $bar_heights = [30, 55, 40, 70, 50, 90, 65, 80, 45, 75, 60, 95, 70, 85];
                                $colors = ['#6c63ff', '#4a90e2'];
                                foreach ($bar_heights as $i => $h):
                                ?>
                                <div class="mlm-bar" style="height:<?php echo $h; ?>%;background:<?php echo $colors[$i % 2]; ?>;opacity:<?php echo ($i % 2 === 0) ? '1' : '0.5'; ?>;"></div>
                                <?php endforeach; ?>
                            </div>
                            <div class="mlm-chart-labels">
                                <span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 29</span>
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;">
                                <div style="background:#f8f9fc;border-radius:8px;padding:10px;text-align:center;">
                                    <div style="font-size:10px;color:#888;">Avg. Daily Views</div>
                                    <div style="font-size:18px;font-weight:700;color:#1a1a2e;">—</div>
                                </div>
                                <div style="background:#f8f9fc;border-radius:8px;padding:10px;text-align:center;">
                                    <div style="font-size:10px;color:#888;">Avg. Daily Clicks</div>
                                    <div style="font-size:18px;font-weight:700;color:#1a1a2e;">—</div>
                                </div>
                            </div>
                            <div style="margin-top:14px;">
                                <div style="display:flex;justify-content:space-between;font-size:11px;color:#888;margin-bottom:5px;">
                                    <span>Storage & Bandwidth</span>
                                    <span style="color:#6c63ff;"><?php echo $total_links; ?> Links / Unlimited</span>
                                </div>
                                <div style="background:#f0f2f8;border-radius:4px;height:6px;">
                                    <div style="background:linear-gradient(90deg,#6c63ff,#4a90e2);border-radius:4px;height:6px;width:<?php echo min(($total_links / 10) * 100, 100); ?>%;"></div>
                                </div>
                                <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;">
                                    <span style="color:#888;">Active Domains: <strong style="color:#1a1a2e;">1</strong></span>
                                    <span style="color:#16a34a;font-weight:600;">● All Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ============================================================
// PAGE: Media Links (Full list)
// ============================================================
function mlm_page_links() {
    $videos = mlm_get_api_stats();
    ?>
    <div class="mlm-wrap">
        <?php mlm_sidebar('mlm-links'); ?>
        <div class="mlm-main">
            <div class="mlm-page-header">
                <div><h1>Media Links</h1><p>All your video and image links hosted on external servers.</p></div>
                <a href="<?php echo admin_url('admin.php?page=mlm-add'); ?>" class="mlm-btn mlm-btn-primary">+ Add New Link</a>
            </div>
            <div class="mlm-card">
                <div class="mlm-card-body" style="padding:0;">
                <?php if (!$videos): ?>
                    <div style="padding:40px;text-align:center;color:#888;">
                        <p>No media links found. <a href="<?php echo admin_url('admin.php?page=mlm-settings'); ?>">Check your settings</a> or <a href="<?php echo admin_url('admin.php?page=mlm-add'); ?>">add your first link</a>.</p>
                    </div>
                <?php else: ?>
                    <table class="mlm-table">
                        <thead><tr>
                            <th>Title</th><th>Type</th><th>Source URL</th><th>UUID / Shortcode</th><th>Status</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                        <?php foreach ($videos as $v): ?>
                        <tr>
                            <td>
                                <div class="mlm-title-cell">
                                    <div class="mlm-thumb-wrap">
                                        <?php if (!empty($v['thumbnail_path'])): ?>
                                            <img src="<?php echo esc_url($v['thumbnail_path']); ?>" class="mlm-thumb" alt="">
                                        <?php else: ?>
                                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#6c63ff" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                                        <?php endif; ?>
                                    </div>
                                    <div class="mlm-title-info">
                                        <strong><?php echo esc_html($v['title'] ?? 'Untitled'); ?></strong>
                                        <span><?php echo isset($v['created_at']) ? date('M j, Y', strtotime($v['created_at'])) : ''; ?></span>
                                    </div>
                                </div>
                            </td>
                            <td><span class="mlm-badge mlm-badge-video">Video</span></td>
                            <td><span class="mlm-url-cell" title="<?php echo esc_attr($v['original_source_url'] ?? ''); ?>"><?php echo esc_html($v['original_source_url'] ?? '—'); ?></span></td>
                            <td>
                                <code style="background:#f0eeff;color:#6c63ff;padding:3px 7px;border-radius:4px;font-size:11px;"><?php echo esc_html($v['video_uuid'] ?? ''); ?></code>
                                <button onclick="mlmCopyUUID('<?php echo esc_js($v['video_uuid'] ?? ''); ?>')" style="background:none;border:none;cursor:pointer;padding:2px 4px;" title="Copy UUID">
                                    <svg width="12" height="12" viewBox="0 0 24 24"><path fill="#888" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                                </button>
                            </td>
                            <td><span class="mlm-badge mlm-badge-active">Active</span></td>
                            <td>
                                <div class="mlm-actions-cell">
                                    <a href="<?php echo admin_url('admin.php?page=mlm-links&preview=' . esc_attr($v['video_uuid'] ?? '')); ?>" class="mlm-action-btn" title="Preview">
                                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ============================================================
// PAGE: Add New Link (redirect to Next.js dashboard)
// ============================================================
function mlm_page_add() {
    $nextjs_url = rtrim(get_option('ems_nextjs_api_url', ''), '/');
    ?>
    <div class="mlm-wrap">
        <?php mlm_sidebar('mlm-add'); ?>
        <div class="mlm-main">
            <div class="mlm-page-header">
                <div><h1>Add New Media Link</h1><p>Add a new video or image link from your external server or CDN.</p></div>
            </div>
            <div class="mlm-card">
                <div class="mlm-card-header"><h2>New Media Entry</h2></div>
                <div class="mlm-card-body">
                    <?php if (empty($nextjs_url)): ?>
                        <div class="mlm-notice mlm-notice-error">⚠️ Next.js API URL not configured. Please go to <a href="<?php echo admin_url('admin.php?page=mlm-settings'); ?>">Settings</a> first.</div>
                    <?php else: ?>
                        <p style="font-size:13px;color:#555;margin-bottom:20px;">
                            To add a new video, visit your <strong>Next.js Admin Video Manager</strong> where you can add the video link, thumbnail, and get the UUID shortcode to paste into any WordPress post.
                        </p>
                        <a href="<?php echo esc_url($nextjs_url . '/admin/videos'); ?>" target="_blank" class="mlm-btn mlm-btn-primary" style="font-size:14px;padding:12px 24px;">
                            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            Open Video Manager →
                        </a>
                        <div style="margin-top:30px;padding:20px;background:#f8f9fc;border-radius:10px;border:1px solid #e8eaf0;">
                            <h3 style="font-size:13px;font-weight:700;color:#1a1a2e;margin:0 0 12px;">How to add a video — 3 Steps:</h3>
                            <div style="display:flex;flex-direction:column;gap:10px;">
                                <?php
                                $steps = [
                                    ['1', '#6c63ff', 'Open Video Manager', 'Click the button above to open your Next.js dashboard.'],
                                    ['2', '#4a90e2', 'Fill the form', 'Enter Video Title, Thumbnail URL (R2/CDN), and the actual Video Source URL (qu.ax, videy, R2, etc).'],
                                    ['3', '#16a34a', 'Copy UUID & paste in WordPress', 'After saving, you\'ll get a UUID like <code style="background:#e8f5e9;padding:1px 5px;border-radius:3px;">a1b2c3d4</code>. Paste it into any WordPress post using the shortcode: <code style="background:#e8f5e9;padding:1px 5px;border-radius:3px;">[ems_video uuid="a1b2c3d4"]</code>'],
                                ];
                                foreach ($steps as $step):
                                ?>
                                <div style="display:flex;align-items:flex-start;gap:12px;">
                                    <div style="width:26px;height:26px;background:<?php echo $step[1]; ?>;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;flex-shrink:0;"><?php echo $step[0]; ?></div>
                                    <div>
                                        <strong style="font-size:12px;color:#1a1a2e;"><?php echo $step[1+1]; ?></strong>
                                        <p style="font-size:12px;color:#666;margin:2px 0 0;"><?php echo $step[2+1]; ?></p>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ============================================================
// PAGE: Blog Posts (assign UUID to posts)
// ============================================================
function mlm_page_posts() {
    $videos = mlm_get_api_stats();
    $video_options = [];
    if ($videos) {
        foreach ($videos as $v) {
            $video_options[$v['video_uuid']] = $v['title'] . ' (' . $v['video_uuid'] . ')';
        }
    }

    if (isset($_POST['mlm_assign_nonce']) && wp_verify_nonce($_POST['mlm_assign_nonce'], 'mlm_assign_video')) {
        $post_id  = intval($_POST['mlm_post_id'] ?? 0);
        $uuid     = sanitize_text_field($_POST['mlm_video_uuid'] ?? '');
        if ($post_id) {
            update_post_meta($post_id, '_ems_video_uuid', $uuid);
            echo '<div class="mlm-notice mlm-notice-success" style="margin:0 0 16px;">✓ Video assigned to post successfully!</div>';
        }
    }

    $posts = get_posts(['numberposts' => 50, 'post_status' => 'publish']);
    ?>
    <div class="mlm-wrap">
        <?php mlm_sidebar('mlm-posts'); ?>
        <div class="mlm-main">
            <div class="mlm-page-header">
                <div><h1>Blog Posts</h1><p>Assign media links to your WordPress posts.</p></div>
            </div>
            <div class="mlm-card">
                <div class="mlm-card-header"><h2>Assign Video to Post</h2></div>
                <div class="mlm-card-body">
                    <form method="post">
                        <?php wp_nonce_field('mlm_assign_video', 'mlm_assign_nonce'); ?>
                        <div class="mlm-form-row" style="align-items:flex-end;">
                            <div class="mlm-form-group" style="flex:2;">
                                <label>Select Post</label>
                                <select name="mlm_post_id" class="mlm-input mlm-select">
                                    <option value="">— Choose a post —</option>
                                    <?php foreach ($posts as $p): ?>
                                    <option value="<?php echo $p->ID; ?>"><?php echo esc_html($p->post_title); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="mlm-form-group" style="flex:2;">
                                <label>Select Video UUID</label>
                                <select name="mlm_video_uuid" class="mlm-input mlm-select">
                                    <option value="">— None / Remove —</option>
                                    <?php foreach ($video_options as $uuid => $label): ?>
                                    <option value="<?php echo esc_attr($uuid); ?>"><?php echo esc_html($label); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div>
                                <button type="submit" class="mlm-btn mlm-btn-primary">Assign Video</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div class="mlm-card" style="margin-top:20px;">
                <div class="mlm-card-header"><h2>Posts with Media Assigned</h2></div>
                <div class="mlm-card-body" style="padding:0;">
                    <table class="mlm-table">
                        <thead><tr><th>Post Title</th><th>Status</th><th>Assigned UUID</th><th>Shortcode</th><th>Actions</th></tr></thead>
                        <tbody>
                        <?php foreach ($posts as $p):
                            $uuid = get_post_meta($p->ID, '_ems_video_uuid', true);
                        ?>
                        <tr>
                            <td><strong><?php echo esc_html($p->post_title); ?></strong></td>
                            <td><span class="mlm-badge mlm-badge-active"><?php echo esc_html($p->post_status); ?></span></td>
                            <td>
                                <?php if ($uuid): ?>
                                    <code style="background:#f0eeff;color:#6c63ff;padding:3px 7px;border-radius:4px;font-size:11px;"><?php echo esc_html($uuid); ?></code>
                                <?php else: ?>
                                    <span style="color:#aaa;font-size:12px;">— not assigned —</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if ($uuid): ?>
                                    <code style="background:#f0eeff;color:#6c63ff;padding:2px 6px;border-radius:4px;font-size:10px;">[ems_video uuid="<?php echo esc_html($uuid); ?>"]</code>
                                <?php else: ?>—<?php endif; ?>
                            </td>
                            <td>
                                <a href="<?php echo get_edit_post_link($p->ID); ?>" class="mlm-btn mlm-btn-secondary mlm-btn-sm">Edit Post</a>
                                <a href="<?php echo get_permalink($p->ID); ?>" target="_blank" class="mlm-btn mlm-btn-secondary mlm-btn-sm">View</a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ============================================================
// PAGE: Analytics (placeholder)
// ============================================================
function mlm_page_analytics() {
    ?>
    <div class="mlm-wrap">
        <?php mlm_sidebar('mlm-analytics'); ?>
        <div class="mlm-main">
            <div class="mlm-page-header">
                <div><h1>Analytics</h1><p>Real-time views, clicks, and bandwidth data.</p></div>
            </div>
            <div class="mlm-card">
                <div class="mlm-card-body" style="text-align:center;padding:60px;">
                    <div style="font-size:48px;margin-bottom:16px;">📊</div>
                    <h2 style="font-size:18px;font-weight:700;color:#1a1a2e;margin-bottom:8px;">Analytics Coming Soon</h2>
                    <p style="color:#888;font-size:14px;max-width:400px;margin:0 auto 20px;">Advanced analytics including views per video, click-through rates, and geographic data will be available in the next update.</p>
                    <span class="mlm-badge" style="background:#f0eeff;color:#6c63ff;font-size:12px;padding:6px 14px;">Pro Feature</span>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ============================================================
// PAGE: Settings
// ============================================================
function mlm_page_settings() {
    if (isset($_POST['mlm_save_settings']) && check_admin_referer('mlm_settings_nonce')) {
        update_option('ems_nextjs_api_url', esc_url_raw($_POST['ems_nextjs_api_url'] ?? ''));
        update_option('ems_api_token', sanitize_text_field($_POST['ems_api_token'] ?? ''));
        echo '<div class="mlm-notice mlm-notice-success" style="margin-bottom:16px;">✓ Settings saved successfully!</div>';
    }
    $nextjs_url = get_option('ems_nextjs_api_url', '');
    $api_token  = get_option('ems_api_token', '');
    ?>
    <div class="mlm-wrap">
        <?php mlm_sidebar('mlm-settings'); ?>
        <div class="mlm-main">
            <div class="mlm-page-header">
                <div><h1>Settings</h1><p>Configure your Next.js backend connection.</p></div>
            </div>
            <div class="mlm-card">
                <div class="mlm-card-header"><h2>API Configuration</h2></div>
                <div class="mlm-card-body">
                    <form method="post" class="mlm-settings-form">
                        <?php wp_nonce_field('mlm_settings_nonce'); ?>
                        <div class="mlm-form-group">
                            <label>Next.js Backend API URL</label>
                            <input type="url" name="ems_nextjs_api_url" value="<?php echo esc_url($nextjs_url); ?>" class="mlm-input" placeholder="https://backend-nine-smoky-38.vercel.app">
                            <p class="mlm-input-hint">The base URL of your deployed Next.js Vercel app (no trailing slash).</p>
                        </div>
                        <div class="mlm-form-group">
                            <label>Secure API Auth Token</label>
                            <div class="mlm-input-wrap">
                                <input type="password" id="mlm_api_token_input" name="ems_api_token" value="<?php echo esc_attr($api_token); ?>" class="mlm-input" placeholder="Paste your API Token from your Next.js Profile page">
                                <button type="button" class="mlm-input-eye" onclick="mlmTogglePassword('mlm_api_token_input')">
                                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                </button>
                            </div>
                            <p class="mlm-input-hint">Copy this from your <strong>Profile page</strong> on your Next.js site. Go to <a href="<?php echo esc_url($nextjs_url . '/profile'); ?>" target="_blank">→ Open Profile</a>.</p>
                        </div>
                        <button type="submit" name="mlm_save_settings" class="mlm-btn mlm-btn-primary">Save Settings</button>
                    </form>

                    <?php if ($nextjs_url && $api_token): ?>
                    <div style="margin-top:24px;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
                        <p style="font-size:13px;font-weight:600;color:#16a34a;margin:0 0 8px;">✓ Connection Configured</p>
                        <p style="font-size:12px;color:#555;margin:0;">
                            API URL: <code style="background:#fff;padding:2px 6px;border-radius:4px;"><?php echo esc_html($nextjs_url); ?></code>
                        </p>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ============================================================
// PAGE: Documentation
// ============================================================
function mlm_page_docs() {
    $nextjs_url = get_option('ems_nextjs_api_url', 'https://your-nextjs-site.vercel.app');
    ?>
    <div class="mlm-wrap">
        <?php mlm_sidebar('mlm-docs'); ?>
        <div class="mlm-main">
            <div class="mlm-page-header">
                <div><h1>Documentation</h1><p>Complete setup guide for Media Link Manager.</p></div>
            </div>
            <div class="mlm-card">
                <div class="mlm-card-header"><h2>🚀 Quick Start Guide</h2></div>
                <div class="mlm-card-body" style="max-width:700px;">
                    <?php
                    $doc_steps = [
                        ['1', '#6c63ff', 'Configure Settings', 'Go to <strong>Settings</strong> page and paste your Next.js Vercel URL and your API Token (get it from your Next.js site\'s Profile page).'],
                        ['2', '#4a90e2', 'Add a Video via Next.js Dashboard', 'Go to <strong>Add New Link</strong> → click "Open Video Manager". Fill in Title, Thumbnail URL, and Video Source URL. Click Submit. You\'ll get a UUID like <code>a1b2c3d4</code>.'],
                        ['3', '#16a34a', 'Assign to a WordPress Post', 'Go to <strong>Blog Posts</strong>. Select the post and the video UUID from the dropdowns, then click "Assign Video".'],
                        ['4', '#d97706', 'Video Auto-Plays for Real Visitors', 'When a real human visitor lands on your post via Facebook/Instagram ad, the ghost thumbnail appears. On click, it streams securely via Cloudflare Worker.'],
                        ['5', '#dc2626', 'Bots see only Article Text', 'Google AdX reviewers, bots, and crawlers see only the article text — no video player — ensuring ad policy compliance.'],
                    ];
                    foreach ($doc_steps as $step):
                    ?>
                    <div style="display:flex;gap:14px;margin-bottom:22px;padding-bottom:22px;border-bottom:1px solid #f0f2f8;">
                        <div style="width:32px;height:32px;background:<?php echo $step[1]; ?>;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;flex-shrink:0;"><?php echo $step[0]; ?></div>
                        <div>
                            <strong style="font-size:14px;color:#1a1a2e;display:block;margin-bottom:4px;"><?php echo $step[2]; ?></strong>
                            <p style="font-size:13px;color:#666;margin:0;line-height:1.6;"><?php echo $step[3]; ?></p>
                        </div>
                    </div>
                    <?php endforeach; ?>

                    <div style="background:#1a1a2e;border-radius:10px;padding:20px;margin-top:10px;">
                        <p style="color:#aaa;font-size:11px;margin:0 0 8px;font-family:monospace;">SHORTCODE USAGE IN POST CONTENT:</p>
                        <code style="color:#6c63ff;font-size:14px;font-family:monospace;">[ems_video uuid="a1b2c3d4"]</code>
                        <p style="color:#aaa;font-size:11px;margin:12px 0 0;">Replace <em>a1b2c3d4</em> with the actual UUID from your Video Manager.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
}

// ============================================================
// SHORTCODE: [ems_video uuid="xxx"]
// ============================================================
add_shortcode('ems_video', 'mlm_shortcode_video');
function mlm_shortcode_video($atts) {
    $atts = shortcode_atts(['uuid' => ''], $atts);
    $uuid = sanitize_text_field($atts['uuid']);
    if (empty($uuid)) return '';

    $nextjs_url = rtrim(get_option('ems_nextjs_api_url', ''), '/');
    if (empty($nextjs_url)) return '';

    $post_id = get_the_ID();
    $nonce   = wp_create_nonce('ems_secure_comm');
    ob_start();
    ?>
    <div id="ems-player-<?php echo esc_attr($uuid); ?>" style="margin:20px auto;max-width:800px;width:100%;"></div>
    <script>
    (function(){
        var container = document.getElementById('ems-player-<?php echo esc_js($uuid); ?>');
        if(!container) return;
        fetch('<?php echo esc_url($nextjs_url); ?>/api/media?action=get_thumb&uuid=<?php echo esc_js($uuid); ?>&wp_nonce=<?php echo esc_js($nonce); ?>')
        .then(function(r){return r.json();})
        .then(function(data){
            if(!data.success) return;
            container.innerHTML = '<div id="ems-w-<?php echo esc_js($uuid); ?>" style="position:relative;width:100%;cursor:pointer;overflow:hidden;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.3);">'
                +'<img src="'+data.thumbnail+'" style="width:100%;display:block;aspect-ratio:16/9;object-fit:cover;">'
                +'<div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;justify-content:center;align-items:center;">'
                +'<div style="width:68px;height:68px;background:#fff;border-radius:50%;display:flex;justify-content:center;align-items:center;box-shadow:0 4px 20px rgba(0,0,0,0.3);">'
                +'<svg viewBox="0 0 24 24" style="width:28px;height:28px;fill:#6c63ff;margin-left:3px;"><path d="M8 5v14l11-7z"/></svg>'
                +'</div></div></div>';
            document.getElementById('ems-w-<?php echo esc_js($uuid); ?>').addEventListener('click', function(e){
                if(!e.isTrusted) return;
                container.innerHTML = '<div style="width:100%;aspect-ratio:16/9;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;border-radius:12px;">Loading secure stream...</div>';
                fetch('<?php echo esc_url($nextjs_url); ?>/api/media?action=get_stream&uuid=<?php echo esc_js($uuid); ?>')
                .then(function(r){return r.json();})
                .then(function(s){
                    if(s.success){ container.innerHTML = s.player_html; }
                    else { container.innerHTML = '<p style="color:red;text-align:center;">Stream unavailable.</p>'; }
                });
            });
        });
    })();
    </script>
    <?php
    return ob_get_clean();
}

// ============================================================
// CONTENT FILTER: Auto-inject for posts with UUID in post meta
// ============================================================
add_filter('the_content', 'mlm_auto_inject_player');
function mlm_auto_inject_player($content) {
    if (!is_single()) return $content;

    // Bot detection
    $ua = isset($_SERVER['HTTP_USER_AGENT']) ? strtolower($_SERVER['HTTP_USER_AGENT']) : '';
    $bots = ['bot', 'crawl', 'spider', 'slurp', 'facebookexternalhit', 'mediapartners-google', 'adsbot-google', 'googlebot', 'adx', 'applebot', 'bingbot'];
    foreach ($bots as $bot) { if (strpos($ua, $bot) !== false) return $content; }

    global $post;
    $uuid = get_post_meta($post->ID, '_ems_video_uuid', true);
    if (empty($uuid)) return $content;

    // Check social traffic
    $is_social = isset($_GET['fbclid']) || isset($_GET['igshid']) || isset($_GET['internal_loop'])
        || preg_match('/(FBAN|FBAV|FB_IAB|Instagram|IG_IAB)/i', isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '')
        || strpos(isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '', 'facebook.com') !== false
        || strpos(isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '', 'instagram.com') !== false;

    if (!$is_social) return $content;

    return mlm_shortcode_video(['uuid' => $uuid]) . $content;
}
