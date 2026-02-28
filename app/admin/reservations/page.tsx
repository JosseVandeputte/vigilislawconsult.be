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

const statusLabels: Record<string, string> = {
  PENDING: 'In afwachting',
  ACCEPTED: 'Goedgekeurd',
  REJECTED: 'Geweigerd',
  CANCELED: 'Geannuleerd'
};

type Reservation = {
  id: string;
  name: string;
  email: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
};

export default function AdminReservationsPage() {
  const { isLoggedIn, ready } = useRequireAdmin();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | Reservation['status']>('PENDING');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl('/api/admin/reservations'), {
        credentials: 'include'
      });
      setLoading(false);

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Kan reservaties niet laden.');
        return;
      }

      const data = await response.json();
      setReservations(data.reservations ?? []);
    } catch {
      setLoading(false);
      setError('Netwerkfout. Kan reservaties niet laden.');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!ready || !isLoggedIn) return;
    fetchReservations();
  }, [ready, isLoggedIn, fetchReservations]);

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    setMessage(null);
    setError(null);
    setUpdatingId(id);
    try {
      const response = await fetch(apiUrl(`/api/admin/reservations/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Kan status niet bijwerken.');
        return;
      }

      setMessage('Reservatie geüpdatet.');
      await fetchReservations();
    } catch {
      setError('Netwerkfout. Kan status niet bijwerken.');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteReservation = async (id: string) => {
    setMessage(null);
    setError(null);
    setUpdatingId(id);
    try {
      const response = await fetch(apiUrl(`/api/admin/reservations/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Kan reservatie niet verwijderen.');
        return;
      }

      setMessage('Reservatie verwijderd.');
      await fetchReservations();
    } catch {
      setError('Netwerkfout. Kan reservatie niet verwijderen.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className={styles.admin}>
        <h2>Reservaties</h2>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Reservaties</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | Reservation['status'])}
            >
              <option value="PENDING">In afwachting</option>
              <option value="ACCEPTED">Goedgekeurd</option>
              <option value="REJECTED">Geweigerd</option>
              <option value="CANCELED">Geannuleerd</option>
              <option value="ALL">Alle</option>
            </select>
          </div>

          {loading ? (
            <p>Bezig met laden...</p>
          ) : (
            <div className={styles.list}>
              {reservations.filter(r => statusFilter === 'ALL' || r.status === statusFilter).length === 0 && <p>Geen reservaties gevonden.</p>}
              {reservations
                .filter(r => statusFilter === 'ALL' || r.status === statusFilter)
                .map((reservation) => (
                <div key={reservation.id} className={`${styles.listItem}${updatingId === reservation.id ? ` ${styles.updating}` : ''}`}>
                  <div>
                    <strong>{reservation.name}</strong> ({reservation.email})
                    <div>
                      {formatDate(reservation.date)} • {reservation.startTime} - {reservation.endTime}
                    </div>
                    <p>{reservation.description}</p>
                  </div>
                  <div className={styles.actions}>
                    <span className={styles.status}>{statusLabels[reservation.status] ?? reservation.status}</span>
                    <button type="button" disabled={updatingId === reservation.id} onClick={() => updateReservationStatus(reservation.id, 'ACCEPTED')}>Accepteer</button>
                    <button type="button" disabled={updatingId === reservation.id} onClick={() => updateReservationStatus(reservation.id, 'REJECTED')}>Weiger</button>
                    <button type="button" disabled={updatingId === reservation.id} onClick={() => updateReservationStatus(reservation.id, 'CANCELED')}>Annuleer</button>
                    <button type="button" className={styles.dangerButton} disabled={updatingId === reservation.id} onClick={() => deleteReservation(reservation.id)}>{updatingId === reservation.id ? 'Bezig...' : 'Verwijder'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </section>
  );
}
