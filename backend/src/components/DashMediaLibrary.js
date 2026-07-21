import React, { useState } from 'react';
import DashMediaCard from './DashMediaCard';

const TABS = ['All', 'Videos', 'Images', 'Folders'];

/* Empty state placeholder (shown as first card when 0 videos) */
function EmptyCard({ isDark, onUpload }) {
  const border = isDark ? 'rgba(255,255,255,0.07)' : '#E8ECF0';
  const bg     = isDark ? '#1A1F2E' : '#FFFFFF';
  const text   = isDark ? '#F1F5F9' : '#0F172A';
  const muted  = isDark ? '#94A3B8' : '#64748B';

  return (
    <div style={{
      background: bg, border: `1.5px dashed ${border}`,
      borderRadius: 14, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '28px 20px', textAlign: 'center', minHeight: 220,
    }}>
      {/* Illustration */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.6" strokeLinecap="round">
            <rect x="2" y="6" width="15" height="12" rx="2"/>
            <path d="M22 8l-5 4 5 4V8z"/>
          </svg>
        </div>
        {/* Decorative dots */}
        {[[-12, -8, '#F59E0B'], [14, -14, '#EC4899'], [-10, 16, '#10B981']].map(([x, y, c], i) => (
          <div key={i} style={{
            position: 'absolute', width: 8, height: 8, borderRadius: 2,
            background: c, top: 30 + y, left: 30 + x, opacity: 0.7,
            transform: `rotate(${i * 30}deg)`,
          }} />
        ))}
      </div>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 5, fontFamily: 'Inter, sans-serif' }}>
        No videos yet
      </h4>
      <p style={{ fontSize: 12, color: muted, lineHeight: 1.5, marginBottom: 14, fontFamily: 'Inter, sans-serif', maxWidth: 160 }}>
        Upload your first video and start managing your media.
      </p>
      <button
        onClick={onUpload}
        style={{
          padding: '8px 16px', background: '#5B5FE8',
          color: '#fff', border: 'none', borderRadius: 9,
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 3px 10px rgba(91,95,232,0.35)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#5B5FE8'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        Upload Media
      </button>
    </div>
  );
}

export default function DashMediaLibrary({ videos = [], isDark, onCopy, onDelete, onUpload }) {
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSort, setShowSort] = useState(false);

  const bg     = isDark ? '#1A1F2E' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.07)' : '#E8ECF0';
  const text   = isDark ? '#F1F5F9' : '#0F172A';
  const muted  = isDark ? '#94A3B8' : '#64748B';
  const tabHover = isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC';

  /* Filter logic */
  const filtered = videos
    .filter(v => {
      if (activeTab === 'Videos') return v.media_type !== 'carousel';
      if (activeTab === 'Images') return v.media_type === 'carousel';
      return true;
    })
    .filter(v => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return v.title.toLowerCase().includes(q) || v.video_uuid.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'Oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'Name')   return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 18,
      padding: '22px 24px 28px',
      boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: text, letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>
          Media Library
        </h2>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: isDark ? '#0D1117' : '#F8FAFC',
            border: `1px solid ${border}`, borderRadius: 9,
            padding: '6px 12px',
          }}>
            <svg width="13" height="13" fill="none" stroke={muted} strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontSize: 12, color: text, width: 120,
                fontFamily: 'Inter, sans-serif', padding: 0,
                backdropFilter: 'none',
                borderRadius: 0,
              }}
            />
          </div>

          {/* Sort dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSort(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 9,
                border: `1px solid ${border}`, background: 'transparent',
                fontSize: 12, fontWeight: 600, color: muted,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B5FE8'; e.currentTarget.style.color = '#5B5FE8'; }}
              onMouseLeave={e => { if (!showSort) { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted; } }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              {sortBy}
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            {showSort && (
              <div style={{
                position: 'absolute', right: 0, top: 36, width: 130, zIndex: 40,
                background: isDark ? '#1A1F2E' : '#fff', border: `1px solid ${border}`,
                borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '4px',
              }}>
                {['Newest', 'Oldest', 'Name'].map(opt => (
                  <div key={opt}
                    onClick={() => { setSortBy(opt); setShowSort(false); }}
                    style={{
                      padding: '8px 12px', borderRadius: 7, cursor: 'pointer',
                      fontSize: 12, fontWeight: opt === sortBy ? 700 : 500,
                      color: opt === sortBy ? '#5B5FE8' : muted,
                      background: opt === sortBy ? (isDark ? 'rgba(91,95,232,0.12)' : '#EEF2FF') : 'transparent',
                      fontFamily: 'Inter, sans-serif', transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (opt !== sortBy) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'; }}
                    onMouseLeave={e => { if (opt !== sortBy) e.currentTarget.style.background = 'transparent'; }}
                  >{opt}</div>
                ))}
              </div>
            )}
          </div>

          {/* Filter button */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 12px', borderRadius: 9,
            border: `1px solid ${border}`, background: 'transparent',
            fontSize: 12, fontWeight: 600, color: muted, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#5B5FE8'; e.currentTarget.style.color = '#5B5FE8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted; }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: `1px solid ${border}` }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 700 : 500,
                color: isActive ? '#5B5FE8' : muted,
                borderBottom: `2.5px solid ${isActive ? '#5B5FE8' : 'transparent'}`,
                marginBottom: -1,
                transition: 'all 0.15s',
                fontFamily: 'Inter, sans-serif',
                borderRadius: '6px 6px 0 0',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = tabHover; e.currentTarget.style.color = text; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = muted; } }}
            >
              {tab}
              {tab !== 'Folders' && (
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 700,
                  background: isActive ? (isDark ? 'rgba(91,95,232,0.2)' : '#EEF2FF') : (isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'),
                  color: isActive ? '#5B5FE8' : muted,
                  padding: '1px 6px', borderRadius: 99,
                }}>
                  {tab === 'All' ? videos.length : tab === 'Videos' ? videos.filter(v => v.media_type !== 'carousel').length : videos.filter(v => v.media_type === 'carousel').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Media Grid ── */}
      {videos.length === 0 ? (
        /* Full empty state if NO videos at all */
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: 70, height: 70, borderRadius: 20, background: isDark ? 'rgba(91,95,232,0.12)' : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="34" height="34" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
              <rect x="2" y="6" width="15" height="12" rx="2"/><path d="M22 8l-5 4 5 4V8z"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: text, marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>No videos yet</h3>
          <p style={{ fontSize: 14, color: muted, marginBottom: 20, fontFamily: 'Inter, sans-serif', maxWidth: 300, margin: '0 auto 20px' }}>
            Upload your first video and start managing your media library.
          </p>
          <button onClick={onUpload} style={{
            padding: '10px 22px', background: '#5B5FE8', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 14px rgba(91,95,232,0.35)',
          }}>Upload Media</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {/* Empty card always shown as first slot */}
          <EmptyCard isDark={isDark} onUpload={onUpload} />

          {/* Actual media cards */}
          {filtered.map((item, i) => (
            <DashMediaCard
              key={item.id}
              item={item}
              isDark={isDark}
              onCopy={onCopy}
              onDelete={onDelete}
              index={i}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && videos.length > 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: muted, fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
          No results for <strong>"{searchQuery || activeTab}"</strong>
        </div>
      )}
    </div>
  );
}
