import React, { useState } from 'react';
import Head from 'next/head';

export default function PluginPreviewPage() {
  const [selectedPost, setSelectedPost] = useState('');
  const [streamLink, setStreamLink]     = useState('');
  const [position, setPosition]         = useState('Before Content');
  const [items, setItems]               = useState([
    { id: 125, title: '10 Best Travel Destinations in 2024', link: 'https://streamable.com/abc123',  position: 'Before Content',   status: 'Active' },
    { id: 124, title: 'How to Cook Perfect Pasta',          link: 'https://vimeo.com/xyz456',        position: 'After Content',    status: 'Active' },
    { id: 123, title: 'Greenland – A Hidden Paradise',       link: 'https://streamable.com/greenland',position: 'Before Content',   status: 'Inactive' },
    { id: 122, title: 'Top 5 Home Workout Routines',        link: 'https://vimeo.com/workout123',   position: 'Custom Shortcode', status: 'Active' },
    { id: 121, title: 'Smartphone Photography Tips',        link: 'https://streamable.com/photo-tips',position: 'After Content',   status: 'Inactive' },
  ]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [notice, setNotice]             = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedPost || !streamLink) return;
    const newItem = {
      id: Math.floor(100 + Math.random() * 900),
      title: selectedPost,
      link: streamLink,
      position,
      status: 'Active',
    };
    setItems([newItem, ...items]);
    setStreamLink('');
    setNotice('✓ Stream link successfully attached to post!');
    setTimeout(() => setNotice(''), 3000);
  };

  const handleDelete = (id) => {
    if (!confirm('Remove link from post?')) return;
    setItems(items.filter(i => i.id !== id));
    setNotice('✓ Link removed from post.');
    setTimeout(() => setNotice(''), 3000);
  };

  const filteredItems = items.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.link.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Media Link Manager — WordPress Admin</title>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; }
          body { background: #1d2327; color: #1d2327; }

          /* WordPress Top Admin Bar */
          .wp-admin-bar {
            height: 32px; background: #1d2327; color: #f0f0f1;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 12px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.05);
          }
          .wp-bar-left, .wp-bar-right { display: flex; align-items: center; gap: 16px; }
          .wp-bar-item { display: flex; align-items: center; gap: 6px; color: #f0f0f1; cursor: pointer; text-decoration: none; font-size: 13px; }
          .wp-bar-item:hover { color: #72aee6; }
          .wp-screen-options { background: #ffffff; color: #2c3338; border: 1px solid #c3c4c7; border-top: none; padding: 3px 10px; font-size: 12px; border-radius: 0 0 4px 4px; cursor: pointer; }

          /* WP Layout */
          .wp-body { display: flex; min-height: calc(100vh - 32px); }

          /* WP Left Admin Sidebar */
          .wp-sidebar { width: 160px; background: #1d2327; flex-shrink: 0; display: flex; flex-direction: column; padding-top: 6px; }
          .wp-menu-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; color: #f0f0f1; font-size: 13px; cursor: pointer; text-decoration: none; position: relative; }
          .wp-menu-item:hover { background: #101517; color: #72aee6; }
          .wp-menu-item.active { background: #2271b1; color: #fff; font-weight: 600; }
          .wp-menu-item.active::after {
            content: ""; position: absolute; right: 0; top: 50%; transform: translateY(-50%);
            border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-right: 8px solid #f0f0f1;
          }
          .wp-badge { background: #d63638; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 9px; font-weight: 700; margin-left: auto; }
          
          .wp-submenu { background: #2c3338; padding: 6px 0; }
          .wp-submenu-item { display: block; padding: 6px 12px 6px 34px; color: #c3c4c7; font-size: 13px; text-decoration: none; cursor: pointer; }
          .wp-submenu-item:hover { color: #72aee6; }
          .wp-submenu-item.active { color: #fff; font-weight: 600; }

          /* Main WP Content */
          .wp-main-content { flex: 1; background: #f0f0f1; padding: 20px 24px; min-width: 0; }

          /* Page Top Header */
          .mlm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
          .mlm-header-title { font-size: 23px; font-weight: 600; color: #1d2327; display: flex; align-items: center; gap: 10px; }

          /* 3 Stat Cards */
          .mlm-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 22px; }
          .mlm-stat-card {
            background: #ffffff; border: 1px solid #c3c4c7; border-radius: 8px;
            padding: 20px 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            display: flex; align-items: center; gap: 16px;
          }
          .mlm-stat-icon { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; color: #fff; }
          .mlm-stat-icon.blue   { background: #2271b1; }
          .mlm-stat-icon.purple { background: #8c57ff; }
          .mlm-stat-icon.green  { background: #46b450; }
          .mlm-stat-label { font-size: 12px; font-weight: 600; color: #646970; margin-bottom: 4px; display: block; }
          .mlm-stat-num { font-size: 26px; font-weight: 700; color: #1d2327; line-height: 1; }

          /* White Panel Boxes */
          .mlm-panel { background: #ffffff; border: 1px solid #c3c4c7; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); margin-bottom: 24px; overflow: hidden; }
          .mlm-panel-header { padding: 16px 20px; border-bottom: 1px solid #f0f0f1; display: flex; align-items: center; justify-content: space-between; }
          .mlm-panel-title { font-size: 15px; font-weight: 700; color: #1d2327; margin: 0; }

          /* Form Grid */
          .mlm-form-grid { display: grid; grid-template-columns: 1.2fr 2fr 1.2fr auto; gap: 16px; align-items: flex-end; padding: 20px; }
          .mlm-field label { display: block; font-size: 13px; font-weight: 600; color: #1d2327; margin-bottom: 8px; }
          .mlm-input, .mlm-select {
            width: 100%; height: 40px; padding: 0 12px;
            border: 1px solid #8c8f94; border-radius: 6px;
            font-size: 13px; color: #2c3338; background: #ffffff; outline: none;
          }
          .mlm-input:focus, .mlm-select:focus { border-color: #2271b1; box-shadow: 0 0 0 1px #2271b1; }
          .mlm-btn-save {
            height: 40px; padding: 0 22px; background: #2271b1; color: #fff;
            border: 1px solid #2271b1; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;
            white-space: nowrap; transition: background 0.15s;
          }
          .mlm-btn-save:hover { background: #135e96; }

          /* Table Control Bar */
          .mlm-table-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: #ffffff; border-bottom: 1px solid #f0f0f1; flex-wrap: wrap; gap: 10px; }
          .mlm-btn-secondary { height: 32px; padding: 0 12px; background: #f6f7f7; color: #2271b1; border: 1px solid #2271b1; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; }
          .mlm-btn-secondary:hover { background: #f0f0f1; color: #135e96; }

          /* Table Styling */
          .mlm-table { width: 100%; border-collapse: collapse; background: #fff; }
          .mlm-table th { padding: 12px 16px; font-size: 13px; font-weight: 600; color: #1d2327; text-align: left; border-bottom: 1px solid #c3c4c7; }
          .mlm-table td { padding: 14px 16px; font-size: 13px; color: #2c3338; border-bottom: 1px solid #f0f0f1; vertical-align: middle; }
          .mlm-table tr:hover td { background: #f6f7f7; }

          .mlm-status-pill { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .mlm-status-active { background: #dcfce7; color: #15803d; }
          .mlm-status-inactive { background: #f1f5f9; color: #64748b; }

          /* WP Footer */
          .wp-footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #c3c4c7; display: flex; justify-content: space-between; font-size: 13px; color: #646970; }
          .wp-footer a { color: #2271b1; text-decoration: none; }
        `}</style>
      </Head>

      {/* ── WordPress Top Admin Bar ── */}
      <header className="wp-admin-bar">
        <div className="wp-bar-left">
          <span className="wp-bar-item" style={{ fontWeight: 'bold' }}>W</span>
          <span className="wp-bar-item">🏠 My Website</span>
          <span className="wp-bar-item">💬 0</span>
          <span className="wp-bar-item">➕ New</span>
        </div>
        <div className="wp-bar-right">
          <span className="wp-screen-options">Screen Options ▼</span>
          <span className="wp-bar-item">Howdy, admin 👤</span>
        </div>
      </header>

      {/* ── WordPress Body ── */}
      <div className="wp-body">
        {/* Left Sidebar */}
        <aside className="wp-sidebar">
          {[
            ['Dashboard', '📊'],
            ['Posts',     '📌'],
            ['Media',     '🖼️'],
            ['Pages',     '📄'],
            ['Comments',  '💬'],
            ['Appearance','🎨'],
            ['Plugins',   '🔌', '3'],
            ['Users',     '👤'],
            ['Tools',     '🛠️'],
            ['Settings',  '⚙️'],
          ].map(([label, icon, badge]) => (
            <div key={label} className="wp-menu-item">
              <span>{icon}</span>
              <span>{label}</span>
              {badge && <span className="wp-badge">{badge}</span>}
            </div>
          ))}

          {/* Active Menu: Media Link Manager */}
          <div className="wp-menu-item active" style={{ marginTop: 4 }}>
            <span>🔗</span>
            <span>Media Link Manager</span>
          </div>

          {/* Submenu */}
          <div className="wp-submenu">
            <div className="wp-submenu-item active">All Links</div>
            <div className="wp-submenu-item">Add New Link</div>
            <div className="wp-submenu-item">Settings</div>
            <div className="wp-submenu-item">Logs</div>
            <div className="wp-submenu-item">Help</div>
          </div>

          <div className="wp-menu-item" style={{ marginTop: 'auto', marginBottom: 16 }}>
            <span>◀</span>
            <span>Collapse menu</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="wp-main-content">
          {/* Header */}
          <div className="mlm-header">
            <h1 className="mlm-header-title">
              <span style={{ color: '#2271b1' }}>🔗</span>
              Media Link Manager
            </h1>
          </div>

          {notice && (
            <div style={{ padding: '12px 16px', background: '#edfaef', borderLeft: '4px solid #46b450', borderRadius: 4, marginBottom: 20, fontSize: 13, color: '#1d2327' }}>
              {notice}
            </div>
          )}

          {/* Stat Cards (Matching Reference Image Exactly) */}
          <div className="mlm-stats-grid">
            <div className="mlm-stat-card">
              <div className="mlm-stat-icon blue">📄</div>
              <div>
                <span className="mlm-stat-label">Total Linked Posts</span>
                <div className="mlm-stat-num">23</div>
              </div>
            </div>
            <div className="mlm-stat-card">
              <div className="mlm-stat-icon purple">📹</div>
              <div>
                <span className="mlm-stat-label">Videos</span>
                <div className="mlm-stat-num">17</div>
              </div>
            </div>
            <div className="mlm-stat-card">
              <div className="mlm-stat-icon green">🖼️</div>
              <div>
                <span className="mlm-stat-label">Image Galleries</span>
                <div className="mlm-stat-num">6</div>
              </div>
            </div>
          </div>

          {/* Add New Link Form Box */}
          <div className="mlm-panel">
            <div className="mlm-panel-header">
              <h2 className="mlm-panel-title">Add New Link</h2>
            </div>
            <form onSubmit={handleSave} className="mlm-form-grid">
              <div className="mlm-field">
                <label>Select Blog Post</label>
                <select className="mlm-select" value={selectedPost} onChange={e => setSelectedPost(e.target.value)} required>
                  <option value="">Search and select a post...</option>
                  <option value="10 Best Travel Destinations in 2024">10 Best Travel Destinations in 2024</option>
                  <option value="How to Cook Perfect Pasta">How to Cook Perfect Pasta</option>
                  <option value="Greenland – A Hidden Paradise">Greenland – A Hidden Paradise</option>
                  <option value="Top 5 Home Workout Routines">Top 5 Home Workout Routines</option>
                  <option value="Smartphone Photography Tips">Smartphone Photography Tips</option>
                </select>
              </div>
              <div className="mlm-field">
                <label>Paste Stream Link</label>
                <input
                  type="url"
                  className="mlm-input"
                  placeholder="https://example.com/stream-link"
                  value={streamLink}
                  onChange={e => setStreamLink(e.target.value)}
                  required
                />
              </div>
              <div className="mlm-field">
                <label>Display Position</label>
                <select className="mlm-select" value={position} onChange={e => setPosition(e.target.value)}>
                  <option value="Before Content">Before Content</option>
                  <option value="After Content">After Content</option>
                  <option value="Custom Shortcode">Custom Shortcode</option>
                </select>
              </div>
              <div>
                <button type="submit" className="mlm-btn-save">Save Link</button>
              </div>
            </form>
          </div>

          {/* All Linked Posts Panel */}
          <div className="mlm-panel">
            <div className="mlm-panel-header">
              <h2 className="mlm-panel-title">All Linked Posts</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  className="mlm-input"
                  style={{ width: 200, height: 32 }}
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button className="mlm-btn-secondary">Search</button>
              </div>
            </div>

            {/* Table Control Bar */}
            <div className="mlm-table-bar">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select className="mlm-select" style={{ width: 130, height: 32, fontSize: 12 }}>
                  <option>Bulk actions</option>
                  <option>Delete</option>
                </select>
                <button className="mlm-btn-secondary">Apply</button>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#646970' }}>
                <span>23 items</span>
                <span style={{ border: '1px solid #8c8f94', borderRadius: 4, padding: '2px 8px', background: '#f6f7f7', cursor: 'pointer' }}>«</span>
                <span style={{ border: '1px solid #8c8f94', borderRadius: 4, padding: '2px 8px', background: '#f6f7f7', cursor: 'pointer' }}>‹</span>
                <input type="text" readOnly value="1" style={{ width: 32, height: 28, textAlign: 'center', border: '1px solid #8c8f94', borderRadius: 4, fontSize: 12 }} />
                <span>of 3</span>
                <span style={{ border: '1px solid #8c8f94', borderRadius: 4, padding: '2px 8px', background: '#f6f7f7', cursor: 'pointer' }}>›</span>
                <span style={{ border: '1px solid #8c8f94', borderRadius: 4, padding: '2px 8px', background: '#f6f7f7', cursor: 'pointer' }}>»</span>
              </div>
            </div>

            {/* Table */}
            <table className="mlm-table">
              <thead>
                <tr>
                  <th style={{ width: 30 }}><input type="checkbox" /></th>
                  <th>Post Title ↕</th>
                  <th>Assigned Link</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td><input type="checkbox" /></td>
                    <td>
                      <a href="#" style={{ color: '#2271b1', fontWeight: 600, textDecoration: 'none' }}>{item.title}</a>
                      <div style={{ fontSize: 11, color: '#646970', marginTop: 2 }}>ID: {item.id}</div>
                    </td>
                    <td>
                      <a href={item.link} target="_blank" rel="noreferrer" style={{ color: '#2271b1', textDecoration: 'none', fontFamily: 'monospace', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {item.link} ↗
                      </a>
                    </td>
                    <td>{item.position}</td>
                    <td>
                      <span className={`mlm-status-pill ${item.status === 'Active' ? 'mlm-status-active' : 'mlm-status-inactive'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2271b1', fontSize: 14, marginRight: 8 }}>✏️</button>
                      <button title="Delete" onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d63638', fontSize: 14 }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* WordPress Footer */}
          <footer className="wp-footer">
            <span>Thank you for creating with <a href="https://wordpress.org" target="_blank" rel="noreferrer">WordPress</a>.</span>
            <span>Version 6.5.3</span>
          </footer>
        </main>
      </div>
    </>
  );
}
