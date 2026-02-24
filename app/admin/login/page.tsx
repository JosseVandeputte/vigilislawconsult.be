'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';
import { useAdminToken } from '../admin-utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminToken } = useAdminToken();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token.trim()) {
      setError('Vul een admin token in.');
      return;
    }
    setAdminToken(token.trim());
    router.push('/admin/calendar');
  };

  return (
    <section className={styles.adminLogin}>
      <div className={styles.loginCard}>
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
          <button type="submit">Inloggen</button>
        </form>
      </div>
    </section>
  );
}
