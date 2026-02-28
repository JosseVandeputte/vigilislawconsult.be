'use client';

import Footer from '../../components/footer';
import Header from '../../components/header';
import styles from '../reservatie.module.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiUrl } from '@/lib/api-url';

export default function ReservatiLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setStatus('loading');

        const response = await fetch(apiUrl('/api/reservations/validate'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: email.trim(), token: token.trim() })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            setError(data?.error ?? 'Ongeldig e-mailadres of token.');
            setStatus('idle');
            return;
        }

        router.push('/reservatie');
    };

    return (
        <div>
            <Header />
            <section className={styles.reservatie}>
                <h2>Reservatie</h2>
                <div className={styles.gateContainer}>
                    <h3>Toegang tot reservatie</h3>
                    <p>Vul uw e-mailadres en toegangscode in om de reservatiepagina te openen.</p>
                    <form onSubmit={handleSubmit} className={styles.gateForm}>
                        <label htmlFor="gate-email">E-mailadres</label>
                        <input
                            id="gate-email"
                            type="email"
                            placeholder="example@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                        <label htmlFor="gate-token">Toegangscode</label>
                        <input
                            id="gate-token"
                            type="text"
                            placeholder="Uw persoonlijke toegangscode"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            required
                            autoComplete="off"
                        />
                        {error && <p className={styles.gateError}>{error}</p>}
                        <button
                            type="submit"
                            className={styles.gateButton}
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Bezig...' : 'Toegang'}
                        </button>
                    </form>
                </div>
            </section>
            <Footer />
        </div>
    );
}
