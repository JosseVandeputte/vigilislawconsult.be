'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { useRequireAdmin } from '../admin-utils';
import { apiUrl } from '@/lib/api-url';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('nl-BE');
};

type Token = {
  id: string;
  name: string;
  email: string;
  value: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export default function AdminTokensPage() {
  const { isLoggedIn, ready } = useRequireAdmin();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokenExpiresAt, setTokenExpiresAt] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenEmail, setTokenEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await fetch(apiUrl('/api/admin/tokens'), {
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Kan tokens niet laden.');
        return;
      }

      console.log(response);

      const data = await response.json();
      setTokens(Array.isArray(data) ? data : (data.tokens ?? []));
    } catch {
      setError('Netwerkfout. Kan tokens niet laden.');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!ready || !isLoggedIn) return;
    fetchTokens();
  }, [ready, isLoggedIn, fetchTokens]);

  const createToken = async () => {
    if (!tokenName.trim()) {
      setError('Geef een naam op voor deze token.');
      return;
    }
    if (!tokenEmail.trim()) {
      setError('Geef een e-mailadres op voor deze token.');
      return;
    }

    setMessage(null);
    setError(null);
    const payload = {
      name: tokenName.trim(),
      email: tokenEmail.trim(),
      expiresAt: tokenExpiresAt ? new Date(tokenExpiresAt).toISOString() : undefined
    };
    try {
      const response = await fetch(apiUrl('/api/admin/tokens'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      setTokenEmail('');
      fetchTokens();
    } catch {
      setError('Netwerkfout. Kan token niet aanmaken.');
    }
  };

  const deleteToken = async (id: string) => {
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(apiUrl(`/api/admin/tokens/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Kan token niet verwijderen.');
        return;
      }

      setMessage('Token verwijderd.');
      fetchTokens();
    } catch {
      setError('Netwerkfout. Kan token niet verwijderen.');
    }
  };

  return (
    <section className={styles.admin}>
        <h2>Tokens</h2>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.card}>
          <h3>Nieuwe token</h3>
          <div className={styles.tokenActions}>
            <div className={styles.formField}>
              <label htmlFor="token-name" className={styles.formLabel}>Naam van de token</label>
              <input
                id="token-name"
                type="text"
                placeholder="Bijv. Klant A"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="token-email" className={styles.formLabel}>E-mailadres van de klant</label>
              <input
                id="token-email"
                type="email"
                placeholder="klant@email.com"
                value={tokenEmail}
                onChange={(e) => setTokenEmail(e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="token-expires-at" className={styles.formLabel}>Vervaldatum (optioneel)</label>
              <input
                id="token-expires-at"
                type="datetime-local"
                value={tokenExpiresAt}
                onChange={(e) => setTokenExpiresAt(e.target.value)}
              />
            </div>
            <button type="button" onClick={createToken}>Nieuwe token</button>
          </div>
          <p className={styles.formHint}>Laat datum leeg als de token niet automatisch mag vervallen.</p>
        </div>

        <div className={styles.card}>
          <h3>Tokens</h3>
          <div className={styles.list}>
            {tokens.length === 0 && <p>Geen tokens gevonden.</p>}
            {tokens.map((token) => (
              <div key={token.id} className={styles.listItem}>
                <div>
                  <strong>{token.name}</strong>
                  <div>E-mail: {token.email}</div>
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
  );
}
