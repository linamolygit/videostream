import '../styles/globals.css';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const [user,        setUser]        = useState(null);
  const [userLoaded,  setUserLoaded]  = useState(false);
  const [isDarkMode,  setIsDarkMode]  = useState(false);
  const [showDropdown,setShowDropdown]= useState(false);
  const router = useRouter();

  const isHome     = router.pathname === '/';
  const isAuthPage = ['/login', '/signup', '/plugin-preview'].includes(router.pathname);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') { setIsDarkMode(true); document.body.classList.add('dark-mode'); }
    else document.body.classList.remove('dark-mode');

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { setUser(data.user || null); setUserLoaded(true); })
      .catch(() => { setUser(null); setUserLoaded(true); });
  }, [router.pathname]);

  const toggleTheme = (e) => {
    const isDark = e.target.checked;
    setIsDarkMode(isDark);
    if (isDark) { document.body.classList.add('dark-mode'); localStorage.setItem('theme', 'dark'); }
    else { document.body.classList.remove('dark-mode'); localStorage.setItem('theme', 'light'); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null); setShowDropdown(false);
    router.push('/login');
  };

  /* ──────────────────────────────────────────────
     FULL SCREEN PAGES: Dashboard (home + logged in)
     and Auth pages — rendered with no global wrapper
  ──────────────────────────────────────────────── */
  if (isHome || isAuthPage) {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
        <style>{`
          @keyframes fadeIn     { from { opacity:0; }                          to { opacity:1; } }
          @keyframes slideUp    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
          @keyframes fadeInDown { from { opacity:0; transform:translateY(-8px); }  to { opacity:1; transform:translateY(0); } }
          @keyframes spin       { to { transform: rotate(360deg); } }
        `}</style>
      </>
    );
  }

  /* ──────────────────────────────────────────────
     LANDING NAV — guest user on home route
     (Handled inside index.js now, so this branch
     is mainly for: /privacy, /terms, /profile etc.)
  ──────────────────────────────────────────────── */

  /* ──────────────────────────────────────────────
     SAAS APP NAV — other pages (/profile, /privacy, etc.)
  ──────────────────────────────────────────────── */
  const border = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)';

  return (
    <>
      <Head>
        <title>Media Hoster — Decoupled VOD &amp; Carousel Streaming SaaS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      {/* App Navbar for inner pages */}
      <nav className="saas-navbar">
        <div className="nav-container">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#5B5FE8,#8B5CF6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.4px', fontFamily: 'Inter, sans-serif' }}>Media Hoster</span>
            </div>
          </Link>

          <div className="nav-links">
            <Link href="/">Dashboard</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            {/* Theme toggle */}
            <label className="theme-switch main-theme-toggle" title="Toggle Theme">
              <input type="checkbox" id="themeToggle" checked={isDarkMode} onChange={toggleTheme} />
              <span className="slider">
                <svg className="sun-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <svg className="moon-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              </span>
            </label>

            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{user.username}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {showDropdown && (
                  <div style={{ position: 'absolute', right: 0, top: 45, width: 180, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 12, boxShadow: 'var(--glass-shadow)', padding: '8px 0', zIndex: 1100 }}>
                    <Link href="/profile" style={{ display: 'block', padding: '8px 16px', color: 'var(--text-main)', textDecoration: 'none', fontSize: 14, fontFamily: 'Inter, sans-serif' }} onClick={() => setShowDropdown(false)}>My Profile</Link>
                    <Link href="/" style={{ display: 'block', padding: '8px 16px', color: 'var(--text-main)', textDecoration: 'none', fontSize: 14, fontFamily: 'Inter, sans-serif' }} onClick={() => setShowDropdown(false)}>Dashboard</Link>
                    <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 0' }} />
                    <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login"><button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 14 }}>Login</button></Link>
                <Link href="/signup"><button className="btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}>Sign Up</button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div style={{ minHeight: 'calc(100vh - 220px)' }}>
        <Component {...pageProps} />
      </div>

      <footer className="saas-footer">
        <div className="footer-container">
          <div className="footer-col">
            <h4>Media Hoster</h4>
            <p>Open-source multi-tenant media hosting SaaS. Stream videos securely to WordPress.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <Link href="/">Dashboard</Link>
            <a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer">GitHub (Open Source)</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
        <div className="footer-bottom">&copy; {new Date().getFullYear()} Media Hoster. Open Source Software.</div>
      </footer>

      <div className="toast" id="globalToast" />

      <style>{`
        @keyframes fadeIn     { from { opacity:0; }                          to { opacity:1; } }
        @keyframes slideUp    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </>
  );
}
