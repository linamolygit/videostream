import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      showToast('If your email is registered, a code has been sent.');
      setStep(2);
    } else {
      showToast(data.message || 'Failed to request code.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      showToast('Password reset successfully! Please log in.');
      router.push('/login');
    } else {
      showToast(data.message || 'Failed to reset password.');
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
          <h2>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
            {step === 1 ? 'Enter your email to receive a 4-digit code.' : 'Enter your code and new password.'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="control-row" style={{ marginBottom: 0 }}>
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your registered email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="control-row" style={{ marginBottom: 0 }}>
              <label>4-Digit Code</label>
              <input 
                type="text" 
                placeholder="e.g. 1234" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={4}
                required
                style={{ letterSpacing: '5px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
              />
            </div>

            <div className="control-row" style={{ marginBottom: 0 }}>
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="Enter new strong password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength="6"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '10px' }}>
          Remember your password? <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
