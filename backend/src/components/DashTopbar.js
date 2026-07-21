import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

/* ── Topbar (matching reference exactly) ── */
export default function DashTopbar({ user, isDark, onToggleDark, onUpload, onToggleSidebar }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifCount] = useState(3);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const bg     = isDark ? '#1A1F2E' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E8ECF0';
  const text   = isDark ? '#F1F5F9' : '#0F172A';
  const muted  = isDark ? '#94A3B8' : '#64748B';
  const inputBg= isDark ? '#0D1117' : '#F1F5F9';

  const avatarLetter = user?.username ? user.username.charAt(0).toUpperCase() : 'U';
  const displayName = user?.username || 'User';

  return (
    <header style={{
      height: 64,
      background: bg,
      borderBottom: `1px solid ${border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 20px',
      gap: 14,
      position: 'sticky', top: 0, zIndex: 100,
      transition: 'background 0.25s, border-color 0.25s',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        style={{
          width: 36, height: 36, borderRadius: 8,
          border: 'none', background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: muted, flexShrink: 0, transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Search Bar */}
      <div style={{
        flex: 1, maxWidth: 420,
        display: 'flex', alignItems: 'center', gap: 10,
        background: searchFocused ? (isDark ? '#0D1117' : '#fff') : inputBg,
        border: `1.5px solid ${searchFocused ? '#5B5FE8' : (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0')}`,
        borderRadius: 12, padding: '8px 14px',
        transition: 'all 0.2s',
        boxShadow: searchFocused ? '0 0 0 3px rgba(91,95,232,0.15)' : 'none',
      }}>
        <svg width="16" height="16" fill="none" stroke={muted} strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search media, folders, links..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: 13, color: text, flex: 1,
            fontFamily: 'Inter, sans-serif', fontWeight: 400,
            width: 'auto', padding: 0,
            backdropFilter: 'none',
            borderRadius: 0,
          }}
        />
        <span style={{
          fontSize: 11, color: muted, fontWeight: 600,
          background: isDark ? 'rgba(255,255,255,0.06)' : '#E8ECF0',
          padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap',
          letterSpacing: '0.5px',
        }}>⌘ K</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Upload Media Button */}
      <button
        onClick={onUpload}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 18px', borderRadius: 11,
          background: 'linear-gradient(135deg, #5B5FE8, #8B5CF6)',
          color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 700,
          boxShadow: '0 4px 14px rgba(91,95,232,0.35)',
          transition: 'all 0.2s cubic-bezier(0.25,1,0.5,1)',
          whiteSpace: 'nowrap',
          fontFamily: 'Inter, sans-serif',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(91,95,232,0.45)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(91,95,232,0.35)'; }}
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Upload Media
      </button>

      {/* Sun/Moon Slider Theme Toggle */}
      <label className="theme-switch" title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <input type="checkbox" checked={isDark} onChange={onToggleDark} />
        <span className="slider">
          <svg className="sun-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg className="moon-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </span>
      </label>

      {/* Notification Bell */}
      <button style={{
        position: 'relative', width: 36, height: 36, borderRadius: 9,
        border: `1.5px solid ${border}`,
        background: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
        cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: muted, transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B5FE8'; e.currentTarget.style.color = '#5B5FE8'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted; }}
      >
        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {notifCount > 0 && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            width: 17, height: 17, borderRadius: '50%',
            background: '#F97316', color: '#fff',
            fontSize: 9, fontWeight: 800, fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${bg}`,
          }}>{notifCount}</span>
        )}
      </button>

      {/* User Avatar + Dropdown */}
      <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setShowUserMenu(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 10px 5px 6px',
            borderRadius: 10, border: `1.5px solid ${border}`,
            background: 'transparent', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B5FE8'; }}
          onMouseLeave={e => { if (!showUserMenu) e.currentTarget.style.borderColor = border; }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5B5FE8, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#fff',
            fontFamily: 'Inter, sans-serif',
          }}>{avatarLetter}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: text, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
            {displayName}
          </span>
          <svg width="14" height="14" fill="none" stroke={muted} strokeWidth="2" viewBox="0 0 24 24" style={{ transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {showUserMenu && (
          <div style={{
            position: 'absolute', right: 0, top: 44, width: 190, zIndex: 200,
            background: isDark ? '#1A1F2E' : '#fff',
            border: `1px solid ${border}`,
            borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            padding: '6px',
            animation: 'fadeInDown 0.15s ease',
          }}>
            {[
              { label: 'My Profile', href: '/profile' },
              { label: 'Dashboard',  href: '/' },
            ].map(item => (
              <Link key={item.label} href={item.href} onClick={() => setShowUserMenu(false)} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, color: text,
                  fontFamily: 'Inter, sans-serif', transition: 'background 0.12s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >{item.label}</div>
              </Link>
            ))}
            <div style={{ height: 1, background: border, margin: '4px 0' }} />
            <div style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#EF4444', fontFamily: 'Inter, sans-serif', transition: 'background 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
