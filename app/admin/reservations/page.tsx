'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { useAdminToken, useRequireAdmin } from '../admin-utils';

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
  const { adminToken, ready } = useAdminToken();
  useRequireAdmin();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | Reservation['status']>('PENDING');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    setError(null);
    const query = statusFilter === 'ALL' ? '' : `?status=${statusFilter}`;
    const response = await fetch(`/api/admin/reservations${query}`, {
      headers: { 'x-admin-token': adminToken }
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan reservaties niet laden.');
      return;
    }

    const data = await response.json();
    setReservations(data.reservations ?? []);
  }, [adminToken, statusFilter]);

  useEffect(() => {
    if (!ready || !adminToken) return;
    fetchReservations();
  }, [ready, adminToken, fetchReservations]);

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    setMessage(null);
    setError(null);
    const response = await fetch(`/api/admin/reservations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan status niet bijwerken.');
      return;
    }

    setMessage('Reservatie geüpdatet.');
    fetchReservations();
  };

  const deleteReservation = async (id: string) => {
    setMessage(null);
    setError(null);
    const response = await fetch(`/api/admin/reservations/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan reservatie niet verwijderen.');
      return;
    }

    setMessage('Reservatie verwijderd.');
    fetchReservations();
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
              {reservations.length === 0 && <p>Geen reservaties gevonden.</p>}
              {reservations.map((reservation) => (
                <div key={reservation.id} className={styles.listItem}>
                  <div>
                    <strong>{reservation.name}</strong> ({reservation.email})
                    <div>
                      {formatDate(reservation.date)} • {reservation.startTime} - {reservation.endTime}
                    </div>
                    <p>{reservation.description}</p>
                  </div>
                  <div className={styles.actions}>
                    <span className={styles.status}>{statusLabels[reservation.status] ?? reservation.status}</span>
                    <button type="button" onClick={() => updateReservationStatus(reservation.id, 'ACCEPTED')}>Accepteer</button>
                    <button type="button" onClick={() => updateReservationStatus(reservation.id, 'REJECTED')}>Weiger</button>
                    <button type="button" onClick={() => updateReservationStatus(reservation.id, 'CANCELED')}>Annuleer</button>
                    <button type="button" className={styles.dangerButton} onClick={() => deleteReservation(reservation.id)}>Verwijder</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </section>
  );
}
