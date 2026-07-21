import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

/* ================================================================
   LANDING PAGE — guest/logged-out view  (pixel-accurate to ref)
   DASHBOARD    — logged-in view
   ================================================================ */

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState('video');
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [carouselUrls, setCarouselUrls] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [generatedLink, setGeneratedLink] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) { setUser(data.user); fetchUserMedia(); }
        else { setUser(null); setLoading(false); }
      })
      .catch(() => { setUser(null); setLoading(false); });
  }, []);

  const fetchUserMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success) setVideos(data.videos);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateMedia = async (e) => {
    e.preventDefault();
    if (!title.trim()) { showToast('Please enter a title'); return; }
    if (uploadTab === 'video') {
      if (!thumbnailUrl.trim()) { showToast('⚠️ Thumbnail is required!'); return; }
      if (!videoUrl.trim()) { showToast('Please enter a video URL'); return; }
    } else {
      const imgs = carouselUrls.split('\n').map(s => s.trim()).filter(Boolean);
      if (!imgs.length) { showToast('Please provide at least one image URL'); return; }
    }
    setUploading(true); setUploadProgress(40);
    try {
      const payload = {
        title, media_type: uploadTab,
        thumbnail_path: uploadTab === 'video' ? thumbnailUrl : (thumbnailUrl || null),
        original_source_url: uploadTab === 'video' ? videoUrl : null,
        carousel_images: uploadTab === 'carousel' ? carouselUrls : null
      };
      setUploadProgress(70);
      const res = await fetch('/api/videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      setUploadProgress(100);
      if (data.success) {
        setVideos([data.video, ...videos]);
        setShowUploadModal(false);
        setTitle(''); setVideoUrl(''); setThumbnailUrl(''); setCarouselUrls('');
        const link = `${window.location.origin}/api/media?uuid=${data.video.video_uuid}`;
        setGeneratedLink(link); setShowLinkModal(true);
        showToast('Media created successfully!');
      } else { showToast(data.error || 'Failed to create media'); }
    } catch { showToast('Server error'); }
    finally { setUploading(false); setUploadProgress(0); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this media item?')) return;
    const res = await fetch('/api/videos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (data.success) { setVideos(videos.filter(v => v.id !== id)); showToast('Deleted'); }
    else showToast(data.error || 'Failed');
  };

  const copyLink = (uuid) => {
    navigator.clipboard.writeText(`${window.location.origin}/api/media?uuid=${uuid}`);
    showToast('Copied!');
  };

  const showToast = (msg) => {
    const t = document.getElementById('globalToast');
    if (t) { t.innerText = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
  };

  const filteredVideos = videos.filter(v => {
    const q = searchQuery.toLowerCase();
    const ms = v.title.toLowerCase().includes(q) || v.video_uuid.includes(q);
    const mt = filterType === 'all' || (filterType === 'video' && v.media_type !== 'carousel') || (filterType === 'carousel' && v.media_type === 'carousel');
    return ms && mt;
  });

  const videoCount = videos.filter(v => v.media_type !== 'carousel').length;
  const carouselCount = videos.filter(v => v.media_type === 'carousel').length;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #E2E8F0', borderTop: '3px solid #4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748B', fontSize: 14 }}>Loading…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ============================================================ */
  /* LOGGED-IN DASHBOARD                                           */
  /* ============================================================ */
  if (user) return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
      <Head><title>Dashboard | Media Hoster</title></Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 15 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Workspace Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Welcome back, <strong>{user.username}</strong>! Manage your isolated media links.
          </p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary" style={{ padding: '12px 24px', fontSize: 15 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Upload & Generate Link
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20, marginBottom: 40 }}>
        {[
          { label: 'Total Videos', value: videoCount, color: 'var(--primary)' },
          { label: 'Image Carousels', value: carouselCount, color: '#8b5cf6' },
          { label: 'Active Links', value: videos.length, color: 'var(--success)' },
          { label: 'Tenant Status', value: '● Active', color: 'var(--success)', small: true }
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: s.small ? 16 : 32, fontWeight: 800, marginTop: s.small ? 12 : 6, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div id="library" className="glass-panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 15 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Your Media Library</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input type="text" placeholder="Search media…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: 220, padding: '8px 14px', fontSize: 13 }} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 140, padding: '8px 14px', fontSize: 13 }}>
              <option value="all">All Media</option>
              <option value="video">Videos Only</option>
              <option value="carousel">Carousels Only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading…</p>
        ) : filteredVideos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(0,0,0,0.02)', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No media found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Upload a video or image carousel to generate your first streaming link.</p>
            <button onClick={() => setShowUploadModal(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>Upload First Item</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {filteredVideos.map(item => (
              <div key={item.id} style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#1e293b' }}>
                  {item.thumbnail_path
                    ? <img src={item.thumbnail_path} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 24 }}>🖼️</div>
                  }
                  <span style={{ position: 'absolute', top: 10, right: 10, background: item.media_type === 'carousel' ? '#8b5cf6' : 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                    {item.media_type === 'carousel' ? 'CAROUSEL' : 'VIDEO'}
                  </span>
                </div>
                <div style={{ padding: 16, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                      UUID: <code style={{ background: 'rgba(0,113,227,0.1)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 4 }}>{item.video_uuid.substring(0, 12)}…</code>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => copyLink(item.video_uuid)} className="btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}>📋 Copy Link</button>
                    <button onClick={() => handleDelete(item.id)} style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Upload & Generate Stream Link</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--glass-border)', paddingBottom: 10 }}>
              {[['video', '🎬 Video'], ['carousel', '🖼️ Carousel']].map(([tab, label]) => (
                <button key={tab} onClick={() => setUploadTab(tab)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: uploadTab === tab ? (tab === 'video' ? 'var(--primary)' : '#8b5cf6') : 'transparent', color: uploadTab === tab ? '#fff' : 'var(--text-main)' }}>{label}</button>
              ))}
            </div>
            <form onSubmit={handleCreateMedia} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="control-row" style={{ marginBottom: 0 }}>
                <label>Media Title *</label>
                <input type="text" placeholder="e.g., Nature Documentary HD" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              {uploadTab === 'video' && <>
                <div className="control-row" style={{ marginBottom: 0 }}>
                  <label><span>Thumbnail URL *</span><span style={{ color: 'var(--danger)', fontSize: 11 }}>(Required)</span></label>
                  <input type="url" placeholder="https://cdn.example.com/thumb.jpg" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} required />
                </div>
                <div className="control-row" style={{ marginBottom: 0 }}>
                  <label>Video Source URL *</label>
                  <input type="url" placeholder="https://cdn.example.com/video.mp4" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required />
                </div>
              </>}
              {uploadTab === 'carousel' && (
                <div className="control-row" style={{ marginBottom: 0 }}>
                  <label>Image URLs (one per line) *</label>
                  <textarea rows={5} placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg" value={carouselUrls} onChange={e => setCarouselUrls(e.target.value)} required />
                </div>
              )}
              {uploading && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>Processing…</span><span>{uploadProgress}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--track-bg)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--primary)', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={uploading}>{uploading ? 'Generating…' : '✨ Generate Stream Link'}</button>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 540, background: 'var(--bg-main)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🎉</div>
              <h3 style={{ fontSize: 22, fontWeight: 800 }}>Stream Link Ready!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Paste this into your WordPress Plugin Dashboard.</p>
            </div>
            <div style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', padding: 14, borderRadius: 12, marginBottom: 20 }}>
              <code style={{ fontSize: 13, color: 'var(--primary)', wordBreak: 'break-all', display: 'block', marginBottom: 10 }}>{generatedLink}</code>
              <button onClick={() => { navigator.clipboard.writeText(generatedLink); showToast('Copied!'); }} className="btn-primary" style={{ width: '100%', padding: 10, fontSize: 14 }}>📋 Copy Stream Link</button>
            </div>
            <div style={{ background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.3)', borderRadius: 10, padding: 12, fontSize: 12, marginBottom: 20 }}>
              <strong>💡 How to use:</strong> WordPress Admin → Media Links → Manage Links → Select post, paste link, save!
            </div>
            <button onClick={() => setShowLinkModal(false)} className="btn-secondary" style={{ width: '100%' }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );

  /* ============================================================ */
  /* GUEST LANDING PAGE (pixel-accurate to reference)             */
  /* ============================================================ */
  return (
    <>
      <Head>
        <title>Media Hoster — Secure, Fast & Decoupled VOD Streaming SaaS</title>
        <meta name="description" content="Upload your videos and image carousels. Generate secure, tokenized streaming links for your WordPress plugin. Open-source, multi-tenant, serverless." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        .landing-page * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

        /* Hero gradient background */
        .lp-hero-bg {
          background: linear-gradient(180deg, #EEF2FF 0%, #F8FAFC 50%, #ffffff 100%);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .lp-hero-bg::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Badge pill */
        .lp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(79,70,229,0.08);
          border: 1px solid rgba(79,70,229,0.2);
          color: #4F46E5;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.1px;
          margin-bottom: 28px;
        }

        /* Hero h1 */
        .lp-hero-h1 {
          font-size: clamp(42px, 6vw, 68px);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -2px;
          color: #0F172A;
          margin-bottom: 22px;
        }
        .lp-hero-h1 .accent {
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Hero sub */
        .lp-hero-sub {
          font-size: 18px;
          line-height: 1.65;
          color: #64748B;
          max-width: 560px;
          margin: 0 auto 36px;
        }

        /* CTA buttons */
        .lp-cta-row {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .lp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #4F46E5;
          color: #fff;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(79,70,229,0.35);
          transition: all 0.25s cubic-bezier(0.25,1,0.5,1);
          letter-spacing: -0.2px;
        }
        .lp-btn-primary:hover {
          background: #4338CA;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(79,70,229,0.45);
        }
        .lp-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #0F172A;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          border: 1.5px solid #E2E8F0;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.25,1,0.5,1);
          letter-spacing: -0.2px;
        }
        .lp-btn-secondary:hover {
          border-color: #4F46E5;
          color: #4F46E5;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.08);
        }

        /* Browser mockup */
        .lp-browser {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06);
          overflow: hidden;
          max-width: 960px;
          margin: 60px auto 0;
          border: 1px solid #E2E8F0;
        }
        .lp-browser-bar {
          background: #F1F5F9;
          border-bottom: 1px solid #E2E8F0;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lp-browser-dots {
          display: flex;
          gap: 6px;
        }
        .lp-dot { width: 12px; height: 12px; border-radius: 50%; }
        .lp-browser-url {
          flex: 1;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 5px 12px;
          font-size: 12px;
          color: #94A3B8;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .lp-browser-content {
          display: flex;
          height: 440px;
          overflow: hidden;
        }
        /* Sidebar */
        .lp-db-sidebar {
          width: 220px;
          background: #1E1B4B;
          padding: 20px 0;
          flex-shrink: 0;
        }
        .lp-db-logo {
          padding: 0 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 8px;
        }
        .lp-db-logo-text {
          font-size: 15px;
          font-weight: 800;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lp-db-logo-icon {
          width: 28px; height: 28px;
          background: #4F46E5;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-db-nav-item {
          padding: 9px 20px;
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.15s;
          border-left: 3px solid transparent;
        }
        .lp-db-nav-item.active {
          background: rgba(79,70,229,0.2);
          color: #fff;
          border-left-color: #6366F1;
        }
        .lp-db-nav-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.5;
          flex-shrink: 0;
        }
        /* Dashboard main */
        .lp-db-main {
          flex: 1;
          background: #F8FAFC;
          overflow: hidden;
          padding: 20px;
        }
        .lp-db-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .lp-db-topbar-title {
          font-size: 17px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.5px;
        }
        .lp-db-upload-btn {
          background: #4F46E5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .lp-db-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }
        .lp-db-stat-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 12px;
        }
        .lp-db-stat-label {
          font-size: 10px;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .lp-db-stat-val {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -1px;
        }
        .lp-db-section-title {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 10px;
        }
        .lp-db-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .lp-db-media-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          overflow: hidden;
        }
        .lp-db-thumb {
          width: 100%;
          aspect-ratio: 16/9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          position: relative;
        }
        .lp-db-type-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          background: #4F46E5;
          color: #fff;
          font-size: 8px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .lp-db-card-body {
          padding: 8px 10px;
        }
        .lp-db-card-title {
          font-size: 11px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lp-db-card-sub {
          font-size: 9px;
          color: #94A3B8;
        }

        /* Feature Cards */
        .lp-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding: 0 20px;
        }
        @media (max-width: 900px) { .lp-features { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .lp-features { grid-template-columns: 1fr; } }

        .lp-feature-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 28px;
          transition: all 0.25s cubic-bezier(0.25,1,0.5,1);
        }
        .lp-feature-card:hover {
          border-color: #C7D2FE;
          box-shadow: 0 8px 32px rgba(79,70,229,0.1);
          transform: translateY(-3px);
        }
        .lp-feature-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          font-size: 22px;
        }
        .lp-feature-title {
          font-size: 17px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 10px;
          letter-spacing: -0.4px;
        }
        .lp-feature-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.65;
        }

        /* Stats Strip */
        .lp-stats-strip {
          background: #fff;
          border-top: 1px solid #E2E8F0;
          border-bottom: 1px solid #E2E8F0;
          padding: 48px 20px;
        }
        .lp-stats-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 60px;
          flex-wrap: wrap;
          max-width: 800px;
          margin: 0 auto;
        }
        .lp-stat-item {
          text-align: center;
        }
        .lp-stat-num {
          font-size: 36px;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -1.5px;
          display: block;
        }
        .lp-stat-label {
          font-size: 13px;
          color: #64748B;
          font-weight: 500;
          margin-top: 4px;
        }

        /* Testimonials / How It Works */
        .lp-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding: 0 20px;
        }
        @media (max-width: 700px) { .lp-steps { grid-template-columns: 1fr; } }

        .lp-step {
          text-align: center;
          padding: 20px;
        }
        .lp-step-num {
          width: 44px;
          height: 44px;
          background: #4F46E5;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
          margin: 0 auto 16px;
        }
        .lp-step-title {
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }
        .lp-step-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.6;
        }

        /* CTA Banner */
        .lp-cta-banner {
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          border-radius: 24px;
          padding: 60px 40px;
          text-align: center;
          margin: 0 20px;
          position: relative;
          overflow: hidden;
        }
        .lp-cta-banner::before {
          content: '';
          position: absolute;
          top: -60px;
          right: -60px;
          width: 250px;
          height: 250px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }
        .lp-cta-banner::after {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -40px;
          width: 300px;
          height: 300px;
          background: rgba(255,255,255,0.04);
          border-radius: 50%;
        }

        /* Dark Footer */
        .lp-footer {
          background: #0F172A;
          padding: 64px 0 0;
          margin-top: 0;
        }
        .lp-footer-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.4fr;
          gap: 48px;
        }
        @media (max-width: 900px) { .lp-footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .lp-footer-grid { grid-template-columns: 1fr; } }

        .lp-footer-brand-title {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          letter-spacing: -0.4px;
        }
        .lp-footer-brand-icon {
          width: 30px; height: 30px;
          background: #4F46E5;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-footer-brand-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.65;
          margin-bottom: 20px;
          max-width: 280px;
        }
        .lp-footer-socials {
          display: flex;
          gap: 10px;
        }
        .lp-social-btn {
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94A3B8;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          text-decoration: none;
          font-size: 16px;
        }
        .lp-social-btn:hover { border-color: #4F46E5; color: #fff; background: rgba(79,70,229,0.15); }

        .lp-footer-col-title {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .lp-footer-link {
          display: block;
          font-size: 14px;
          color: #64748B;
          text-decoration: none;
          margin-bottom: 10px;
          transition: color 0.2s;
        }
        .lp-footer-link:hover { color: #A5B4FC; }

        .lp-footer-newsletter-title {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .lp-footer-newsletter-sub {
          font-size: 13px;
          color: #64748B;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        .lp-footer-newsletter-row {
          display: flex;
          gap: 0;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .lp-footer-input {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: none;
          padding: 10px 14px;
          font-size: 13px;
          color: #fff;
          outline: none;
          width: auto;
          backdrop-filter: none;
          border-radius: 0;
        }
        .lp-footer-input::placeholder { color: #4B5563; }
        .lp-footer-sub-btn {
          background: #4F46E5;
          border: none;
          padding: 10px 16px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .lp-footer-sub-btn:hover { background: #4338CA; }

        .lp-footer-bottom {
          max-width: 1200px;
          margin: 40px auto 0;
          padding: 20px 40px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .lp-footer-copyright {
          font-size: 13px;
          color: #4B5563;
        }
        .lp-footer-bottom-links {
          display: flex;
          gap: 20px;
        }
        .lp-footer-bottom-link {
          font-size: 13px;
          color: #4B5563;
          text-decoration: none;
          transition: color 0.2s;
        }
        .lp-footer-bottom-link:hover { color: #A5B4FC; }

        /* Section spacing util */
        .lp-section { padding: 80px 0; }
        .lp-section-center { text-align: center; padding: 0 20px; margin-bottom: 52px; }
        .lp-section-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          color: #4F46E5;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .lp-section-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 900;
          color: #0F172A;
          letter-spacing: -1px;
          margin-bottom: 14px;
          line-height: 1.15;
        }
        .lp-section-sub {
          font-size: 16px;
          color: #64748B;
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.65;
        }

        /* Divider */
        .lp-divider { height: 1px; background: #E2E8F0; max-width: 1200px; margin: 0 auto; }
      `}</style>

      <div className="landing-page">
        {/* ═══════════════════════ HERO ═══════════════════════ */}
        <section className="lp-hero-bg">
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 20px 0', textAlign: 'center', position: 'relative', zIndex: 1 }}>

            {/* Badge */}
            <div className="lp-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Secure. Fast. Reliable.
            </div>

            {/* H1 */}
            <h1 className="lp-hero-h1">
              Stream Your Media<br />
              Securely, <span className="accent">Anywhere</span>
            </h1>

            {/* Subtext */}
            <p className="lp-hero-sub">
              Upload once, stream everywhere — secure, tokenized, and lightning fast. Zero-config WordPress integration with AES-256 encryption and HMAC-SHA256 token signing.
            </p>

            {/* CTAs */}
            <div className="lp-cta-row">
              <Link href="/signup" className="lp-btn-primary">
                Get Started Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer" className="lp-btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            </div>

            {/* Browser Mockup */}
            <div className="lp-browser">
              {/* Browser Top Bar */}
              <div className="lp-browser-bar">
                <div className="lp-browser-dots">
                  <div className="lp-dot" style={{ background: '#FF5F57' }} />
                  <div className="lp-dot" style={{ background: '#FFBD2E' }} />
                  <div className="lp-dot" style={{ background: '#28C840' }} />
                </div>
                <div className="lp-browser-url">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  app.mediahoster.io/dashboard
                </div>
              </div>

              {/* Browser Content — Dashboard Preview */}
              <div className="lp-browser-content">
                {/* Sidebar */}
                <div className="lp-db-sidebar">
                  <div className="lp-db-logo">
                    <div className="lp-db-logo-text">
                      <div className="lp-db-logo-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      Media Hoster
                    </div>
                  </div>
                  {[
                    ['📊', 'Dashboard', true],
                    ['🎬', 'Media Library', false],
                    ['🔗', 'Stream Links', false],
                    ['📈', 'Analytics', false],
                    ['⚙️', 'Settings', false],
                  ].map(([icon, label, active]) => (
                    <div key={label} className={`lp-db-nav-item${active ? ' active' : ''}`}>
                      <span style={{ fontSize: 14 }}>{icon}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Main Dashboard */}
                <div className="lp-db-main">
                  <div className="lp-db-topbar">
                    <div className="lp-db-topbar-title">Workspace Dashboard</div>
                    <button className="lp-db-upload-btn">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                      Upload & Generate
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="lp-db-stats">
                    {[
                      { label: 'Total Videos', val: '24', color: '#4F46E5' },
                      { label: 'Carousels', val: '8', color: '#7C3AED' },
                      { label: 'Active Links', val: '32', color: '#10B981' },
                      { label: 'Bandwidth', val: '2.4TB', color: '#F59E0B' },
                    ].map(s => (
                      <div key={s.label} className="lp-db-stat-card">
                        <div className="lp-db-stat-label">{s.label}</div>
                        <div className="lp-db-stat-val" style={{ color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Media Grid */}
                  <div className="lp-db-section-title">Recent Media</div>
                  <div className="lp-db-grid">
                    {[
                      { title: 'Product Launch Video', type: 'VIDEO', bg: 'linear-gradient(135deg,#667eea,#764ba2)', emoji: '🎬' },
                      { title: 'Summer Campaign', type: 'VIDEO', bg: 'linear-gradient(135deg,#f093fb,#f5576c)', emoji: '🌅' },
                      { title: 'Blog Image Set', type: 'CAROUSEL', bg: 'linear-gradient(135deg,#4facfe,#00f2fe)', emoji: '🖼️' },
                    ].map((m, i) => (
                      <div key={i} className="lp-db-media-card">
                        <div className="lp-db-thumb" style={{ background: m.bg }}>
                          <span>{m.emoji}</span>
                          <div className="lp-db-type-badge" style={{ background: m.type === 'CAROUSEL' ? '#7C3AED' : '#4F46E5' }}>{m.type}</div>
                        </div>
                        <div className="lp-db-card-body">
                          <div className="lp-db-card-title">{m.title}</div>
                          <div className="lp-db-card-sub">UUID: a1b2c3d4...</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════ STATS STRIP ════ */}
        <div className="lp-stats-strip">
          <div className="lp-stats-row">
            {[
              { num: '10K+', label: 'Media Files Hosted' },
              { num: '99.9%', label: 'Uptime SLA' },
              { num: '0ms', label: 'Cold Start (Edge)' },
              { num: '100%', label: 'Open Source' },
            ].map(s => (
              <div key={s.label} className="lp-stat-item">
                <span className="lp-stat-num">{s.num}</span>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ FEATURES ════ */}
        <section className="lp-section" style={{ background: '#FAFBFF' }}>
          <div className="lp-section-center">
            <span className="lp-section-badge">Features</span>
            <h2 className="lp-section-title">Everything You Need to<br />Stream Securely</h2>
            <p className="lp-section-sub">Built for WordPress bloggers who want secure, professional media streaming without the complexity.</p>
          </div>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="lp-features">
              {[
                { icon: '🔐', title: 'AES-256 Token Encryption', desc: 'Every stream link is encrypted with AES-256-CBC. No raw URLs ever leave the server — only opaque ciphertext tokens.' },
                { icon: '✍️', title: 'HMAC-SHA256 Signatures', desc: 'True HMAC-SHA256 using Web Crypto API. Source URL, filename, UUID, and expiry are all part of the signed message.' },
                { icon: '🤖', title: 'PHP Bot Detection', desc: 'Server-side PHP checks for Googlebot, AdX reviewer, and social crawlers. They receive clean article HTML with zero player markup.' },
                { icon: '⚡', title: 'Cloudflare Edge Streaming', desc: 'Zero-copy streaming via Cloudflare Workers. HTTP Range request support for seeking. Content served from 300+ edge locations.' },
                { icon: '🖼️', title: 'Videos & Carousels', desc: 'Upload videos with mandatory thumbnails or create multi-image carousel galleries. One link for your WordPress post.' },
                { icon: '🏢', title: 'Multi-Tenant SaaS', desc: 'Each user gets a completely isolated workspace. Your media, tokens, and analytics are private and namespace-separated.' },
              ].map(f => (
                <div key={f.title} className="lp-feature-card">
                  <div className="lp-feature-icon">{f.icon}</div>
                  <div className="lp-feature-title">{f.title}</div>
                  <div className="lp-feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ HOW IT WORKS ════ */}
        <section className="lp-section" style={{ background: '#fff' }}>
          <div className="lp-section-center">
            <span className="lp-section-badge">How It Works</span>
            <h2 className="lp-section-title">Three Steps to<br />Secure Streaming</h2>
            <p className="lp-section-sub">From upload to WordPress embed — set up in under 5 minutes.</p>
          </div>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="lp-steps">
              {[
                { n: '1', title: 'Upload Your Media', desc: 'Sign up free, upload your video (with mandatory thumbnail) or a batch of images for a carousel. Hosted on Cloudflare R2.' },
                { n: '2', title: 'Generate Secure Link', desc: 'Click "Generate Stream Link". The backend creates an AES-256 encrypted, HMAC-signed opaque token URL — valid and tamper-proof.' },
                { n: '3', title: 'Paste in WordPress', desc: 'Open the Media Link Manager plugin in WordPress admin, select your blog post, paste the link, and save. Done — your readers see it instantly.' },
              ].map(s => (
                <div key={s.n} className="lp-step">
                  <div className="lp-step-num">{s.n}</div>
                  <div className="lp-step-title">{s.title}</div>
                  <div className="lp-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ CTA BANNER ════ */}
        <section className="lp-section" style={{ background: '#F8FAFC' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="lp-cta-banner">
              <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#fff', marginBottom: 14, letterSpacing: -1, position: 'relative', zIndex: 1 }}>
                Ready to Secure Your Media?
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.65, position: 'relative', zIndex: 1 }}>
                Join thousands of WordPress bloggers who stream securely with Media Hoster. Free forever for indie creators.
              </p>
              <div className="lp-cta-row" style={{ position: 'relative', zIndex: 1 }}>
                <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#4F46E5', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'all 0.25s', letterSpacing: -0.2 }}>
                  Get Started Free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
                <a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'rgba(255,255,255,0.85)', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.25s', letterSpacing: -0.2 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                  Star on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ════ FOOTER ════ */}
        <footer className="lp-footer">
          <div className="lp-footer-grid">
            {/* Brand */}
            <div>
              <div className="lp-footer-brand-title">
                <div className="lp-footer-brand-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                </div>
                Media Hoster
              </div>
              <p className="lp-footer-brand-desc">
                Open-source, multi-tenant media hosting SaaS. Stream videos and image carousels securely to WordPress with zero-config plugin integration.
              </p>
              <div className="lp-footer-socials">
                <a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer" className="lp-social-btn" title="GitHub">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                </a>
                <a href="#" className="lp-social-btn" title="Twitter/X">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="#" className="lp-social-btn" title="Discord">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.084.12 18.11.148 18.125a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <div className="lp-footer-col-title">Product</div>
              <Link href="/" className="lp-footer-link">Dashboard</Link>
              <Link href="/#library" className="lp-footer-link">Media Library</Link>
              <Link href="/signup" className="lp-footer-link">Pricing</Link>
              <a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer" className="lp-footer-link">GitHub</a>
            </div>

            {/* Resources */}
            <div>
              <div className="lp-footer-col-title">Resources</div>
              <Link href="/privacy" className="lp-footer-link">Privacy Policy</Link>
              <Link href="/terms" className="lp-footer-link">Terms of Service</Link>
              <a href="https://github.com/linamolygit/videostream/blob/main/PRODUCT_REQUIREMENTS_DOCUMENT.md" target="_blank" rel="noreferrer" className="lp-footer-link">Documentation</a>
              <a href="https://github.com/linamolygit/videostream/issues" target="_blank" rel="noreferrer" className="lp-footer-link">Report an Issue</a>
            </div>

            {/* Newsletter */}
            <div>
              <div className="lp-footer-newsletter-title">Stay Updated</div>
              <p className="lp-footer-newsletter-sub">Get notified when new features ship. No spam, ever.</p>
              <div className="lp-footer-newsletter-row">
                <input type="email" placeholder="your@email.com" className="lp-footer-input" />
                <button className="lp-footer-sub-btn">Subscribe</button>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="lp-footer-bottom">
            <span className="lp-footer-copyright">© {new Date().getFullYear()} Media Hoster. Open-Source Software under MIT License.</span>
            <div className="lp-footer-bottom-links">
              <Link href="/privacy" className="lp-footer-bottom-link">Privacy</Link>
              <Link href="/terms" className="lp-footer-bottom-link">Terms</Link>
              <a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer" className="lp-footer-bottom-link">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
