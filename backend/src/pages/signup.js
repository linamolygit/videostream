import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast('You must agree to the Terms of Service.');
      return;
    }
    
    setLoading(true);

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    
    if (res.ok) {
      showToast('Account created! Please log in.');
      router.push('/login');
    } else {
      showToast(data.message || 'Signup failed.');
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    const t = document.getElementById('globalToast');
    if (t) {
      t.innerText = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    }
  };

  return (
    <div className="auth-layout">
      <div className="glass-panel auth-panel">
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h2>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
            Join ThumbCraft Studio today.
          </p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="control-row" style={{ marginBottom: 0 }}>
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Choose a username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="control-row" style={{ marginBottom: 0 }}>
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="control-row" style={{ marginBottom: 0 }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Create a strong password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingRight: '40px' }}
                required
                minLength="6"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <div className="control-row" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '10px', marginBottom: 0, marginTop: '5px' }}>
            <input 
              type="checkbox" 
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }}
              required
            />
            <label htmlFor="agreeTerms" style={{ cursor: 'pointer', fontWeight: 'normal', fontSize: '13px', lineHeight: '1.4' }}>
              I agree to the <Link href="/terms" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Privacy Policy</Link>.
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '10px' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
