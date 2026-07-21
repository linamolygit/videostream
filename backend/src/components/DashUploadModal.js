import React, { useState } from 'react';

export default function DashUploadModal({ show, isDark, onClose, onSubmit }) {
  const [tab, setTab]           = useState('video');
  const [title, setTitle]       = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbUrl, setThumbUrl] = useState('');
  const [carousel, setCarousel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showVideoPw, setShowVideoPw] = useState(false); // show/hide URL

  if (!show) return null;

  const bg      = isDark ? '#1A1F2E' : '#FFFFFF';
  const overlay = 'rgba(0,0,0,0.65)';
  const border  = isDark ? 'rgba(255,255,255,0.09)' : '#E2E8F0';
  const text    = isDark ? '#F1F5F9' : '#0F172A';
  const muted   = isDark ? '#94A3B8' : '#64748B';
  const inputBg = isDark ? '#0D1117' : '#F8FAFC';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { alert('Please enter a title'); return; }
    if (tab === 'video') {
      if (!thumbUrl.trim()) { alert('Thumbnail URL is required'); return; }
      if (!videoUrl.trim()) { alert('Video URL is required'); return; }
    } else {
      const lines = carousel.split('\n').filter(s => s.trim());
      if (!lines.length) { alert('At least one image URL required'); return; }
    }

    setUploading(true);
    setProgress(30);
    await new Promise(r => setTimeout(r, 400));
    setProgress(65);

    try {
      await onSubmit({ title, tab, videoUrl, thumbUrl, carousel });
      setProgress(100);
      await new Promise(r => setTimeout(r, 300));
      setTitle(''); setVideoUrl(''); setThumbUrl(''); setCarousel('');
      setUploading(false); setProgress(0);
      onClose();
    } catch {
      setUploading(false); setProgress(0);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: inputBg, border: `1.5px solid ${border}`,
    borderRadius: 10, fontSize: 13, color: text,
    outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
    backdropFilter: 'none',
  };

  const labelStyle = { fontSize: 12, fontWeight: 700, color: muted, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.1px' };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: overlay,
      backdropFilter: 'blur(8px)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fadeIn 0.15s ease',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: bg, borderRadius: 20,
        border: `1px solid ${border}`,
        width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        animation: 'slideUp 0.2s cubic-bezier(0.25,1,0.5,1)',
        fontFamily: 'Inter, sans-serif',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 24px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: text, letterSpacing: '-0.4px' }}>Upload & Generate Link</h3>
            <p style={{ fontSize: 12, color: muted, marginTop: 2 }}>Add media and get a secure streaming link</p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`,
            background: 'transparent', cursor: 'pointer', color: muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tab selector */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 8 }}>
          {[['video', '🎬', 'Video'], ['carousel', '🖼️', 'Carousel']].map(([t, emoji, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700,
              background: tab === t ? (t === 'video' ? 'linear-gradient(135deg,#5B5FE8,#8B5CF6)' : 'linear-gradient(135deg,#8B5CF6,#EC4899)') : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
              color: tab === t ? '#fff' : muted,
              transition: 'all 0.2s',
              boxShadow: tab === t ? '0 3px 10px rgba(91,95,232,0.3)' : 'none',
            }}>
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Media Title <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="text" placeholder="e.g., Summer Campaign Video"
              value={title} onChange={e => setTitle(e.target.value)} required
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#5B5FE8'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,232,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {tab === 'video' && (
            <>
              {/* Thumbnail URL */}
              <div>
                <label style={labelStyle}>
                  Thumbnail Image URL <span style={{ color: '#EF4444' }}>*</span>
                  <span style={{ color: '#F97316', fontSize: 10, background: '#FFF7ED', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>REQUIRED</span>
                </label>
                <input
                  type="url" placeholder="https://cdn.example.com/thumb.jpg"
                  value={thumbUrl} onChange={e => setThumbUrl(e.target.value)} required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#5B5FE8'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,232,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none'; }}
                />
                <p style={{ fontSize: 11, color: muted, marginTop: 4 }}>Shown as ghost image before user hits play</p>
              </div>

              {/* Video Source URL */}
              <div>
                <label style={labelStyle}>Video Source URL <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showVideoPw ? 'text' : 'password'}
                    placeholder="https://pub-r2.dev/video.mp4"
                    value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required
                    style={{ ...inputStyle, paddingRight: 40 }}
                    onFocus={e => { e.target.style.borderColor = '#5B5FE8'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,232,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowVideoPw(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: muted, padding: 4 }}>
                    {showVideoPw ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: muted, marginTop: 4 }}>This URL is AES-256 encrypted — never exposed to viewers</p>
              </div>
            </>
          )}

          {tab === 'carousel' && (
            <div>
              <label style={labelStyle}>Image URLs <span style={{ color: '#EF4444' }}>*</span> <span style={{ fontSize: 10, color: muted }}>one per line</span></label>
              <textarea
                rows={5} placeholder={"https://cdn.example.com/img1.jpg\nhttps://cdn.example.com/img2.jpg\nhttps://cdn.example.com/img3.jpg"}
                value={carousel} onChange={e => setCarousel(e.target.value)} required
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => { e.target.style.borderColor = '#5B5FE8'; e.target.style.boxShadow = '0 0 0 3px rgba(91,95,232,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          )}

          {/* Progress bar */}
          {uploading && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: muted, marginBottom: 5 }}>
                <span>Encrypting & generating token…</span><span>{progress}%</span>
              </div>
              <div style={{ height: 5, background: isDark ? 'rgba(255,255,255,0.08)' : '#EEF2FF', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #5B5FE8, #8B5CF6)', borderRadius: 99, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}

          {/* Info banner */}
          <div style={{ background: isDark ? 'rgba(91,95,232,0.08)' : '#EEF2FF', border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : '#C7D2FE'}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: isDark ? '#818CF8' : '#4F46E5' }}>
            💡 <strong>How it works:</strong> After saving, copy the generated stream link → paste into WordPress Plugin → select your blog post → save.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={uploading} style={{
              flex: 1, padding: '11px 0',
              background: uploading ? '#94A3B8' : 'linear-gradient(135deg, #5B5FE8, #8B5CF6)',
              color: '#fff', border: 'none', borderRadius: 11,
              fontSize: 14, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: uploading ? 'none' : '0 4px 14px rgba(91,95,232,0.35)',
              transition: 'all 0.2s',
            }}>
              {uploading ? 'Generating…' : '✨ Generate Stream Link'}
            </button>
            <button type="button" onClick={onClose} style={{
              padding: '11px 20px', background: 'transparent',
              border: `1.5px solid ${border}`, borderRadius: 11,
              fontSize: 14, fontWeight: 600, color: muted, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B5FE8'; e.currentTarget.style.color = '#5B5FE8'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted; }}
            >Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
