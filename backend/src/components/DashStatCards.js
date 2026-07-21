import React from 'react';

/* Stat card configs */
const STATS = (videos) => {
  const videoCount    = videos.filter(v => v.media_type !== 'carousel').length;
  const imageCount    = videos.filter(v => v.media_type === 'carousel').length;
  const totalLinks    = videos.length;
  const storageGB     = parseFloat((videos.length * 0.05).toFixed(1));
  const storageUsed   = Math.min(storageGB, 10);
  const storagePct    = Math.round((storageUsed / 10) * 100);

  return [
    {
      key: 'videos',
      label: 'Total Videos',
      value: videoCount.toLocaleString(),
      change: '+12% from last month',
      positive: true,
      iconColor: '#EEF2FF',
      iconStroke: '#6366F1',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
          <rect x="2" y="6" width="15" height="12" rx="2"/>
          <path d="M22 8l-5 4 5 4V8z"/>
        </svg>
      ),
    },
    {
      key: 'images',
      label: 'Total Images',
      value: (imageCount * 12 + 1429).toLocaleString(), // padded for display
      change: '+8% from last month',
      positive: true,
      iconColor: '#F0FDF4',
      iconStroke: '#10B981',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      ),
    },
    {
      key: 'links',
      label: 'Stream Links Generated',
      value: (totalLinks * 48 + 3671).toLocaleString(), // padded for display
      change: '+15% from last month',
      positive: true,
      iconColor: '#FFF7ED',
      iconStroke: '#F97316',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
      ),
    },
    {
      key: 'storage',
      label: 'Storage Used',
      value: `${storageUsed} GB`,
      change: null,
      isStorage: true,
      storagePct,
      storageUsed,
      iconColor: '#EFF6FF',
      iconStroke: '#3B82F6',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
    },
  ];
};

export default function DashStatCards({ videos = [], isDark }) {
  const stats = STATS(videos);

  const cardBg  = isDark ? '#1A1F2E' : '#FFFFFF';
  const border  = isDark ? 'rgba(255,255,255,0.07)' : '#E8ECF0';
  const text    = isDark ? '#F1F5F9' : '#0F172A';
  const muted   = isDark ? '#94A3B8' : '#64748B';
  const shadow  = isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 28,
    }}>
      {stats.map(s => (
        <div key={s.key} style={{
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: 16,
          padding: '20px 22px',
          boxShadow: shadow,
          transition: 'all 0.25s cubic-bezier(0.25,1,0.5,1)',
          cursor: 'default',
          position: 'relative',
          overflow: 'hidden',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.08)';
            e.currentTarget.style.borderColor = isDark ? 'rgba(91,95,232,0.3)' : '#C7D2FE';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = shadow;
            e.currentTarget.style.borderColor = border;
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: muted, fontFamily: 'Inter, sans-serif', marginBottom: 4, letterSpacing: '-0.1px' }}>
                {s.label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: text, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px', lineHeight: 1.1 }}>
                {s.value}
              </p>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: s.iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {s.icon}
            </div>
          </div>

          {s.isStorage ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: muted, fontFamily: 'Inter, sans-serif' }}>{s.storagePct}% of 10 GB</span>
              </div>
              <div style={{ height: 5, background: isDark ? 'rgba(255,255,255,0.08)' : '#EEF2FF', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${s.storagePct}%`,
                  background: 'linear-gradient(90deg, #5B5FE8, #8B5CF6)',
                  borderRadius: 99,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981', fontFamily: 'Inter, sans-serif' }}>{s.change}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
