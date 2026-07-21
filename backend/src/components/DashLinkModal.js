import React from 'react';

export default function DashLinkModal({ show, link, isDark, onClose }) {
  if (!show) return null;

  const bg     = isDark ? '#1A1F2E' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.09)' : '#E2E8F0';
  const text   = isDark ? '#F1F5F9' : '#0F172A';
  const muted  = isDark ? '#94A3B8' : '#64748B';
  const codeBg = isDark ? '#0D1117' : '#F8FAFC';

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    const btn = document.getElementById('copyLinkBtn');
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(10px)', zIndex: 2100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fadeIn 0.15s ease',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: bg, borderRadius: 20, border: `1px solid ${border}`,
        width: '100%', maxWidth: 480,
        boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.2s cubic-bezier(0.25,1,0.5,1)',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}>
        {/* Success header */}
        <div style={{
          background: 'linear-gradient(135deg, #5B5FE8 0%, #8B5CF6 100%)',
          padding: '28px 24px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 26,
          }}>🎉</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
            Stream Link Ready!
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
            Your secure, encrypted streaming link has been generated
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px 24px' }}>
          {/* Link display */}
          <div style={{
            background: codeBg, border: `1.5px solid ${border}`,
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
              Your Stream Link
            </p>
            <code style={{
              fontSize: 12, color: isDark ? '#818CF8' : '#5B5FE8',
              wordBreak: 'break-all', display: 'block', lineHeight: 1.5,
              fontFamily: 'monospace',
            }}>{link}</code>
          </div>

          {/* Copy button */}
          <button
            id="copyLinkBtn"
            onClick={copyLink}
            style={{
              width: '100%', padding: '11px 0',
              background: 'linear-gradient(135deg, #5B5FE8, #8B5CF6)',
              color: '#fff', border: 'none', borderRadius: 11,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 14px rgba(91,95,232,0.35)',
              marginBottom: 12, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(91,95,232,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(91,95,232,0.35)'; }}
          >
            Copy Link
          </button>

          {/* How to use */}
          <div style={{
            background: isDark ? 'rgba(16,185,129,0.08)' : '#F0FDF4',
            border: `1px solid ${isDark ? 'rgba(16,185,129,0.2)' : '#BBF7D0'}`,
            borderRadius: 10, padding: '10px 14px',
            fontSize: 12, color: isDark ? '#34D399' : '#059669',
            marginBottom: 14, lineHeight: 1.55,
          }}>
            <strong>💡 Next step:</strong> Go to WordPress Admin → Media Links Plugin → Select post → Paste this link → Save
          </div>

          {/* Security note */}
          <div style={{
            background: isDark ? 'rgba(91,95,232,0.08)' : '#EEF2FF',
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : '#C7D2FE'}`,
            borderRadius: 10, padding: '10px 14px',
            fontSize: 12, color: isDark ? '#818CF8' : '#4F46E5',
            marginBottom: 16, lineHeight: 1.55,
          }}>
            🔐 AES-256 encrypted · HMAC-SHA256 signed · Expires in 24h
          </div>

          <button onClick={onClose} style={{
            width: '100%', padding: '10px 0',
            background: 'transparent', border: `1.5px solid ${border}`,
            borderRadius: 11, fontSize: 14, fontWeight: 600, color: muted,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B5FE8'; e.currentTarget.style.color = '#5B5FE8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted; }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
