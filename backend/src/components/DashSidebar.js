import React, { useState } from 'react';
import Link from 'next/link';

/* ── Outline SVG Icons ── */
const Icon = ({ name, size = 18 }) => {
  const s = { width: size, height: size, flexShrink: 0 };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    library:   <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    upload:    <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    links:     <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>,
    analytics: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></>,
    profile:   <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    logout:    <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    lightning: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
  };
  return (
    <svg style={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
};

/* ── Circular Storage Progress ── */
const StorageRing = ({ pct = 64, isDark }) => {
  const r = 26, circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.08)'} strokeWidth="6"/>
      <circle cx="32" cy="32" r={r} fill="none" stroke="url(#storageGrad)" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 32 32)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <defs>
        <linearGradient id="storageGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8"/>
          <stop offset="100%" stopColor="#5B5FE8"/>
        </linearGradient>
      </defs>
      <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">{pct}%</text>
    </svg>
  );
};

const NAV = [
  { key: 'dashboard', label: 'Dashboard',    icon: 'dashboard', href: '/' },
  { key: 'library',   label: 'Media Library',icon: 'library',   href: '/' },
  { key: 'upload',    label: 'Upload Media', icon: 'upload',    href: null, action: true },
  { key: 'links',     label: 'Stream Links', icon: 'links',     href: '/' },
  { key: 'analytics', label: 'Analytics',    icon: 'analytics', href: '/' },
  { key: 'profile',   label: 'Profile',      icon: 'profile',   href: '/profile' },
  { key: 'settings',  label: 'Settings',     icon: 'settings',  href: '/' },
];

export default function DashSidebar({ activeKey = 'dashboard', onUpload, onLogout, videoCount = 0, isDark }) {
  const [hovered, setHovered] = useState(null);

  // Estimate storage: ~50MB per video (rough proxy for display)
  const usedGB = Math.min((videoCount * 0.05), 10).toFixed(1);
  const usedPct = Math.round((usedGB / 10) * 100);

  const SB = '#0C1425'; // sidebar bg
  const activeGrad = 'linear-gradient(135deg, #5B5FE8 0%, #8B5CF6 100%)';

  return (
    <div style={{
      width: 200,
      minWidth: 200,
      height: '100vh',
      background: SB,
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      zIndex: 10,
      flexShrink: 0,
    }}>
      {/* ── Logo ── */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #5B5FE8, #8B5CF6)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(91,95,232,0.4)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.3px', fontFamily: 'Inter, sans-serif' }}>
            Media Hoster
          </span>
        </div>
      </div>

      {/* ── Nav Items ── */}
      <nav style={{ flex: 1, padding: '12px 12px 0' }}>
        {NAV.map(item => {
          const isActive = activeKey === item.key;
          const isHov = hovered === item.key;
          const content = (
            <div
              onClick={item.action ? onUpload : undefined}
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 2,
                cursor: 'pointer',
                background: isActive ? activeGrad : isHov ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: isActive ? '#fff' : isHov ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.18s cubic-bezier(0.25,1,0.5,1)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14, fontWeight: isActive ? 600 : 500,
                boxShadow: isActive ? '0 4px 12px rgba(91,95,232,0.35)' : 'none',
                transform: isHov && !isActive ? 'translateX(2px)' : 'translateX(0)',
              }}
            >
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
            </div>
          );

          if (item.href && !item.action) {
            return <Link key={item.key} href={item.href} style={{ textDecoration: 'none' }}>{content}</Link>;
          }
          return <div key={item.key}>{content}</div>;
        })}
      </nav>

      {/* ── Storage Widget ── */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '12px 0 0' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}>
          Storage Used
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StorageRing pct={usedPct || 1} isDark />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{usedGB} GB / 10 GB</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>of 10 GB Used</div>
          </div>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={() => {}}
          style={{
            width: '100%', marginTop: 12,
            padding: '9px 0',
            background: 'linear-gradient(135deg, #5B5FE8, #8B5CF6)',
            border: 'none', borderRadius: 10,
            color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 4px 14px rgba(91,95,232,0.4)',
            transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(91,95,232,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(91,95,232,0.4)'; }}
        >
          <Icon name="lightning" size={13} />
          Upgrade Plan
        </button>
      </div>

      {/* ── Logout ── */}
      <div style={{ padding: '8px 12px 16px' }}>
        <div
          onClick={onLogout}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#FCA5A5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10,
            cursor: 'pointer', transition: 'all 0.18s',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 14, fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <Icon name="logout" size={17} />
          Logout
        </div>
      </div>
    </div>
  );
}
