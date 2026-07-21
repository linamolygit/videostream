import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState('video'); // 'video' | 'carousel'

  // Form State
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [carouselUrls, setCarouselUrls] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Generated Link Output Modal
  const [generatedLink, setGeneratedLink] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          fetchUserMedia();
        } else {
          setUser(null);
          setLoading(false);
        }
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const fetchUserMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (e) {
      console.error("Failed to load user media library", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMedia = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please enter a title');
      return;
    }

    if (uploadTab === 'video') {
      if (!thumbnailUrl.trim()) {
        showToast('⚠️ Mandatory thumbnail image is required for videos!');
        return;
      }
      if (!videoUrl.trim()) {
        showToast('Please enter a video source URL or upload a file.');
        return;
      }
    } else if (uploadTab === 'carousel') {
      const imgs = carouselUrls.split('\n').map(s => s.trim()).filter(Boolean);
      if (imgs.length === 0) {
        showToast('Please provide at least one image URL for the carousel set.');
        return;
      }
    }

    setUploading(true);
    setUploadProgress(40);

    try {
      const payload = {
        title,
        media_type: uploadTab,
        thumbnail_path: uploadTab === 'video' ? thumbnailUrl : (thumbnailUrl || null),
        original_source_url: uploadTab === 'video' ? videoUrl : null,
        carousel_images: uploadTab === 'carousel' ? carouselUrls : null
      };

      setUploadProgress(70);

      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setUploadProgress(100);

      if (data.success) {
        setVideos([data.video, ...videos]);
        setShowUploadModal(false);
        setTitle('');
        setVideoUrl('');
        setThumbnailUrl('');
        setCarouselUrls('');

        // Generate Stream Link Output
        const host = window.location.origin;
        const link = `${host}/api/media?uuid=${data.video.video_uuid}`;
        setGeneratedLink(link);
        setShowLinkModal(true);

        showToast('Media created successfully!');
      } else {
        showToast(data.error || 'Failed to create media link');
      }
    } catch (err) {
      showToast('Server error while saving media');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this media link?')) return;
    try {
      const res = await fetch('/api/videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setVideos(videos.filter(v => v.id !== id));
        showToast('Media deleted');
      } else {
        showToast(data.error || 'Failed to delete');
      }
    } catch (e) {
      showToast('Error deleting item');
    }
  };

  const copyLink = (uuid) => {
    const host = window.location.origin;
    const link = `${host}/api/media?uuid=${uuid}`;
    navigator.clipboard.writeText(link);
    showToast('Copied Stream Link to clipboard!');
  };

  const showToast = (msg) => {
    const t = document.getElementById('globalToast');
    if (t) {
      t.innerText = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.video_uuid.includes(searchQuery);
    const matchesType = filterType === 'all' || (filterType === 'video' && v.media_type !== 'carousel') || (filterType === 'carousel' && v.media_type === 'carousel');
    return matchesSearch && matchesType;
  });

  const videoCount = videos.filter(v => v.media_type !== 'carousel').length;
  const carouselCount = videos.filter(v => v.media_type === 'carousel').length;

  return (
    <div className="min-h-screen">
      <Head>
        <title>{user ? 'Dashboard | Media Hoster' : 'Media Hoster — Decoupled VOD & Carousel SaaS'}</title>
      </Head>

      {/* ============================================================ */}
      {/* GUEST LANDING PAGE (LOGGED OUT)                              */}
      {/* ============================================================ */}
      {!user && !loading && (
        <div style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ background: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Open-Source VOD SaaS
            </span>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginTop: '20px', lineHeight: '1.15' }}>
              Decoupled Media Streaming & Ghost Players for WordPress
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '700px', margin: '20px auto', lineHeight: '1.6' }}>
              Upload your videos and image carousels securely. Generate opaque streaming links to consume in your zero-config WordPress plugin — with 100% PHP server-side bot protection.
            </p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
              <Link href="/signup">
                <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>Create Free Account →</button>
              </Link>
              <Link href="/login">
                <button className="btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>Sign In</button>
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', margin: '60px 0' }}>
            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>🔒</div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Decoupled Security</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                No API keys stored in WordPress. Tokens are AES-256 encrypted with HMAC-SHA256 signatures, streamed via Cloudflare Workers.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>🤖</div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>PHP Bot Shielding</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Search engines and AdX reviewers receive 100% clean article text with zero media player markup in raw page responses.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>🖼️</div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Videos & Carousels</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Upload videos with mandatory thumbnails or batch multi-image carousel galleries. Generate a single link for your post.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* LOGGED-IN MULTI-TENANT DASHBOARD                             */}
      {/* ============================================================ */}
      {user && (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          
          {/* Header & Upload Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Workspace Dashboard</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                Welcome back, <strong>{user.username}</strong>! Manage your isolated media links.
              </p>
            </div>

            <button onClick={() => setShowUploadModal(true)} className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Upload & Generate Link
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Videos</div>
              <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px', color: 'var(--primary)' }}>{videoCount}</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Image Carousels</div>
              <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px', color: '#8b5cf6' }}>{carouselCount}</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Stream Links</div>
              <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px', color: 'var(--success)' }}>{videos.length}</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tenant Status</div>
              <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '12px', color: 'var(--success)' }}>● Workspace Active</div>
            </div>
          </div>

          {/* Media Library Container */}
          <div id="library" className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Your Media Library</h2>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Search media..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '220px', padding: '8px 14px', fontSize: '13px' }}
                />

                <select 
                  value={filterType} 
                  onChange={e => setFilterType(e.target.value)}
                  style={{ width: '140px', padding: '8px 14px', fontSize: '13px' }}
                >
                  <option value="all">All Media</option>
                  <option value="video">Videos Only</option>
                  <option value="carousel">Carousels Only</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading media items...</p>
            ) : filteredVideos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(0,0,0,0.02)', borderRadius: '16px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No media links found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                  Upload a video with a mandatory thumbnail or create an image set to generate your first streaming link.
                </p>
                <button onClick={() => setShowUploadModal(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                  Upload First Media Item
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filteredVideos.map(item => (
                  <div key={item.id} style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Thumbnail Preview */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#1e293b' }}>
                      {item.thumbnail_path ? (
                        <img src={item.thumbnail_path} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '24px' }}>🖼️</div>
                      )}

                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: item.media_type === 'carousel' ? '#8b5cf6' : 'var(--primary)',
                        color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px'
                      }}>
                        {item.media_type === 'carousel' ? 'CAROUSEL' : 'VIDEO'}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          UUID: <code style="background:rgba(0,113,227,0.1);color:var(--primary);padding:2px 6px;border-radius:4px;">{item.video_uuid.substring(0, 12)}...</code>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button 
                          onClick={() => copyLink(item.video_uuid)} 
                          className="btn-primary" 
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                        >
                          📋 Copy Link
                        </button>

                        <button 
                          onClick={() => handleDelete(item.id)} 
                          style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* UPLOAD & STREAM LINK GENERATOR MODAL                         */}
      {/* ============================================================ */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-main)', border: '1px solid var(--glass-border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Upload & Generate Stream Link</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              <button 
                onClick={() => setUploadTab('video')} 
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                  background: uploadTab === 'video' ? 'var(--primary)' : 'transparent',
                  color: uploadTab === 'video' ? '#fff' : 'var(--text-main)'
                }}
              >
                🎬 Video (Mandatory Thumb)
              </button>

              <button 
                onClick={() => setUploadTab('carousel')} 
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                  background: uploadTab === 'carousel' ? '#8b5cf6' : 'transparent',
                  color: uploadTab === 'carousel' ? '#fff' : 'var(--text-main)'
                }}
              >
                🖼️ Image Carousel Set
              </button>
            </div>

            <form onSubmit={handleCreateMedia} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="control-row" style={{ marginBottom: 0 }}>
                <label>Media Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g., Nature Documentary HD" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>

              {uploadTab === 'video' && (
                <>
                  <div className="control-row" style={{ marginBottom: 0 }}>
                    <label>
                      <span>Mandatory Thumbnail Image URL *</span>
                      <span style={{ color: 'var(--danger)', fontSize: '11px' }}>(Required)</span>
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://pub-r2-domain.dev/thumb.jpg" 
                      value={thumbnailUrl} 
                      onChange={e => setThumbnailUrl(e.target.value)} 
                      required 
                    />
                    <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thumbnail is rendered first as ghost image before user plays video.</small>
                  </div>

                  <div className="control-row" style={{ marginBottom: 0 }}>
                    <label>Original Video Source URL *</label>
                    <input 
                      type="url" 
                      placeholder="https://pub-r2-domain.dev/video.mp4" 
                      value={videoUrl} 
                      onChange={e => setVideoUrl(e.target.value)} 
                      required 
                    />
                  </div>
                </>
              )}

              {uploadTab === 'carousel' && (
                <div className="control-row" style={{ marginBottom: 0 }}>
                  <label>Batch Image URLs (One URL per line) *</label>
                  <textarea 
                    rows="5" 
                    placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg&#10;https://example.com/img3.jpg" 
                    value={carouselUrls} 
                    onChange={e => setCarouselUrls(e.target.value)} 
                    required 
                  />
                  <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Upload batch of images to be displayed as a touch carousel slider in posts.</small>
                </div>
              )}

              {uploading && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Processing & encrypting link...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--track-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--primary)', width: `${uploadProgress}%`, transition: 'width 0.3s' }}></div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={uploading}>
                  {uploading ? 'Generating...' : '✨ Generate Stream Link'}
                </button>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* GENERATED STREAM LINK OUTPUT MODAL                           */}
      {/* ============================================================ */}
      {showLinkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', background: 'var(--bg-main)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '44px', marginBottom: '10px' }}>🎉</div>
              <h3 style={{ fontSize: '22px', fontWeight: '800' }}>Your Stream Link is Ready!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                Copy the secure link below and paste it into your <strong>WordPress Plugin Dashboard</strong>.
              </p>
            </div>

            <div style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
              <code style={{ fontSize: '13px', color: 'var(--primary)', wordBreak: 'break-all', display: 'block', marginBottom: '10px' }}>
                {generatedLink}
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  showToast('Stream link copied to clipboard!');
                }}
                className="btn-primary" 
                style={{ width: '100%', padding: '10px', fontSize: '14px' }}
              >
                📋 Copy Stream Link
              </button>
            </div>

            <div style={{ background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.3)', borderRadius: '10px', padding: '12px', fontSize: '12px', color: 'var(--text-main)', marginBottom: '20px' }}>
              <strong>💡 How to use:</strong> Open WordPress Admin → <strong>Media Links → Manage Links</strong> → Select post, paste this link, and save!
            </div>

            <button onClick={() => setShowLinkModal(false)} className="btn-secondary" style={{ width: '100%' }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
