import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (e) {}
    };
    checkAuth();
  }, []);

  return (
    <>
      <Head>
        <title>Media Hoster | Enterprise Video Sync</title>
      </Head>

      <main style={{ paddingBottom: '100px' }}>
        
        {/* Hero Section */}
        <section style={{ 
          padding: '120px 20px', 
          textAlign: 'center', 
          maxWidth: '800px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            background: 'var(--glass-bg)',
            padding: '8px 16px',
            borderRadius: '30px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--primary)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
            marginBottom: '10px'
          }}>
            🎉 Version 5.0 is now live
          </div>
          
          <h1 style={{ fontSize: '56px', lineHeight: '1.1', fontWeight: '800', letterSpacing: '-1px' }}>
            Enterprise Video Routing <br />
            <span style={{ color: 'var(--primary)' }}>for Modern Web.</span>
          </h1>
          
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '600px' }}>
            Securely cloak your media links, route traffic at the edge, and seamlessly integrate with your WordPress sites using our Ghost Player technology.
          </p>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            {user ? (
              <Link href="/dashboard">
                <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '16px' }}>Go to Dashboard</button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '16px' }}>Get Started for Free</button>
                </Link>
                <Link href="#features">
                  <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: '16px' }}>Explore Features</button>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '15px' }}>Why Choose Media Hoster?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Powerful features packed in a beautiful Apple Glass interface.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ background: 'var(--primary)', width: '60px', height: '60px', borderRadius: '15px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 style={{ marginBottom: '10px' }}>Lightning Fast</h3>
              <p style={{ color: 'var(--text-muted)' }}>Deployed on Vercel Edge Network for global sub-millisecond response times.</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ background: 'var(--accent)', width: '60px', height: '60px', borderRadius: '15px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h3 style={{ marginBottom: '10px' }}>Secure Link Cloaking</h3>
              <p style={{ color: 'var(--text-muted)' }}>Hide your original video sources behind secure, expirable tokens.</p>
            </div>

            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ background: 'var(--success)', width: '60px', height: '60px', borderRadius: '15px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              </div>
              <h3 style={{ marginBottom: '10px' }}>WordPress Ready</h3>
              <p style={{ color: 'var(--text-muted)' }}>Plug and play with our dedicated WordPress plugin for instant sync.</p>
            </div>
          </div>
        </section>
        
      </main>
    </>
  );
}
