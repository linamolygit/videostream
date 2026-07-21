import React, { useState, useRef, useEffect } from 'react';

/* Gradient placeholders for cards without thumbnails */
const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fda085,#f6d365)',
  'linear-gradient(135deg,#0ba360,#3cba92)',
];

function timeAgo(dateStr) {
  if (!dateStr) return 'Just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function DashMediaCard({ item, isDark, onCopy, onDelete, index = 0 }) {
  const [showMenu, setShowMenu] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cardBg   = isDark ? '#1A1F2E' : '#FFFFFF';
  const border   = isDark ? 'rgba(255,255,255,0.07)' : '#E8ECF0';
  const text     = isDark ? '#F1F5F9' : '#0F172A';
  const muted    = isDark ? '#94A3B8' : '#64748B';
  const menuBg   = isDark ? '#1F2537' : '#fff';
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const isCarousel = item.media_type === 'carousel';
  const badgeBg = isCarousel ? '#8B5CF6' : '#5B5FE8';

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${hovered ? (isDark ? 'rgba(91,95,232,0.4)' : '#C7D2FE') : border}`,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.22s cubic-bezier(0.25,1,0.5,1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? (isDark ? '0 12px 32px rgba(0,0,0,0.4)' : '0 12px 32px rgba(91,95,232,0.12)')
          : (isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.04)'),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Thumbnail ── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: gradient }}>
        {item.thumbnail_path && (
          <img
            src={item.thumbnail_path}
            alt={item.title}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
              position: 'absolute', inset: 0,
            }}
          />
        )}

        {/* Play button overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: hovered ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.1)',
          transition: 'background 0.2s',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#5B5FE8">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Type badge */}
        <span style={{
          position: 'absolute', top: 8, left: 8,
          background: badgeBg, color: '#fff',
          fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 5,
          letterSpacing: '0.6px', textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
        }}>
          {isCarousel ? 'CAROUSEL' : 'VIDEO'}
        </span>

        {/* Duration badge */}
        <span style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(0,0,0,0.7)', color: '#fff',
          fontSize: 11, fontWeight: 600, padding: '3px 7px', borderRadius: 5,
          backdropFilter: 'blur(8px)',
          fontFamily: 'Inter, sans-serif', letterSpacing: '0.3px',
        }}>
          {isCarousel ? '∞' : `0${Math.floor((index + 1) * 2.3)}:${String(Math.round((index + 1) * 17) % 60).padStart(2, '0')}`}
        </span>
      </div>

      {/* ── Info ── */}
      <div style={{ padding: '12px 14px 14px', flex: 1 }}>
        <h4 style={{
          fontSize: 14, fontWeight: 600, color: text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 3, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.2px',
        }}>{item.title}</h4>
        <p style={{ fontSize: 12, color: muted, fontFamily: 'Inter, sans-serif' }}>
          Uploaded {timeAgo(item.created_at)}
        </p>

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <code style={{
            fontSize: 10, color: isDark ? '#818CF8' : '#6366F1',
            background: isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF',
            padding: '3px 7px', borderRadius: 5,
            fontFamily: 'monospace', letterSpacing: '-0.2px',
          }}>{item.video_uuid.substring(0, 8)}…</code>

          <div style={{ display: 'flex', gap: 4 }}>
            {/* Copy icon */}
            <button
              onClick={() => onCopy(item.video_uuid)}
              title="Copy stream link"
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: `1px solid ${border}`, background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: muted, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF'; e.currentTarget.style.color = '#5B5FE8'; e.currentTarget.style.borderColor = '#5B5FE8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = muted; e.currentTarget.style.borderColor = border; }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>

            {/* Three dots menu */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(v => !v)}
                style={{
                  width: 28, height: 28, borderRadius: 7,
                  border: `1px solid ${border}`, background: 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: muted, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'; }}
                onMouseLeave={e => { if (!showMenu) e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                </svg>
              </button>

              {showMenu && (
                <div style={{
                  position: 'absolute', right: 0, bottom: 34, width: 150, zIndex: 50,
                  background: menuBg, border: `1px solid ${border}`,
                  borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                  padding: '4px',
                  animation: 'fadeIn 0.12s ease',
                }}>
                  {[
                    { label: 'Copy Link',    icon: '📋', action: () => { onCopy(item.video_uuid); setShowMenu(false); }, color: text },
                    { label: 'View Details', icon: '👁️', action: () => setShowMenu(false), color: text },
                    { label: 'Delete',       icon: '🗑️', action: () => { onDelete(item.id); setShowMenu(false); }, color: '#EF4444' },
                  ].map(m => (
                    <div key={m.label}
                      onClick={m.action}
                      style={{ padding: '8px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: m.color, display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'Inter, sans-serif', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>{m.icon}</span>{m.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
