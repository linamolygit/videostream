import Link from 'next/link';

export default function Terms() {
  return (
    <main className="studio-layout">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
        <h1 style={{ marginBottom: '20px' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: '1.6' }}>
          <section>
            <h3>1. Agreement to Terms</h3>
            <p>By accessing or using ThumbCraft Studio, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our service.</p>
          </section>
          <section>
            <h3>2. Intellectual Property</h3>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of ThumbCraft Studio and its licensors.</p>
          </section>
          <section>
            <h3>3. User Accounts</h3>
            <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
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
