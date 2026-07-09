import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tool');
  const [apiToken, setApiToken] = useState('guest_public_token');

  // Form State
  const [title, setTitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [sourceType, setSourceType] = useState('r2');
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setApiToken(data.user.api_token || `token_${data.user.id}_${data.user.username}`);
          }
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneratedVideo(null);

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          source_type: sourceType,
          api_token: apiToken
        })
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedVideo(data.video);
        setTitle('');
        setThumbnailUrl('');
        setVideoUrl('');
      } else {
        alert(data.error || 'Failed to generate link');
      }
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loader-spinner" style={{ display: 'block', borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | Media Hoster</title>
      </Head>
      <main className="studio-layout" style={{ margin: '40px auto', maxWidth: '1400px' }}>
        
        {/* Left Sidebar */}
        <aside className="sidebar glass-panel">
          <div className="section-title">Navigation</div>
          
          <div className="control-row">
            <button 
              className={activeTab === 'tool' ? 'btn-primary' : 'btn-secondary'} 
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={() => setActiveTab('tool')}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Media Sync Tool
            </button>
          </div>
          
          <div className="control-row">
            <button 
              className={activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'} 
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={() => setActiveTab('analytics')}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Analytics (Pro)
            </button>
          </div>
        </aside>

        {/* Center Workspace */}
        <section className="workspace">
          {activeTab === 'tool' && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Media Sync Gateway</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                Host, Cloak, and Stream your videos securely.
              </p>
              
              <div className="glass-panel" style={{ display: 'inline-block', textAlign: 'left', minWidth: '450px' }}>
                <div className="section-title">Cloak New Video</div>
                <form onSubmit={handleGenerate}>
                  <div className="control-row">
                    <label>Video Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. My Awesome Video" style={{ marginTop: '5px', width: '100%' }} />
                  </div>
                  <div className="control-row">
                    <label>Video Source URL</label>
                    <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required placeholder="https://qu.ax/... or R2 link" style={{ marginTop: '5px', width: '100%' }} />
                  </div>
                  <div className="control-row">
                    <label>Thumbnail Image URL</label>
                    <input type="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} required placeholder="https://cloudflare-r2.../thumb.jpg" style={{ marginTop: '5px', width: '100%' }} />
                  </div>
                  <div className="control-row" style={{ display: 'flex', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input type="radio" name="sourceType" value="r2" checked={sourceType === 'r2'} onChange={(e) => setSourceType(e.target.value)} />
                      Direct Stream (R2 / CDN)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input type="radio" name="sourceType" value="iframe" checked={sourceType === 'iframe'} onChange={(e) => setSourceType(e.target.value)} />
                      Iframe Embed (qu.ax)
                    </label>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>
                    {isSubmitting ? 'Generating...' : 'Generate Secure Link'}
                  </button>
                </form>

                {generatedVideo && (
                  <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(52, 199, 89, 0.1)', border: '1px solid var(--success)', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--success)', marginTop: 0 }}>Success! Video Cloaked</h4>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>Your Video ID for the WordPress Plugin is:</p>
                    <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '2px' }}>
                      {generatedVideo.video_uuid}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div style={{ textAlign: 'center' }}>
              {!user ? (
                <div>
                  <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Pro Analytics</h1>
                  <p style={{ color: 'var(--text-muted)' }}>You must be a registered member to view video analytics.</p>
                  <Link href="/login">
                    <button className="btn-primary" style={{ marginTop: '20px' }}>Login to Access</button>
                  </Link>
                </div>
              ) : (
                <>
                  <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Analytics Dashboard</h1>
                  <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.username}. Here are your stats.</p>
                  
                  <div className="glass-panel" style={{ marginTop: '40px', display: 'inline-block', textAlign: 'left', minWidth: '300px' }}>
                    <div className="section-title">Your Profile</div>
                    <div className="control-row">
                      <label>User ID <span className="val">#{user.id}</span></label>
                    </div>
                    <div className="control-row">
                      <label>Email <span className="val">{user.email}</span></label>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="sidebar glass-panel">
          <div className="section-title">Account</div>
          {user ? (
            <>
              <div className="control-row" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{user.username}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pro Member</div>
                  </div>
                </div>
              </div>
              <div className="section-title">API Access</div>
              <div className="control-row" style={{ marginBottom: '20px' }}>
                 <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Your API Token:</p>
                 <input type="password" value={apiToken} readOnly style={{ fontSize: '12px', letterSpacing: '2px', background: 'rgba(0,0,0,0.05)', width: '100%', padding: '8px' }} />
                 <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>Paste this in your WordPress plugin.</p>
              </div>
              <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="control-row" style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>You are currently using Guest Mode.</p>
              </div>
              <div className="section-title">API Access</div>
              <div className="control-row" style={{ marginBottom: '20px' }}>
                 <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Public Guest Token:</p>
                 <input type="text" value={apiToken} readOnly style={{ fontSize: '12px', background: 'rgba(0,0,0,0.05)', width: '100%', padding: '8px' }} />
                 <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>Use this to test the WP plugin.</p>
              </div>
              <Link href="/signup">
                <button className="btn-primary" style={{ width: '100%' }}>Create Account</button>
              </Link>
            </>
          )}
        </aside>

      </main>
    </>
  );
}
