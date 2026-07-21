import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DashSidebar      from '../components/DashSidebar';
import DashTopbar       from '../components/DashTopbar';
import DashStatCards    from '../components/DashStatCards';
import DashMediaLibrary from '../components/DashMediaLibrary';
import DashUploadModal  from '../components/DashUploadModal';
import DashLinkModal    from '../components/DashLinkModal';

/* ──────────────────────────────────────────────────
   Landing page imports
   ──────────────────────────────────────────────── */
import Link from 'next/link';

/* ================================================================
   INDEX.JS — Guest landing page OR logged-in dashboard
   ================================================================ */
export default function Home() {
  /* ── Auth & Data ── */
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos,  setVideos]  = useState([]);

  /* ── Dashboard UI state ── */
  const [isDark,          setIsDark]          = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLinkModal,   setShowLinkModal]   = useState(false);
  const [generatedLink,   setGeneratedLink]   = useState('');
  const [sidebarOpen,     setSidebarOpen]     = useState(true);

  /* ── Toast ── */
  const showToast = (msg) => {
    const t = document.getElementById('globalToast');
    if (t) { t.innerText = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
  };

  /* ── Bootstrap ── */
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashTheme');
    if (savedTheme === 'dark') { setIsDark(true); document.body.classList.add('dash-dark'); }

    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) { setUser(data.user); fetchMedia(); }
        else { setUser(null); setLoading(false); }
      })
      .catch(() => { setUser(null); setLoading(false); });
  }, []);

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('dashTheme', next ? 'dark' : 'light');
      if (next) document.body.classList.add('dash-dark');
      else document.body.classList.remove('dash-dark');
      return next;
    });
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success) setVideos(data.videos);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── Upload handler (connects to DashUploadModal) ── */
  const handleUploadSubmit = async ({ title, tab, videoUrl, thumbUrl, carousel }) => {
    const payload = {
      title, media_type: tab,
      thumbnail_path: tab === 'video' ? thumbUrl : (thumbUrl || null),
      original_source_url: tab === 'video' ? videoUrl : null,
      carousel_images: tab === 'carousel' ? carousel : null,
    };
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed');
    setVideos(prev => [data.video, ...prev]);
    const link = `${window.location.origin}/api/media?uuid=${data.video.video_uuid}`;
    setGeneratedLink(link);
    setShowLinkModal(true);
    showToast('✅ Media created & link generated!');
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!confirm('Delete this media item?')) return;
    const res = await fetch('/api/videos', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) { setVideos(prev => prev.filter(v => v.id !== id)); showToast('Deleted'); }
    else showToast(data.error || 'Failed to delete');
  };

  /* ── Copy link ── */
  const handleCopy = (uuid) => {
    navigator.clipboard.writeText(`${window.location.origin}/api/media?uuid=${uuid}`);
    showToast('📋 Stream link copied!');
  };

  /* ── Logout ── */
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  };

  /* ──────────────────────────────────────────────────
     LOADING SCREEN
  ─────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0C1425' : '#F8FAFC' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(91,95,232,0.2)', borderTop: '3px solid #5B5FE8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ color: '#64748B', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Loading your workspace…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ═══════════════════════════════════════════════════
     LOGGED-IN: FULL-SCREEN DASHBOARD
  ═══════════════════════════════════════════════════ */
  if (user) {
    const mainBg = isDark ? '#111827' : '#F1F5F9';
    return (
      <>
        <Head>
          <title>Dashboard — Media Hoster</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        </Head>

        <style>{`
          @keyframes fadeIn    { from { opacity:0; }                       to { opacity:1; } }
          @keyframes slideUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
          @keyframes fadeInDown{ from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
          @keyframes spin      { to { transform: rotate(360deg); } }

          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; }

          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

          /* Scrollbar */
          ::-webkit-scrollbar { width: 5px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 99px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.5); }

          /* Toast */
          .dash-toast {
            position: fixed; bottom: 28px; left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: ${isDark ? '#1F2937' : '#0F172A'}; color: #fff;
            padding: 11px 22px; border-radius: 30px; font-size: 13px; font-weight: 600;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
            transition: transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
            z-index: 9999; white-space: nowrap;
          }
          .dash-toast.show { transform: translateX(-50%) translateY(0); }

          /* Input reset (override globals.css for dashboard) */
          .dash-scope input, .dash-scope textarea, .dash-scope select {
            width: auto;
            background: transparent;
            border: none;
            border-radius: 0;
            padding: 0;
            box-shadow: none;
            backdrop-filter: none;
          }
        `}</style>

        <div className="dash-scope" style={{
          display: 'flex', height: '100vh', overflow: 'hidden',
          background: mainBg,
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}>
          {/* ── Sidebar ── */}
          {sidebarOpen && (
            <DashSidebar
              activeKey="dashboard"
              onUpload={() => setShowUploadModal(true)}
              onLogout={handleLogout}
              videoCount={videos.length}
              isDark={isDark}
            />
          )}

          {/* ── Main area ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            <DashTopbar
              user={user}
              isDark={isDark}
              onToggleDark={toggleDark}
              onUpload={() => setShowUploadModal(true)}
              onToggleSidebar={() => setSidebarOpen(v => !v)}
            />

            {/* ── Scrollable content ── */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', minWidth: 0 }}>
              {/* Welcome */}
              <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#F1F5F9' : '#0F172A', letterSpacing: '-0.5px' }}>
                  Welcome back, <span style={{ color: '#5B5FE8' }}>{user.username}</span> 👋
                </h1>
                <p style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B', marginTop: 3 }}>
                  Here's what's happening with your media today.
                </p>
              </div>

              {/* Stat Cards */}
              <DashStatCards videos={videos} isDark={isDark} />

              {/* Media Library */}
              <DashMediaLibrary
                videos={videos}
                isDark={isDark}
                onCopy={handleCopy}
                onDelete={handleDelete}
                onUpload={() => setShowUploadModal(true)}
              />
            </main>
          </div>
        </div>

        {/* ── Modals ── */}
        <DashUploadModal
          show={showUploadModal}
          isDark={isDark}
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUploadSubmit}
        />
        <DashLinkModal
          show={showLinkModal}
          link={generatedLink}
          isDark={isDark}
          onClose={() => setShowLinkModal(false)}
        />

        {/* ── Toast ── */}
        <div className="dash-toast" id="globalToast" />
      </>
    );
  }

  /* ═══════════════════════════════════════════════════
     GUEST LANDING PAGE
  ═══════════════════════════════════════════════════ */
  return (
    <>
      <Head>
        <title>Media Hoster — Secure, Fast & Decoupled VOD Streaming SaaS</title>
        <meta name="description" content="Upload your videos and image carousels. Generate secure, tokenized streaming links for your WordPress plugin." />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        .landing-page * { font-family: 'Inter', -apple-system, sans-serif; }
        .lp-hero-bg { background: linear-gradient(180deg, #EEF2FF 0%, #F8FAFC 50%, #ffffff 100%); min-height: 100vh; position: relative; overflow: hidden; }
        .lp-hero-bg::before { content:''; position:absolute; top:-200px; left:50%; transform:translateX(-50%); width:800px; height:800px; background:radial-gradient(ellipse, rgba(99,102,241,.12) 0%, transparent 70%); pointer-events:none; }
        .lp-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(79,70,229,.08); border:1px solid rgba(79,70,229,.2); color:#4F46E5; padding:6px 14px; border-radius:100px; font-size:13px; font-weight:600; margin-bottom:28px; }
        .lp-hero-h1 { font-size:clamp(42px,6vw,68px); font-weight:900; line-height:1.08; letter-spacing:-2px; color:#0F172A; margin-bottom:22px; }
        .lp-hero-h1 .accent { background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .lp-hero-sub { font-size:18px; line-height:1.65; color:#64748B; max-width:560px; margin:0 auto 36px; }
        .lp-cta-row { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .lp-btn-primary { display:inline-flex; align-items:center; gap:8px; background:#4F46E5; color:#fff; padding:14px 28px; border-radius:12px; font-size:15px; font-weight:700; border:none; cursor:pointer; text-decoration:none; box-shadow:0 4px 20px rgba(79,70,229,.35); transition:all .25s cubic-bezier(.25,1,.5,1); letter-spacing:-.2px; }
        .lp-btn-primary:hover { background:#4338CA; transform:translateY(-2px); box-shadow:0 8px 28px rgba(79,70,229,.45); }
        .lp-btn-secondary { display:inline-flex; align-items:center; gap:8px; background:#fff; color:#0F172A; padding:14px 28px; border-radius:12px; font-size:15px; font-weight:700; border:1.5px solid #E2E8F0; cursor:pointer; text-decoration:none; transition:all .25s; letter-spacing:-.2px; }
        .lp-btn-secondary:hover { border-color:#4F46E5; color:#4F46E5; transform:translateY(-2px); box-shadow:0 4px 14px rgba(0,0,0,.08); }
        .lp-browser { background:#fff; border-radius:16px; box-shadow:0 24px 80px rgba(0,0,0,.14),0 0 0 1px rgba(0,0,0,.06); overflow:hidden; max-width:960px; margin:60px auto 0; border:1px solid #E2E8F0; }
        .lp-browser-bar { background:#F1F5F9; border-bottom:1px solid #E2E8F0; padding:12px 16px; display:flex; align-items:center; gap:12px; }
        .lp-browser-dots { display:flex; gap:6px; }
        .lp-dot { width:12px; height:12px; border-radius:50%; }
        .lp-browser-url { flex:1; background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:5px 12px; font-size:12px; color:#94A3B8; display:flex; align-items:center; gap:6px; }
        .lp-browser-content { display:flex; height:440px; overflow:hidden; }
        .lp-db-sidebar { width:220px; background:#1E1B4B; padding:20px 0; flex-shrink:0; }
        .lp-db-logo { padding:0 20px 20px; border-bottom:1px solid rgba(255,255,255,.08); margin-bottom:8px; }
        .lp-db-logo-text { font-size:15px; font-weight:800; color:#fff; display:flex; align-items:center; gap:8px; }
        .lp-db-logo-icon { width:28px; height:28px; background:#4F46E5; border-radius:8px; display:flex; align-items:center; justify-content:center; }
        .lp-db-nav-item { padding:9px 20px; font-size:13px; color:rgba(255,255,255,.55); display:flex; align-items:center; gap:10px; cursor:pointer; transition:all .15s; border-left:3px solid transparent; }
        .lp-db-nav-item.active { background:rgba(79,70,229,.2); color:#fff; border-left-color:#6366F1; }
        .lp-db-main { flex:1; background:#F8FAFC; overflow:hidden; padding:20px; }
        .lp-db-topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
        .lp-db-topbar-title { font-size:17px; font-weight:800; color:#0F172A; letter-spacing:-.5px; }
        .lp-db-upload-btn { background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:7px 14px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:5px; }
        .lp-db-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
        .lp-db-stat-card { background:#fff; border:1px solid #E2E8F0; border-radius:10px; padding:12px; }
        .lp-db-stat-label { font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
        .lp-db-stat-val { font-size:22px; font-weight:800; letter-spacing:-1px; }
        .lp-db-section-title { font-size:13px; font-weight:700; color:#0F172A; margin-bottom:10px; }
        .lp-db-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .lp-db-media-card { background:#fff; border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; }
        .lp-db-thumb { width:100%; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; font-size:20px; position:relative; }
        .lp-db-type-badge { position:absolute; top:6px; right:6px; background:#4F46E5; color:#fff; font-size:8px; font-weight:800; padding:2px 6px; border-radius:4px; letter-spacing:.5px; }
        .lp-db-card-body { padding:8px 10px; }
        .lp-db-card-title { font-size:11px; font-weight:700; color:#0F172A; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .lp-db-card-sub { font-size:9px; color:#94A3B8; }
        .lp-features { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; padding:0 20px; }
        @media (max-width:900px) { .lp-features { grid-template-columns:1fr 1fr; } }
        @media (max-width:600px) { .lp-features { grid-template-columns:1fr; } }
        .lp-feature-card { background:#fff; border:1px solid #E2E8F0; border-radius:20px; padding:28px; transition:all .25s cubic-bezier(.25,1,.5,1); }
        .lp-feature-card:hover { border-color:#C7D2FE; box-shadow:0 8px 32px rgba(79,70,229,.1); transform:translateY(-3px); }
        .lp-feature-icon { width:48px; height:48px; background:linear-gradient(135deg,#EEF2FF 0%,#E0E7FF 100%); border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:18px; font-size:22px; }
        .lp-feature-title { font-size:17px; font-weight:800; color:#0F172A; margin-bottom:10px; letter-spacing:-.4px; }
        .lp-feature-desc { font-size:14px; color:#64748B; line-height:1.65; }
        .lp-stats-strip { background:#fff; border-top:1px solid #E2E8F0; border-bottom:1px solid #E2E8F0; padding:48px 20px; }
        .lp-stats-row { display:flex; justify-content:center; align-items:center; gap:60px; flex-wrap:wrap; max-width:800px; margin:0 auto; }
        .lp-stat-item { text-align:center; }
        .lp-stat-num { font-size:36px; font-weight:900; color:#0F172A; letter-spacing:-1.5px; display:block; }
        .lp-stat-label { font-size:13px; color:#64748B; font-weight:500; margin-top:4px; }
        .lp-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; padding:0 20px; }
        @media (max-width:700px) { .lp-steps { grid-template-columns:1fr; } }
        .lp-step { text-align:center; padding:20px; }
        .lp-step-num { width:44px; height:44px; background:#4F46E5; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; margin:0 auto 16px; }
        .lp-step-title { font-size:16px; font-weight:800; color:#0F172A; margin-bottom:8px; letter-spacing:-.3px; }
        .lp-step-desc { font-size:14px; color:#64748B; line-height:1.6; }
        .lp-cta-banner { background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%); border-radius:24px; padding:60px 40px; text-align:center; margin:0 20px; position:relative; overflow:hidden; }
        .lp-cta-banner::before { content:''; position:absolute; top:-60px; right:-60px; width:250px; height:250px; background:rgba(255,255,255,.06); border-radius:50%; }
        .lp-footer { background:#0F172A; padding:64px 0 0; margin-top:0; }
        .lp-footer-grid { max-width:1200px; margin:0 auto; padding:0 40px; display:grid; grid-template-columns:2fr 1fr 1fr 1.4fr; gap:48px; }
        @media (max-width:900px) { .lp-footer-grid { grid-template-columns:1fr 1fr; } }
        .lp-footer-brand-title { font-size:18px; font-weight:800; color:#fff; display:flex; align-items:center; gap:8px; margin-bottom:12px; }
        .lp-footer-brand-icon { width:30px; height:30px; background:#4F46E5; border-radius:8px; display:flex; align-items:center; justify-content:center; }
        .lp-footer-brand-desc { font-size:14px; color:#64748B; line-height:1.65; margin-bottom:20px; max-width:280px; }
        .lp-footer-socials { display:flex; gap:10px; }
        .lp-social-btn { width:36px; height:36px; border:1px solid rgba(255,255,255,.12); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#94A3B8; cursor:pointer; transition:all .2s; background:transparent; text-decoration:none; font-size:16px; }
        .lp-social-btn:hover { border-color:#4F46E5; color:#fff; background:rgba(79,70,229,.15); }
        .lp-footer-col-title { font-size:13px; font-weight:700; color:#fff; margin-bottom:16px; text-transform:uppercase; letter-spacing:.5px; }
        .lp-footer-link { display:block; font-size:14px; color:#64748B; text-decoration:none; margin-bottom:10px; transition:color .2s; }
        .lp-footer-link:hover { color:#A5B4FC; }
        .lp-footer-newsletter-row { display:flex; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,.12); }
        .lp-footer-input { flex:1; background:rgba(255,255,255,.05); border:none; padding:10px 14px; font-size:13px; color:#fff; outline:none; width:auto; backdrop-filter:none; border-radius:0; }
        .lp-footer-input::placeholder { color:#4B5563; }
        .lp-footer-sub-btn { background:#4F46E5; border:none; padding:10px 16px; color:#fff; font-size:13px; font-weight:700; cursor:pointer; transition:background .2s; white-space:nowrap; }
        .lp-footer-sub-btn:hover { background:#4338CA; }
        .lp-footer-bottom { max-width:1200px; margin:40px auto 0; padding:20px 40px; border-top:1px solid rgba(255,255,255,.06); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
        .lp-footer-copyright { font-size:13px; color:#4B5563; }
        .lp-footer-bottom-links { display:flex; gap:20px; }
        .lp-footer-bottom-link { font-size:13px; color:#4B5563; text-decoration:none; transition:color .2s; }
        .lp-footer-bottom-link:hover { color:#A5B4FC; }
        .lp-section { padding:80px 0; }
        .lp-section-center { text-align:center; padding:0 20px; margin-bottom:52px; }
        .lp-section-badge { display:inline-block; font-size:12px; font-weight:700; color:#4F46E5; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px; }
        .lp-section-title { font-size:clamp(28px,4vw,40px); font-weight:900; color:#0F172A; letter-spacing:-1px; margin-bottom:14px; line-height:1.15; }
        .lp-section-sub { font-size:16px; color:#64748B; max-width:520px; margin:0 auto; line-height:1.65; }
        html { scroll-behavior:smooth; }
      `}</style>

      <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
        {/* ── Landing Navbar ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 1000, height: 64,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226,232,240,0.8)',
          display: 'flex', alignItems: 'center',
          padding: '0 40px',
        }}>
          <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
              <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#5B5FE8,#8B5CF6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(91,95,232,0.35)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', letterSpacing: '-0.4px' }}>Media Hoster</span>
            </Link>
            {/* Center links */}
            <div style={{ display: 'flex', gap: 2, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {[['Features','#features'],['Pricing','/signup'],['Docs','https://github.com/linamolygit/videostream'],['GitHub','https://github.com/linamolygit/videostream']].map(([label, href]) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  style={{ padding: '8px 14px', fontSize: 14, fontWeight: 500, color: '#64748B', textDecoration: 'none', borderRadius: 8, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
                >{label}</a>
              ))}
            </div>
            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
              <Link href="/login" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#64748B', textDecoration: 'none', borderRadius: 9, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#0F172A'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; }}
              >Log In</Link>
              <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#4F46E5', color: '#fff', textDecoration: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, boxShadow: '0 3px 12px rgba(79,70,229,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#4338CA'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >Sign Up Free</Link>
            </div>
          </div>
        </nav>

        <section className="lp-hero-bg">
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px 0', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div className="lp-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Secure. Fast. Reliable.
            </div>
            <h1 className="lp-hero-h1">Stream Your Media<br/>Securely, <span className="accent">Anywhere</span></h1>
            <p className="lp-hero-sub">Upload once, stream everywhere — secure, tokenized, and lightning fast. Zero-config WordPress integration with AES-256 encryption and HMAC-SHA256 signing.</p>
            <div className="lp-cta-row">
              <Link href="/signup" className="lp-btn-primary">
                Get Started Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer" className="lp-btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                View on GitHub
              </a>
            </div>
            {/* Browser Mockup */}
            <div className="lp-browser">
              <div className="lp-browser-bar">
                <div className="lp-browser-dots">
                  <div className="lp-dot" style={{ background: '#FF5F57' }}/>
                  <div className="lp-dot" style={{ background: '#FFBD2E' }}/>
                  <div className="lp-dot" style={{ background: '#28C840' }}/>
                </div>
                <div className="lp-browser-url">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  app.mediahoster.io/dashboard
                </div>
              </div>
              <div className="lp-browser-content">
                <div className="lp-db-sidebar">
                  <div className="lp-db-logo">
                    <div className="lp-db-logo-text">
                      <div className="lp-db-logo-icon"><svg width="14" height="14" fill="#fff" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
                      Media Hoster
                    </div>
                  </div>
                  {[['📊','Dashboard',true],['🎬','Media Library',false],['🔗','Stream Links',false],['📈','Analytics',false],['⚙️','Settings',false]].map(([icon,label,active])=>(
                    <div key={label} className={`lp-db-nav-item${active?' active':''}`}>
                      <span style={{fontSize:14}}>{icon}</span><span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="lp-db-main">
                  <div className="lp-db-topbar">
                    <div className="lp-db-topbar-title">Workspace Dashboard</div>
                    <button className="lp-db-upload-btn"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Upload & Generate</button>
                  </div>
                  <div className="lp-db-stats">
                    {[{l:'Total Videos',v:'24',c:'#4F46E5'},{l:'Carousels',v:'8',c:'#7C3AED'},{l:'Active Links',v:'32',c:'#10B981'},{l:'Bandwidth',v:'2.4TB',c:'#F59E0B'}].map(s=>(
                      <div key={s.l} className="lp-db-stat-card"><div className="lp-db-stat-label">{s.l}</div><div className="lp-db-stat-val" style={{color:s.c}}>{s.v}</div></div>
                    ))}
                  </div>
                  <div className="lp-db-section-title">Recent Media</div>
                  <div className="lp-db-grid">
                    {[{t:'Product Launch',type:'VIDEO',bg:'linear-gradient(135deg,#667eea,#764ba2)',e:'🎬'},{t:'Summer Campaign',type:'VIDEO',bg:'linear-gradient(135deg,#f093fb,#f5576c)',e:'🌅'},{t:'Blog Image Set',type:'CAROUSEL',bg:'linear-gradient(135deg,#4facfe,#00f2fe)',e:'🖼️'}].map((m,i)=>(
                      <div key={i} className="lp-db-media-card">
                        <div className="lp-db-thumb" style={{background:m.bg}}><span>{m.e}</span><div className="lp-db-type-badge" style={{background:m.type==='CAROUSEL'?'#7C3AED':'#4F46E5'}}>{m.type}</div></div>
                        <div className="lp-db-card-body"><div className="lp-db-card-title">{m.t}</div><div className="lp-db-card-sub">UUID: a1b2c3d4...</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <div className="lp-stats-strip">
          <div className="lp-stats-row">
            {[{num:'10K+',label:'Media Files Hosted'},{num:'99.9%',label:'Uptime SLA'},{num:'0ms',label:'Cold Start (Edge)'},{num:'100%',label:'Open Source'}].map(s=>(
              <div key={s.label} className="lp-stat-item"><span className="lp-stat-num">{s.num}</span><div className="lp-stat-label">{s.label}</div></div>
            ))}
          </div>
        </div>

        {/* Features */}
        <section className="lp-section" style={{background:'#FAFBFF'}}>
          <div className="lp-section-center"><span className="lp-section-badge">Features</span><h2 className="lp-section-title">Everything You Need to<br/>Stream Securely</h2><p className="lp-section-sub">Built for WordPress bloggers who want secure, professional media streaming without the complexity.</p></div>
          <div style={{maxWidth:1200,margin:'0 auto'}}>
            <div className="lp-features">
              {[{icon:'🔐',title:'AES-256 Token Encryption',desc:'Every stream link is encrypted with AES-256-CBC. No raw URLs ever leave the server — only opaque ciphertext tokens.'},{icon:'✍️',title:'HMAC-SHA256 Signatures',desc:'True HMAC-SHA256 using Web Crypto API. Source URL, filename, UUID, and expiry are all part of the signed message.'},{icon:'🤖',title:'PHP Bot Detection',desc:'Server-side PHP checks for Googlebot, AdX reviewer, and social crawlers. They receive clean article HTML with zero player markup.'},{icon:'⚡',title:'Cloudflare Edge Streaming',desc:'Zero-copy streaming via Cloudflare Workers. HTTP Range request support for seeking. Content served from 300+ edge locations.'},{icon:'🖼️',title:'Videos & Carousels',desc:'Upload videos with mandatory thumbnails or create multi-image carousel galleries. One link for your WordPress post.'},{icon:'🏢',title:'Multi-Tenant SaaS',desc:'Each user gets a completely isolated workspace. Your media, tokens, and analytics are private and namespace-separated.'}].map(f=>(
                <div key={f.title} className="lp-feature-card"><div className="lp-feature-icon">{f.icon}</div><div className="lp-feature-title">{f.title}</div><div className="lp-feature-desc">{f.desc}</div></div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="lp-section" style={{background:'#fff'}}>
          <div className="lp-section-center"><span className="lp-section-badge">How It Works</span><h2 className="lp-section-title">Three Steps to<br/>Secure Streaming</h2><p className="lp-section-sub">From upload to WordPress embed — set up in under 5 minutes.</p></div>
          <div style={{maxWidth:900,margin:'0 auto'}}>
            <div className="lp-steps">
              {[{n:'1',title:'Upload Your Media',desc:'Sign up free, upload your video (with mandatory thumbnail) or a batch of images for a carousel. Hosted on Cloudflare R2.'},{n:'2',title:'Generate Secure Link',desc:'Click "Generate Stream Link". The backend creates an AES-256 encrypted, HMAC-signed opaque token URL.'},{n:'3',title:'Paste in WordPress',desc:'Open the Media Link Manager plugin in WordPress admin, select your blog post, paste the link, and save.'}].map(s=>(
                <div key={s.n} className="lp-step"><div className="lp-step-num">{s.n}</div><div className="lp-step-title">{s.title}</div><div className="lp-step-desc">{s.desc}</div></div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="lp-section" style={{background:'#F8FAFC'}}>
          <div style={{maxWidth:1200,margin:'0 auto'}}>
            <div className="lp-cta-banner">
              <h2 style={{fontSize:'clamp(28px,4vw,42px)',fontWeight:900,color:'#fff',marginBottom:14,letterSpacing:-1,position:'relative',zIndex:1}}>Ready to Secure Your Media?</h2>
              <p style={{fontSize:16,color:'rgba(255,255,255,.75)',maxWidth:480,margin:'0 auto 32px',lineHeight:1.65,position:'relative',zIndex:1}}>Join thousands of WordPress bloggers who stream securely with Media Hoster.</p>
              <div className="lp-cta-row" style={{position:'relative',zIndex:1}}>
                <Link href="/signup" style={{display:'inline-flex',alignItems:'center',gap:8,background:'#fff',color:'#4F46E5',padding:'14px 28px',borderRadius:12,fontSize:15,fontWeight:800,border:'none',cursor:'pointer',textDecoration:'none',boxShadow:'0 4px 20px rgba(0,0,0,.15)',transition:'all .25s',letterSpacing:-.2}}>Get Started Free <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
                <a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:8,background:'transparent',color:'rgba(255,255,255,.85)',padding:'14px 28px',borderRadius:12,fontSize:15,fontWeight:700,border:'1.5px solid rgba(255,255,255,.3)',cursor:'pointer',textDecoration:'none',transition:'all .25s'}}>Star on GitHub</a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="lp-footer">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-footer-brand-title"><div className="lp-footer-brand-icon"><svg width="14" height="14" fill="#fff" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>Media Hoster</div>
              <p className="lp-footer-brand-desc">Open-source, multi-tenant media hosting SaaS. Stream videos and image carousels securely to WordPress with zero-config plugin integration.</p>
              <div className="lp-footer-socials">
                <a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer" className="lp-social-btn" title="GitHub"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg></a>
                <a href="#" className="lp-social-btn" title="Twitter">𝕏</a>
                <a href="#" className="lp-social-btn" title="Discord">💬</a>
              </div>
            </div>
            <div><div className="lp-footer-col-title">Product</div><Link href="/" className="lp-footer-link">Dashboard</Link><Link href="/signup" className="lp-footer-link">Pricing</Link><a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer" className="lp-footer-link">GitHub</a></div>
            <div><div className="lp-footer-col-title">Resources</div><Link href="/privacy" className="lp-footer-link">Privacy Policy</Link><Link href="/terms" className="lp-footer-link">Terms of Service</Link><a href="https://github.com/linamolygit/videostream/blob/main/PRODUCT_REQUIREMENTS_DOCUMENT.md" target="_blank" rel="noreferrer" className="lp-footer-link">Documentation</a><a href="https://github.com/linamolygit/videostream/issues" target="_blank" rel="noreferrer" className="lp-footer-link">Report Issue</a></div>
            <div><div className="lp-footer-newsletter-title" style={{fontSize:13,fontWeight:700,color:'#fff',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>Stay Updated</div><p style={{fontSize:13,color:'#64748B',marginBottom:16,lineHeight:1.5}}>Get notified when new features ship.</p><div className="lp-footer-newsletter-row"><input type="email" placeholder="your@email.com" className="lp-footer-input"/><button className="lp-footer-sub-btn">Subscribe</button></div></div>
          </div>
          <div className="lp-footer-bottom">
            <span className="lp-footer-copyright">© {new Date().getFullYear()} Media Hoster. MIT License.</span>
            <div className="lp-footer-bottom-links"><Link href="/privacy" className="lp-footer-bottom-link">Privacy</Link><Link href="/terms" className="lp-footer-bottom-link">Terms</Link><a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer" className="lp-footer-bottom-link">GitHub</a></div>
          </div>
        </footer>
      </div>
    </>
  );
}
