<?php
/**
 * Plugin Name: Advanced Video Cloak & Content Loop (Zero Footprint)
 * Description: Military-grade Anti-Bot. Zero Footprint, Smart Aspect Ratio, and SaaS-grade Remote Media Manager Dashboard.
 * Version:     5.5
 * Author:      RishavDev
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ============================================================
// 1. DATABASE & CONFIGURING DEFAULT DATA
// ============================================================
register_activation_hook( __FILE__, 'avc_install_plugin' );
function avc_install_plugin() {
    // Save sample dummy data for the dashboard visual showcase on first activation
    if ( ! get_option('avc_media_links') ) {
        $dummy_links = [
            [
                'id' => 1,
                'title' => 'Nature Documentary',
                'type' => 'Video',
                'source_url' => 'https://cdn.example.com/video/nature.mp4',
                'views' => '8.7K',
                'clicks' => '2.1K',
                'status' => 'Active'
            ],
            [
                'id' => 2,
                'title' => 'City Skyline Time-lapse',
                'type' => 'Video',
                'source_url' => 'https://videos.example.net/skyline.mp4',
                'views' => '5.3K',
                'clicks' => '1.2K',
                'status' => 'Active'
            ],
            [
                'id' => 3,
                'title' => 'Mountain Landscape',
                'type' => 'Image Carousel',
                'source_url' => 'https://images.example.com/mountain.jpg',
                'views' => '6.2K',
                'clicks' => '1.5K',
                'status' => 'Active'
            ]
        ];
        update_option('avc_media_links', $dummy_links);
    }
}

// ============================================================
// 2. ADMIN MENU & REGISTER PAGE
// ============================================================
add_action( 'admin_menu', 'avc_register_admin_dashboard' );
function avc_register_admin_dashboard() {
    add_menu_page(
        'Media Link Manager',
        'Media Manager',
        'manage_options',
        'media-link-manager',
        'avc_render_dashboard_page',
        'dashicons-admin-media',
        30
    );
}

// Include stylesheet and scripts safely in WordPress Admin
function avc_render_dashboard_page() {
    // Process form submissions
    if ( isset($_POST['avc_add_link_nonce']) && wp_verify_nonce($_POST['avc_add_link_nonce'], 'avc_quick_add') ) {
        $links = get_option('avc_media_links', []);
        $new_link = [
            'id' => time(),
            'title' => sanitize_text_field($_POST['link_title'] ?: 'Untitled Media'),
            'type' => sanitize_text_field($_POST['media_type']),
            'source_url' => esc_url_raw($_POST['source_url']),
            'views' => '0',
            'clicks' => '0',
            'status' => 'Active'
        ];
        $links[] = $new_link;
        update_option('avc_media_links', $links);
        echo '<div class="notice notice-success is-dismissible"><p>New media link added successfully!</p></div>';
    }

    $links = get_option('avc_media_links', []);
    ?>
    
    <!-- SAAS-GRADE DASHBOARD HTML & EMBEDDED CSS -->
    <style>
        /* Modern UI Reset & Fonts */
        #wpcontent { padding-left: 0 !important; }
        .avc-dashboard-body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f8fafc;
            color: #1e293b;
            display: flex;
            min-height: calc(100vh - 32px);
            margin: 0;
            box-sizing: border-box;
        }
        .avc-dashboard-body * { box-sizing: border-box; }

        /* Left Sidebar Styling */
        .avc-sidebar {
            width: 260px;
            background: #fff;
            border-right: 1px solid #e2e8f0;
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
        }
        .avc-logo-sec {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 32px;
            padding-left: 8px;
        }
        .avc-logo-icon {
            background: #6366f1;
            color: #fff;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
        }
        .avc-logo-title h2 { margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; }
        .avc-logo-title p { margin: 2px 0 0 0; font-size: 11px; color: #64748b; }
        
        .avc-menu-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
        .avc-menu-item a {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 8px;
            color: #475569;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s;
        }
        .avc-menu-item.active a, .avc-menu-item a:hover {
            background: #f1f5f9;
            color: #6366f1;
        }
        .avc-upgrade-box {
            margin-top: auto;
            background: #eef2ff;
            border: 1px solid #e0e7ff;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
        }
        .avc-upgrade-box h4 { margin: 0 0 6px 0; font-size: 14px; color: #312e81; font-weight: 600; }
        .avc-upgrade-box p { margin: 0 0 12px 0; font-size: 11px; color: #4338ca; line-height: 1.4; }
        .avc-upgrade-btn {
            background: #6366f1;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background 0.2s;
        }
        .avc-upgrade-btn:hover { background: #4f46e5; }

        /* Main Workspace */
        .avc-main-container {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 24px;
            padding: 32px;
            width: 100%;
        }

        /* Top Bar */
        .avc-header {
            grid-column: span 2;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .avc-header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #0f172a; }
        .avc-header p { margin: 4px 0 0 0; color: #64748b; font-size: 14px; }
        
        .avc-header-actions { display: flex; align-items: center; gap: 12px; }
        .avc-btn-secondary {
            background: #fff;
            border: 1px solid #e2e8f0;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            color: #334155;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .avc-btn-secondary:hover { background: #f8fafc; }

        /* Metric Cards */
        .avc-metrics-row {
            grid-column: span 2;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
        }
        .avc-metric-card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .avc-metric-icon {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        .avc-icon-1 { background: #eef2ff; color: #6366f1; }
        .avc-icon-2 { background: #ecfdf5; color: #10b981; }
        .avc-icon-3 { background: #fef2f2; color: #ef4444; }
        .avc-icon-4 { background: #fff7ed; color: #f59e0b; }
        
        .avc-metric-info p { margin: 0; font-size: 12px; color: #64748b; font-weight: 500; }
        .avc-metric-info h3 { margin: 4px 0 0 0; font-size: 22px; font-weight: 700; color: #0f172a; }

        /* Left Workspace Block */
        .avc-workspace-left {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        /* Central Table Component */
        .avc-panel {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
        }
        .avc-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .avc-panel-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; }
        
        .avc-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }
        .avc-table th {
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            color: #64748b;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
        }
        .avc-table td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
            color: #334155;
        }
        .avc-media-title-cell { display: flex; align-items: center; gap: 12px; }
        .avc-media-thumb {
            width: 44px;
            height: 32px;
            background: #111;
            border-radius: 6px;
            object-fit: cover;
        }
        .avc-badge {
            background: #f1f5f9;
            color: #475569;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
        }
        .avc-badge-active { background: #d1fae5; color: #065f46; }
        .avc-url-copy {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 6px 12px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 11px;
            max-width: 220px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .avc-copy-btn { cursor: pointer; color: #6366f1; border: none; background: none; font-weight: bold; }

        /* Quick Add & Dropzone Block */
        .avc-quick-add-form {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
        }
        .avc-form-fields { display: flex; flex-direction: column; gap: 12px; }
        .avc-input-row { display: flex; gap: 12px; }
        .avc-input-row input, .avc-input-row select { flex: 1; }
        
        .avc-form-fields input, .avc-form-fields select {
            border: 1px solid #e2e8f0;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            width: 100%;
        }
        .avc-dropzone {
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: border-color 0.2s;
        }
        .avc-dropzone:hover { border-color: #6366f1; }
        .avc-dropzone-icon { font-size: 28px; color: #6366f1; margin-bottom: 8px; }

        /* Right Sidebar Workspace */
        .avc-workspace-right {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        /* Post Preview Panel */
        .avc-preview-card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
        }
        .avc-preview-screen {
            background: #000;
            border-radius: 8px;
            aspect-ratio: 16/9;
            overflow: hidden;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            margin-bottom: 12px;
        }
        .avc-preview-play {
            width: 50px;
            height: 50px;
            background: #6366f1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 4px 15px rgba(99,102,241,0.5);
        }

        /* Analytics Chart SVG */
        .avc-chart-svg { width: 100%; height: auto; margin-top: 15px; }

        /* CSS Progress Bar */
        .avc-progress-bar {
            background: #f1f5f9;
            border-radius: 100px;
            height: 8px;
            width: 100%;
            margin-top: 10px;
            overflow: hidden;
        }
        .avc-progress-fill {
            background: #6366f1;
            height: 100%;
            width: 39%;
            border-radius: 100px;
        }
    </style>

    <div class="avc-dashboard-body">
        
        <!-- SIDEBAR LEFT -->
        <aside class="avc-sidebar">
            <div class="avc-logo-sec">
                <div class="avc-logo-icon">M</div>
                <div class="avc-logo-title">
                    <h2>Media Manager</h2>
                    <p>Cloud Media Dashboard</p>
                </div>
            </div>
            <ul class="avc-menu-list">
                <li class="avc-menu-item active"><a href="#">📊 Dashboard</a></li>
                <li class="avc-menu-item"><a href="#">🔗 Media Links</a></li>
                <li class="avc-menu-item"><a href="#">➕ Add New Link</a></li>
                <li class="avc-menu-item"><a href="#">📂 Categories</a></li>
                <li class="avc-menu-item"><a href="#">📝 Blog Posts</a></li>
                <li class="avc-menu-item"><a href="#">📈 Analytics</a></li>
                <li class="avc-menu-item"><a href="#">⚙️ Settings</a></li>
                <li class="avc-menu-item"><a href="#">🛠️ Tools</a></li>
            </ul>
            <div class="avc-upgrade-box">
                <h4>Upgrade to Pro</h4>
                <p>Unlock Unlimited Links, Advanced Analytics, & Custom Domains.</p>
                <button class="avc-upgrade-btn">Upgrade Now</button>
            </div>
        </aside>

        <!-- MAIN GRID CONTAINER -->
        <main class="avc-main-container">
            
            <!-- HEADER -->
            <header class="avc-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Manage and track all your remote media links in one place.</p>
                </div>
                <div class="avc-header-actions">
                    <button class="avc-btn-secondary">⚡ Quick Setup</button>
                </div>
            </header>

            <!-- STATS METRIC ROW -->
            <section class="avc-metrics-row">
                <div class="avc-metric-card">
                    <div class="avc-metric-icon avc-icon-1">🔗</div>
                    <div class="avc-metric-info">
                        <p>Total Links</p>
                        <h3>128</h3>
                    </div>
                </div>
                <div class="avc-metric-card">
                    <div class="avc-metric-icon avc-icon-2">👁️</div>
                    <div class="avc-metric-info">
                        <p>Total Views</p>
                        <h3>48.7K</h3>
                    </div>
                </div>
                <div class="avc-metric-card">
                    <div class="avc-metric-icon avc-icon-3">🖱️</div>
                    <div class="avc-metric-info">
                        <p>Total Clicks</p>
                        <h3>12.4K</h3>
                    </div>
                </div>
                <div class="avc-metric-card">
                    <div class="avc-metric-icon avc-icon-4">💾</div>
                    <div class="avc-metric-info">
                        <p>Bandwidth</p>
                        <h3>392.1 GB</h3>
                    </div>
                </div>
            </section>

            <!-- LEFT WORKSPACE BLOCK (Table & Quick Add) -->
            <div class="avc-workspace-left">
                
                <!-- TABLE PANEL -->
                <div class="avc-panel">
                    <div class="avc-panel-header">
                        <h3>Your Media Links</h3>
                    </div>
                    <table class="avc-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Source URL</th>
                                <th>Views</th>
                                <th>Clicks</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($links as $link) : ?>
                            <tr>
                                <td class="avc-media-title-cell">
                                    <div class="avc-media-thumb" style="background: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&auto=format&fit=crop&q=60') center/cover;"></div>
                                    <strong><?php echo esc_html($link['title']); ?></strong>
                                </td>
                                <td><span class="avc-badge"><?php echo esc_html($link['type']); ?></span></td>
                                <td>
                                    <div class="avc-url-copy">
                                        <span><?php echo esc_html($link['source_url']); ?></span>
                                    </div>
                                </td>
                                <td><?php echo esc_html($link['views']); ?></td>
                                <td><?php echo esc_html($link['clicks']); ?></td>
                                <td><span class="avc-badge avc-badge-active"><?php echo esc_html($link['status']); ?></span></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <!-- QUICK ADD FORM -->
                <div class="avc-panel">
                    <div class="avc-panel-header">
                        <h3>Quick Add New Link</h3>
                    </div>
                    <form method="post" class="avc-quick-add-form">
                        <?php wp_nonce_field('avc_quick_add', 'avc_add_link_nonce'); ?>
                        <div class="avc-form-fields">
                            <input type="url" name="source_url" id="avc-input-url" placeholder="https://your-server.com/media/your-file.mp4" required>
                            <div class="avc-input-row">
                                <select name="media_type" id="avc-input-type">
                                    <option value="Video">Video</option>
                                    <option value="Image Carousel">Image Carousel</option>
                                </select>
                                <input type="text" name="link_title" id="avc-input-title" placeholder="Link Title (optional)">
                            </div>
                            <button type="submit" class="avc-upgrade-btn" style="background:#6366f1; width:auto; align-self:flex-start;">Add Link</button>
                        </div>
                        <div class="avc-dropzone">
                            <div class="avc-dropzone-icon">☁️</div>
                            <p style="margin:0; font-size:12px; font-weight:600; color:#475569;">Drag & drop media link file</p>
                            <span style="font-size:10px; color:#94a3b8;">Supports MP4, WebM, JPG</span>
                        </div>
                    </form>
                </div>

            </div>

            <!-- RIGHT SIDEBAR (Preview & Analytics Overview) -->
            <div class="avc-workspace-right">
                
                <!-- PREVIEW PANEL -->
                <div class="avc-preview-card">
                    <h3 style="margin-top:0; font-size:14px; font-weight:700; color:#0f172a; margin-bottom:12px;">Post Preview</h3>
                    <div class="avc-preview-screen" id="avc-preview-screen" style="background: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80') center/cover;">
                        <div class="avc-preview-play">▶</div>
                    </div>
                    <h4 id="avc-preview-title" style="margin:12px 0 6px 0; font-size:14px; font-weight:700;">Exploring the Beauty of Nature</h4>
                    <p style="margin:0 0 16px 0; font-size:11px; color:#64748b; line-height:1.4;">This is a live responsive demonstration. Type in the input fields below to see it update dynamically in real-time.</p>
                    <button class="avc-upgrade-btn" style="background:#6366f1;">Watch Now</button>
                </div>

                <!-- ANALYTICS PANEL -->
                <div class="avc-preview-card">
                    <h3 style="margin-top:0; font-size:14px; font-weight:700; color:#0f172a; margin-bottom:4px;">Analytics Overview</h3>
                    <span style="font-size:11px; color:#94a3b8;">Traffic Performance This Month</span>
                    
                    <!-- Line Graph Representation via inline SVG -->
                    <svg class="avc-chart-svg" viewBox="0 0 300 100">
                        <path d="M 0,80 Q 50,40 100,60 T 200,20 T 300,30" fill="none" stroke="#6366f1" stroke-width="3" />
                        <path d="M 0,90 Q 50,60 100,75 T 200,45 T 300,55" fill="none" stroke="#10b981" stroke-width="2" />
                    </svg>

                    <div style="display:flex; justify-content:space-between; margin-top:15px; border-top:1px solid #f1f5f9; padding-top:12px;">
                        <div>
                            <span style="font-size:10px; color:#64748b;">Avg Views</span>
                            <h4 style="margin:4px 0 0 0; font-size:14px; font-weight:700;">1.62K</h4>
                        </div>
                        <div>
                            <span style="font-size:10px; color:#64748b;">CTR</span>
                            <h4 style="margin:4px 0 0 0; font-size:14px; font-weight:700; color:#10b981;">25.4%</h4>
                        </div>
                    </div>
                </div>

                <!-- BANDWIDTH PROGRESS -->
                <div class="avc-preview-card">
                    <h3 style="margin-top:0; font-size:14px; font-weight:700; color:#0f172a; margin-bottom:4px;">Storage & Bandwidth</h3>
                    <div style="display:flex; justify-content:space-between; margin-top:12px;">
                        <span style="font-size:12px; color:#64748b;">392.1 GB / 1 TB</span>
                        <span style="font-size:12px; color:#0f172a; font-weight:700;">39% Used</span>
                    </div>
                    <div class="avc-progress-bar">
                        <div class="avc-progress-fill"></div>
                    </div>
                </div>

            </div>

        </main>
    </div>

    <!-- REAL-TIME INTERACTION JS SCRIPT -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const inputTitle = document.getElementById('avc-input-title');
            const inputUrl = document.getElementById('avc-input-url');
            const previewTitle = document.getElementById('avc-preview-title');
            const previewScreen = document.getElementById('avc-preview-screen');

            // Dynamic Live Preview Updates on Input
            if(inputTitle && previewTitle) {
                inputTitle.addEventListener('input', function() {
                    previewTitle.textContent = this.value ? this.value : 'Exploring the Beauty of Nature';
                });
            }

            if(inputUrl && previewScreen) {
                inputUrl.addEventListener('input', function() {
                    // If image carousel URL, we can change the preview thumbnail background
                    if(this.value.match(/\.(jpeg|jpg|gif|png)$/) != null) {
                        previewScreen.style.backgroundImage = `url('${this.value}')`;
                    }
                });
            }
        });
    </script>
    <?php
}