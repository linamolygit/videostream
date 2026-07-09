import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="studio-layout">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
        <h1 style={{ marginBottom: '20px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.6' }}>
          <section>
            <h3>1. Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
          </section>
          <section>
            <h3>2. How We Use Information</h3>
            <p>We may use the information we collect to provide, maintain, and improve our services, as well as to communicate with you, provide security, and prevent fraud.</p>
          </section>
          <section>
            <h3>3. Data Security</h3>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. Passwords are securely hashed, and session tokens are stored in HttpOnly cookies.</p>
          </section>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <Link href="/">
            <button className="btn-primary">Return Home</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
