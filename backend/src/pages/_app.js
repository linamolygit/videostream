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
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
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

  return (
    <>
      <Head>
        <title>Media Hoster — Decoupled VOD & Carousel Streaming SaaS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* SaaS Sticky Navbar */}
      <nav className="saas-navbar">
        <div className="nav-container">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="Media Hoster Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
              <span style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px' }}>Media Hoster</span>
            </div>
          </Link>
          
          <div className="nav-links">
            <Link href="/">Dashboard</Link>
            <Link href="/#library">Media Library</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
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
                  style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <div style={{width:'22px', height:'22px', background:'rgba(255,255,255,0.25)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>
                     {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{user.username}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>

                {showDropdown && (
                  <div style={{
                    position: 'absolute', right: 0, top: '45px', width: '180px',
                    background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)', borderRadius: '12px',
                    boxShadow: 'var(--glass-shadow)', padding: '8px 0', zIndex: 1100
                  }}>
                    <Link href="/profile" style={{ display: 'block', padding: '8px 16px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px' }} onClick={() => setShowDropdown(false)}>
                      My Profile
                    </Link>
                    <Link href="/" style={{ display: 'block', padding: '8px 16px', color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px' }} onClick={() => setShowDropdown(false)}>
                      Dashboard
                    </Link>
                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '6px 0' }}></div>
                    <button 
                      onClick={handleLogout} 
                      style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>Login</button>
                </Link>
                <Link href="/signup">
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Sign Up</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ minHeight: 'calc(100vh - 220px)' }}>
        <Component {...pageProps} />
      </div>

      {/* SaaS Global Footer */}
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
      
      <div className="toast" id="globalToast"></div>
    </>
  );
}
