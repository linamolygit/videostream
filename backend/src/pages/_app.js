import '../styles/globals.css';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // We explicitly want light mode by default
  useEffect(() => {
    // Only check local storage if they manually saved a preference, 
    // otherwise default is light mode.
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Check auth status
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

  // Check if current page is the Dashboard (/app) to hide the SaaS Navbar
  const isDashboard = false; // We can let the Navbar show everywhere or hide it on specific pages

  return (
    <>
      <Head>
        <title>Media Hoster - Enterprise Media Sync</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* SaaS Global Navbar */}
      <nav className="saas-navbar">
        <div className="nav-container">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="ThumbCraft Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
              <span style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px' }}>Media Hoster</span>
            </div>
          </Link>
          
          <div className="nav-links">
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
              <>
                <Link href="/admin/videos">
                  <span className="text-sm font-medium hover:text-blue-500 cursor-pointer transition-colors" style={{marginRight: '10px'}}>Manager</span>
                </Link>
                <Link href="/profile">
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{width:'20px', height:'20px', background:'rgba(255,255,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                       {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    Profile
                  </button>
                </Link>
              </>
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

      {/* Main Page Component */}
      <div style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Component {...pageProps} />
      </div>

      {/* SaaS Global Footer */}
      <footer className="saas-footer">
        <div className="footer-container">
          <div className="footer-col">
            <h4>Media Hoster</h4>
            <p>Enterprise media syncing and secure ghost player routing built for the modern web.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Media Hoster. All rights reserved.
        </div>
      </footer>
      
      <div className="toast" id="globalToast"></div>
    </>
  );
}
