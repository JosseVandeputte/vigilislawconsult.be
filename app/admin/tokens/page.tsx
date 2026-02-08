'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/header';
import Footer from '../../components/footer';
import styles from '../admin.module.css';
import { useAdminToken, useRequireAdmin } from '../admin-utils';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('nl-BE');
};

type Token = {
  id: string;
  name: string;
  value: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export default function AdminTokensPage() {
  const { adminToken, ready } = useAdminToken();
  useRequireAdmin();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokenExpiresAt, setTokenExpiresAt] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    if (!adminToken) return;
    const response = await fetch('/api/admin/tokens', {
      headers: { 'x-admin-token': adminToken }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan tokens niet laden.');
      return;
    }

    const data = await response.json();
    setTokens(data.tokens ?? []);
  }, [adminToken]);

  useEffect(() => {
    if (!ready || !adminToken) return;
    fetchTokens();
  }, [ready, adminToken, fetchTokens]);

  const createToken = async () => {
    if (!tokenName.trim()) {
      setError('Geef een naam op voor deze token.');
      return;
    }

    setMessage(null);
    setError(null);
    const payload = {
      name: tokenName.trim(),
      expiresAt: tokenExpiresAt ? new Date(tokenExpiresAt).toISOString() : undefined
    };
    const response = await fetch('/api/admin/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan token niet aanmaken.');
      return;
    }

    setMessage('Token aangemaakt.');
    setTokenExpiresAt('');
    setTokenName('');
    fetchTokens();
  };

  const deleteToken = async (id: string) => {
    setMessage(null);
    setError(null);
    const response = await fetch(`/api/admin/tokens/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan token niet verwijderen.');
      return;
    }

    setMessage('Token verwijderd.');
    fetchTokens();
  };

  return (
    <div>
      <Header />
      <section className={styles.admin}>
        <h2>Tokens beheren</h2>

        <div className={styles.adminNav}>
          <Link href="/admin/calendar">Kalender</Link>
          <Link href="/admin/reservations">Reservaties</Link>
          <Link href="/admin/tokens">Tokens</Link>
          <Link href="/admin/blocked-slots">Blocked slots</Link>
          <Link href="/admin/audit">Audit log</Link>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.card}>
          <h3>Nieuwe token</h3>
          <div className={styles.tokenActions}>
            <input
              type="text"
              placeholder="Naam (bv. Klant A)"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
            />
            <input
              type="datetime-local"
              value={tokenExpiresAt}
              onChange={(e) => setTokenExpiresAt(e.target.value)}
            />
            <button type="button" onClick={createToken}>Nieuwe token</button>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Tokens</h3>
          <div className={styles.list}>
            {tokens.length === 0 && <p>Geen tokens gevonden.</p>}
            {tokens.map((token) => (
              <div key={token.id} className={styles.listItem}>
                <div>
                  <strong>{token.name}</strong>
                  <div>Token: {token.value}</div>
                  <div>Vervalt: {token.expiresAt ? formatDate(token.expiresAt) : 'Nooit'}</div>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.dangerButton} onClick={() => deleteToken(token.id)}>
                    Verwijder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
