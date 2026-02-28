'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';
import { apiUrl } from '@/lib/api-url';

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token.trim()) {
      setError('Vul een admin token in.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: token.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Ongeldige token.');
        return;
      }

      router.push('/admin/calendar');
    } catch {
      setError('Netwerkfout. Probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.adminLogin}>
      <div className={styles.loginCard}>
        <div className={styles.loginBrand}>
          <Image src="/Vigilis-Law-Consult_Logo.png" alt="Vigilis Law Consult" width={56} height={56} />
          <span>Vigilis Law Consult</span>
        </div>
        <h2>Admin login</h2>
        <p>Log in met je admin token om verder te gaan.</p>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Bezig...' : 'Inloggen'}
          </button>
        </form>
      </div>
    </section>
  );
}

