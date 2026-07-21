<?php
/**
 * Plugin Name: Media Link Manager (Zero-Config)
 * Description: Lightweight, bot-shielded stream link consumer for WordPress posts. Connects to Media Hoster SaaS without API keys.
 * Version:     7.0
 * Author:      RishavDev
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ============================================================
// ADMIN MENU REGISTRATION (No API Connection Settings)
// ============================================================
add_action('admin_menu', 'mlm_register_menu');
function mlm_register_menu() {
    add_menu_page(
        'Media Link Manager',
        'Media Links',
        'edit_posts',
        'mlm-manager',
        'mlm_page_manager',
        'dashicons-video-alt3',
        5
    );
    add_submenu_page('mlm-manager', 'Manage Links',  'Manage Links',  'edit_posts', 'mlm-manager', 'mlm_page_manager');
    add_submenu_page('mlm-manager', 'Documentation', 'Documentation', 'edit_posts', 'mlm-docs',    'mlm_page_docs');
}

// ============================================================
// ADMIN STYLES & SCRIPTS
// ============================================================
add_action('admin_head', 'mlm_admin_styles');
function mlm_admin_styles() {
    $screen = get_current_screen();
    if (!$screen || strpos($screen->id, 'mlm') === false) return;
    ?>
    <style>
        #wpcontent { background: #f4f6fb !important; }
        .mlm-wrap { max-width: 1100px; margin: 25px auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .mlm-header { background: #fff; border-radius: 14px; padding: 22px 28px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
        .mlm-header h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
        .mlm-header p { font-size: 13px; color: #64748b; margin: 4px 0 0; }
        .mlm-card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.03); overflow: hidden; margin-bottom: 24px; }
        .mlm-card-header { padding: 18px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .mlm-card-header h2 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
        .mlm-card-body { padding: 24px; }
        .mlm-form-grid { display: grid; grid-template-columns: 1.5fr 2fr 1fr auto; gap: 14px; align-items: flex-end; }
        .mlm-field label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; }
        .mlm-input, .mlm-select { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #1e293b; background: #fff; outline: none; transition: all 0.2s; }
        .mlm-input:focus, .mlm-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        .mlm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: all 0.2s; }
        .mlm-btn-primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff !important; box-shadow: 0 4px 12px rgba(99,102,241,0.25); }
        .mlm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.35); }
        .mlm-btn-sm { padding: 5px 12px; font-size: 12px; }
        .mlm-btn-danger { background: #fef2f2; color: #ef4444 !important; border: 1px solid #fecaca; }
        .mlm-table { width: 100%; border-collapse: collapse; }
        .mlm-table th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; padding: 12px 18px; text-align: left; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
        .mlm-table td { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; vertical-align: middle; }
        .mlm-table tr:hover td { background: #f8fafc; }
        .mlm-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .mlm-badge-before { background: #e0e7ff; color: #4338ca; }
        .mlm-badge-after { background: #fef3c7; color: #b45309; }
        .mlm-badge-shortcode { background: #dcfce7; color: #15803d; }
        .mlm-notice { padding: 12px 18px; border-radius: 10px; margin-bottom: 20px; font-size: 13px; font-weight: 500; }
        .mlm-notice-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
    </style>
    <?php
}

// ============================================================
// PAGE: Manage Links (Main Dashboard)
// ============================================================
function mlm_page_manager() {
    // Save Link Handler
    if (isset($_POST['mlm_save_link']) && check_admin_referer('mlm_save_link_nonce')) {
        $post_id  = intval($_POST['mlm_post_id'] ?? 0);
        $link     = esc_url_raw(trim($_POST['mlm_stream_link'] ?? ''));
        $position = sanitize_text_field($_POST['mlm_position'] ?? 'before_content');

        if ($post_id) {
            update_post_meta($post_id, '_mlm_stream_link', $link);
            update_post_meta($post_id, '_mlm_position', $position);
            echo '<div class="mlm-notice mlm-notice-success">✓ Stream link attached to post successfully!</div>';
        }
    }

    // Delete Link Handler
    if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['post_id']) && check_admin_referer('mlm_delete_link')) {
        $delete_id = intval($_GET['post_id']);
        delete_post_meta($delete_id, '_mlm_stream_link');
        delete_post_meta($delete_id, '_mlm_position');
        echo '<div class="mlm-notice mlm-notice-success">✓ Link removed from post.</div>';
    }

    $posts = get_posts(['numberposts' => 100, 'post_status' => 'publish']);
    ?>
    <div class="mlm-wrap">
        <div class="mlm-header">
            <div>
                <h1>🎬 Media Link Manager</h1>
                <p>Attach pre-generated secure stream links (videos or image carousels) to your blog posts.</p>
            </div>
            <a href="https://backend-nine-smoky-38.vercel.app" target="_blank" class="mlm-btn mlm-btn-primary">
                Open Media Hoster SaaS →
            </a>
        </div>

        <!-- Add / Edit Form -->
        <div class="mlm-card">
            <div class="mlm-card-header">
                <h2>Attach Stream Link to Post</h2>
            </div>
            <div class="mlm-card-body">
                <form method="post">
                    <?php wp_nonce_field('mlm_save_link_nonce', 'mlm_save_link_nonce'); ?>
                    <div class="mlm-form-grid">
                        <div class="mlm-field">
                            <label>Select Blog Post</label>
                            <select name="mlm_post_id" class="mlm-select" required>
                                <option value="">— Choose Post —</option>
                                <?php foreach ($posts as $p): ?>
                                <option value="<?php echo $p->ID; ?>"><?php echo esc_html($p->post_title); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="mlm-field">
                            <label>Pasted Stream Link (from Media Hoster SaaS)</label>
                            <input type="url" name="mlm_stream_link" class="mlm-input" placeholder="https://backend-nine-smoky-38.vercel.app/api/media?uuid=..." required>
                        </div>
                        <div class="mlm-field">
                            <label>Display Position</label>
                            <select name="mlm_position" class="mlm-select">
                                <option value="before_content">Before Article Content</option>
                                <option value="after_content">After Article Content</option>
                                <option value="shortcode">Manual Shortcode Position</option>
                            </select>
                        </div>
                        <div>
                            <button type="submit" name="mlm_save_link" class="mlm-btn mlm-btn-primary">Save Link</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Links Table -->
        <div class="mlm-card">
            <div class="mlm-card-header">
                <h2>Attached Stream Links</h2>
            </div>
            <div class="mlm-card-body" style="padding:0;">
                <table class="mlm-table">
                    <thead>
                        <tr>
                            <th>Post Title</th>
                            <th>Attached Stream Link</th>
                            <th>Position</th>
                            <th>Shortcode</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $has_links = false;
                        foreach ($posts as $p):
                            $link     = get_post_meta($p->ID, '_mlm_stream_link', true);
                            $position = get_post_meta($p->ID, '_mlm_position', true) ?: 'before_content';
                            if (empty($link)) continue;
                            $has_links = true;
                            $delete_url = wp_nonce_url(admin_url('admin.php?page=mlm-manager&action=delete&post_id=' . $p->ID), 'mlm_delete_link');
                        ?>
                        <tr>
                            <td><strong><?php echo esc_html($p->post_title); ?></strong></td>
                            <td><code style="background:#f1f5f9;color:#4f46e5;padding:3px 8px;border-radius:6px;font-size:11px;"><?php echo esc_html($link); ?></code></td>
                            <td>
                                <?php if ($position === 'before_content'): ?>
                                    <span class="mlm-badge mlm-badge-before">Before Content</span>
                                <?php elseif ($position === 'after_content'): ?>
                                    <span class="mlm-badge mlm-badge-after">After Content</span>
                                <?php else: ?>
                                    <span class="mlm-badge mlm-badge-shortcode">Shortcode</span>
                                <?php endif; ?>
                            </td>
                            <td><code style="background:#f8fafc;padding:3px 6px;border-radius:4px;font-size:11px;">[mlm_media]</code></td>
                            <td>
                                <a href="<?php echo get_permalink($p->ID); ?>" target="_blank" class="mlm-btn mlm-btn-sm" style="background:#f1f5f9;color:#334155;">View Post</a>
                                <a href="<?php echo $delete_url; ?>" onclick="return confirm('Remove link from this post?');" class="mlm-btn mlm-btn-sm mlm-btn-danger">Remove</a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php if (!$has_links): ?>
                        <tr>
                            <td colSpan="5" style="text-align:center;padding:40px;color:#94a3b8;">
                                No stream links attached yet. Select a post above and paste your stream link!
                            </td>
                        </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <?php
}

// ============================================================
// PAGE: Documentation
// ============================================================
function mlm_page_docs() {
    ?>
    <div class="mlm-wrap">
        <div class="mlm-header">
            <div>
                <h1>📘 Media Link Manager Guide</h1>
                <p>Zero-configuration media streaming for WordPress.</p>
            </div>
        </div>
        <div class="mlm-card">
            <div class="mlm-card-body" style="line-height:1.7;color:#334155;max-width:750px;">
                <h3>How to Use Media Link Manager</h3>
                <ol style="padding-left:20px;">
                    <li style="margin-bottom:12px;">Go to the <a href="https://backend-nine-smoky-38.vercel.app" target="_blank"><strong>Media Hoster SaaS Platform</strong></a> and log into your account.</li>
                    <li style="margin-bottom:12px;">Upload a video (with mandatory thumbnail) or a batch of carousel images.</li>
                    <li style="margin-bottom:12px;">Click <strong>"Generate Stream Link"</strong> and copy the produced URL (e.g. <code>https://backend-nine-smoky-38.vercel.app/api/media?uuid=...</code>).</li>
                    <li style="margin-bottom:12px;">Return here to <strong>Media Links → Manage Links</strong>, select your post, paste the link, choose position, and click <strong>Save</strong>.</li>
                </ol>

                <h3 style="margin-top:30px;">Bot & Crawler Protection</h3>
                <p>This plugin strictly detects web crawlers, search engines (Googlebot, AdsBot), Facebook scrapers, and review bots server-side in PHP. Bots receive 100% clean article text with zero media player markup in the raw page response.</p>
            </div>
        </div>
    </div>
    <?php
}

// ============================================================
// STRICT PHP SERVER-SIDE BOT DETECTION
// ============================================================
function mlm_is_bot() {
    $ua = isset($_SERVER['HTTP_USER_AGENT']) ? strtolower($_SERVER['HTTP_USER_AGENT']) : '';
    if (empty($ua) || !isset($_SERVER['HTTP_ACCEPT'])) return true;

    $bot_patterns = [
        'bot', 'crawl', 'spider', 'slurp', 'facebookexternalhit',
        'mediapartners-google', 'adsbot-google', 'googlebot', 'adx',
        'applebot', 'bingbot', 'lighthouse', 'gtmetrix', 'pingdom',
        'yandex', 'baidu', 'headlesschrome', 'puppeteer', 'selenium'
    ];

    foreach ($bot_patterns as $pattern) {
        if (strpos($ua, $pattern) !== false) return true;
    }
    return false;
}

// ============================================================
// RENDERER: Media Link Player & Carousel HTML Generator
// ============================================================
function mlm_render_media_markup($stream_link) {
    if (empty($stream_link)) return '';

    // Parse UUID parameter from streaming URL
    $parsed = parse_url($stream_link);
    $uuid = '';
    if (isset($parsed['query'])) {
        parse_str($parsed['query'], $query);
        $uuid = isset($query['uuid']) ? sanitize_text_field($query['uuid']) : '';
    }

    if (empty($uuid)) return '';

    $backend_base = $parsed['scheme'] . '://' . $parsed['host'] . (isset($parsed['port']) ? ':' . $parsed['port'] : '');
    $uniq_id = 'mlm-' . substr(md5($uuid . get_the_ID()), 0, 8);

    ob_start();
    ?>
    <div id="<?php echo $uniq_id; ?>" class="mlm-container" style="margin:25px auto;max-width:850px;width:100%;">
        <div style="background:#0f172a;border-radius:14px;padding:30px;text-align:center;color:#94a3b8;font-size:13px;">
            Loading media preview...
        </div>
    </div>

    <script>
    (function(){
        var container = document.getElementById('<?php echo $uniq_id; ?>');
        if(!container) return;

        var baseApi = '<?php echo esc_js($backend_base); ?>/api/media?uuid=<?php echo esc_js($uuid); ?>';

        fetch(baseApi + '&action=get_thumb')
        .then(function(res){ return res.json(); })
        .then(function(data){
            if(!data.success) {
                container.style.display = 'none';
                return;
            }

            // Scenario 1: Image Carousel Set
            if (data.media_type === 'carousel' && data.images && data.images.length > 0) {
                var slidesHtml = '';
                var dotsHtml = '';
                data.images.forEach(function(imgUrl, idx){
                    slidesHtml += '<div class="mlm-slide" style="display:'+(idx===0?'block':'none')+';width:100%;aspect-ratio:16/9;position:relative;overflow:hidden;border-radius:14px;">'
                        +'<img src="'+imgUrl+'" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy">'
                        +'</div>';
                    dotsHtml += '<span class="mlm-dot" data-idx="'+idx+'" style="width:8px;height:8px;border-radius:50%;background:'+(idx===0?'#6366f1':'#cbd5e1')+';display:inline-block;cursor:pointer;margin:0 4px;transition:all 0.2s;"></span>';
                });

                container.innerHTML = '<div style="position:relative;width:100%;overflow:hidden;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.15);">'
                    + slidesHtml
                    +'<button id="mlm-prev-<?php echo $uniq_id; ?>" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:#fff;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;">‹</button>'
                    +'<button id="mlm-next-<?php echo $uniq_id; ?>" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:#fff;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;">›</button>'
                    +'<div style="position:absolute;bottom:12px;left:0;right:0;display:flex;justify-content:center;align-items:center;">'+dotsHtml+'</div>'
                    +'</div>';

                var currentSlide = 0;
                var slides = container.querySelectorAll('.mlm-slide');
                var dots = container.querySelectorAll('.mlm-dot');

                function showSlide(index) {
                    if(index < 0) index = slides.length - 1;
                    if(index >= slides.length) index = 0;
                    slides.forEach(function(s, i){ s.style.display = (i === index) ? 'block' : 'none'; });
                    dots.forEach(function(d, i){ d.style.background = (i === index) ? '#6366f1' : '#cbd5e1'; });
                    currentSlide = index;
                }

                var prevBtn = document.getElementById('mlm-prev-<?php echo $uniq_id; ?>');
                var nextBtn = document.getElementById('mlm-next-<?php echo $uniq_id; ?>');
                if(prevBtn) prevBtn.addEventListener('click', function(){ showSlide(currentSlide - 1); });
                if(nextBtn) nextBtn.addEventListener('click', function(){ showSlide(currentSlide + 1); });
                dots.forEach(function(dot){
                    dot.addEventListener('click', function(){ showSlide(parseInt(this.getAttribute('data-idx'))); });
                });
                return;
            }

            // Scenario 2: Video with Ghost Thumbnail Overlay
            container.innerHTML = '<div id="mlm-wrapper-<?php echo $uniq_id; ?>" style="position:relative;width:100%;cursor:pointer;overflow:hidden;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.25);">'
                +'<img src="'+data.thumbnail+'" style="width:100%;display:block;aspect-ratio:16/9;object-fit:cover;">'
                +'<div style="position:absolute;inset:0;background:rgba(15,23,42,0.35);display:flex;justify-content:center;align-items:center;">'
                +'<div style="width:70px;height:70px;background:#6366f1;border-radius:50%;display:flex;justify-content:center;align-items:center;box-shadow:0 6px 20px rgba(99,102,241,0.5);transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.1)\';" onmouseout="this.style.transform=\'scale(1)\';">'
                +'<svg viewBox="0 0 24 24" style="width:30px;height:30px;fill:#fff;margin-left:4px;"><path d="M8 5v14l11-7z"/></svg>'
                +'</div></div></div>';

            var wrapper = document.getElementById('mlm-wrapper-<?php echo $uniq_id; ?>');
            if(wrapper) {
                wrapper.addEventListener('click', function(e){
                    if(!e.isTrusted) return; // Prevent programmatic bot clicks
                    container.innerHTML = '<div style="width:100%;aspect-ratio:16/9;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;border-radius:14px;font-size:13px;">Establishing encrypted stream connection...</div>';

                    fetch(baseApi + '&action=get_stream')
                    .then(function(r){ return r.json(); })
                    .then(function(streamData){
                        if(streamData.success && streamData.player_html) {
                            container.innerHTML = streamData.player_html;
                        } else {
                            container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:20px;">Stream currently unavailable.</p>';
                        }
                    });
                });
            }
        })
        .catch(function(){
            container.style.display = 'none';
        });
    })();
    </script>
    <?php
    return ob_get_clean();
}

// ============================================================
// CONTENT FILTER & SHORTCODE
// ============================================================
add_filter('the_content', 'mlm_auto_inject_media');
function mlm_auto_inject_media($content) {
    if (!is_single()) return $content;

    // Strict PHP Server-Side Bot Shielding
    if (mlm_is_bot()) {
        return $content; // Return 100% clean content to bots without any media markup
    }

    global $post;
    $link     = get_post_meta($post->ID, '_mlm_stream_link', true);
    $position = get_post_meta($post->ID, '_mlm_position', true) ?: 'before_content';

    if (empty($link)) return $content;

    $media_html = mlm_render_media_markup($link);

    if ($position === 'before_content') {
        return $media_html . $content;
    } else if ($position === 'after_content') {
        return $content . $media_html;
    }
    return $content;
}

add_shortcode('mlm_media', 'mlm_shortcode_media');
function mlm_shortcode_media($atts) {
    if (mlm_is_bot()) return '';
    global $post;
    $link = get_post_meta($post->ID, '_mlm_stream_link', true);
    return mlm_render_media_markup($link);
}
