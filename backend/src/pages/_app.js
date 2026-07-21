import '../styles/globals.css';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const isHome = router.pathname === '/';

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, [router.pathname]);

  const toggleTheme = (e) => {
    const isDark = e.target.checked;
    setIsDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setShowDropdown(false);
    router.push('/login');
  };

  /* ───────────────────────────────────────────
     LANDING PAGE NAVBAR (guest + home route)
  ___________________________________________ */
  const LandingNav = () => (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226,232,240,0.8)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', height: 64,
        justifyContent: 'space-between',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#0F172A', letterSpacing: '-0.4px' }}>
            Media Hoster
          </span>
        </Link>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[
            ['#features', 'Features'],
            ['#pricing', 'Pricing'],
            ['https://github.com/linamolygit/videostream/blob/main/PRODUCT_REQUIREMENTS_DOCUMENT.md', 'Docs'],
            ['https://github.com/linamolygit/videostream', 'GitHub'],
          ].map(([href, label]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              style={{
                padding: '6px 14px', borderRadius: 8,
                fontSize: 14, fontWeight: 500, color: '#475569',
                textDecoration: 'none', transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#4F46E5'; e.currentTarget.style.background = '#F0F4FF'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right Auth Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/login" style={{
            padding: '7px 16px', borderRadius: 9,
            fontSize: 14, fontWeight: 600, color: '#475569',
            textDecoration: 'none', transition: 'color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#4F46E5'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}
          >
            Log In
          </Link>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 9,
            fontSize: 14, fontWeight: 700, color: '#fff',
            background: '#4F46E5',
            textDecoration: 'none',
            boxShadow: '0 2px 10px rgba(79,70,229,0.3)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4338CA'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Sign Up Free
          </Link>
        </div>
      </div>
    </nav>
  );

  /* ───────────────────────────────────────────
     SAAS APP NAVBAR (logged-in or other pages)
  ___________________________________________ */
  const AppNav = () => (
    <nav className="saas-navbar">
      <div className="nav-container">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.4px' }}>Media Hoster</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link href="/">Dashboard</Link>
          <Link href="/#library">Media Library</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 15, position: 'relative' }}>
          <label className="theme-switch main-theme-toggle" title="Toggle Theme">
            <input type="checkbox" id="themeToggle" checked={isDarkMode} onChange={toggleTheme} />
            <span className="slider">
              <svg className="sun-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg className="moon-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </span>
          </label>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.username}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>

              {showDropdown && (
                <div style={{
                  position: 'absolute', right: 0, top: 45, width: 180,
                  background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                  border: '1px solid var(--glass-border)', borderRadius: 12,
                  boxShadow: 'var(--glass-shadow)', padding: '8px 0', zIndex: 1100
                }}>
                  <Link href="/profile" style={{ display: 'block', padding: '8px 16px', color: 'var(--text-main)', textDecoration: 'none', fontSize: 14 }} onClick={() => setShowDropdown(false)}>
                    My Profile
                  </Link>
                  <Link href="/" style={{ display: 'block', padding: '8px 16px', color: 'var(--text-main)', textDecoration: 'none', fontSize: 14 }} onClick={() => setShowDropdown(false)}>
                    Dashboard
                  </Link>
                  <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 14 }}>Login</button>
              </Link>
              <Link href="/signup">
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}>Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  /* Show landing nav when: on home route AND user is not logged in
     Show app nav when: user is logged in OR on any other page        */
  const showLandingNav = isHome && !user;
  const showGlobalFooter = !(isHome && !user); // landing page has its own footer

  return (
    <>
      <Head>
        <title>Media Hoster — Decoupled VOD &amp; Carousel Streaming SaaS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar — conditional */}
      {showLandingNav ? <LandingNav /> : <AppNav />}

      {/* Main Content */}
      <div style={{ minHeight: showGlobalFooter ? 'calc(100vh - 220px)' : undefined }}>
        <Component {...pageProps} />
      </div>

      {/* Global Footer — only on non-landing pages */}
      {showGlobalFooter && (
        <footer className="saas-footer">
          <div className="footer-container">
            <div className="footer-col">
              <h4>Media Hoster</h4>
              <p>Open-source multi-tenant media hosting SaaS. Stream videos and image carousels securely to WordPress.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <Link href="/">Dashboard</Link>
              <Link href="/#library">Media Library</Link>
              <a href="https://github.com/linamolygit/videostream" target="_blank" rel="noreferrer">GitHub (Open Source)</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} Media Hoster. Open Source Software.
          </div>
        </footer>
      )}

      <div className="toast" id="globalToast" />
    </>
  );
}
