import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const copyToClipboard = () => {
    if (user && user.api_token) {
      navigator.clipboard.writeText(user.api_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading Profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <Head>
        <title>My Profile | Media Hoster</title>
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Account Profile</h1>
        <button onClick={handleLogout} className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'rgba(255,59,48,0.3)' }}>
          Logout
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '36px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '24px', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800' }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{user.username}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{user.email}</p>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Your Secure API Key</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            This is your private multi-tenant API token for authenticating direct requests.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--input-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <code style={{ fontSize: '13px', color: 'var(--primary)', flex: 1, wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {user.api_token ? (showToken ? user.api_token : '•'.repeat(user.api_token.length || 32)) : "No token generated."}
            </code>
            
            <button
              onClick={() => setShowToken(!showToken)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              title={showToken ? "Hide Token" : "Show Token"}
            >
              {showToken ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>

            <button 
              onClick={copyToClipboard}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              {copied ? 'Copied!' : 'Copy Key'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="glass-panel" style={{ padding: '24px', height: '100%', cursor: 'pointer' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>📊</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Dashboard</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>Manage your workspace items and generate new streaming links.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
