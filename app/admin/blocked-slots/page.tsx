'use client';

import { useEffect, useState } from 'react';
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

type BlockedSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
};

export default function AdminBlockedSlotsPage() {
  const { adminToken, setAdminToken, ready } = useAdminToken();
  useRequireAdmin();
  const [slots, setSlots] = useState<BlockedSlot[]>([]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [reason, setReason] = useState('');
    const timeSlots = Array.from({ length: 96 }, (_, index) => {
      const hours = String(Math.floor(index / 4)).padStart(2, '0');
      const minutes = String((index % 4) * 15).padStart(2, '0');
      return `${hours}:${minutes}`;
    });

    const endTimeOptions = startTime
      ? timeSlots.slice(timeSlots.indexOf(startTime) + 1)
      : timeSlots;


  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = async () => {
    if (!adminToken) return;
    const response = await fetch('/api/admin/blocked-slots', {
      headers: { 'x-admin-token': adminToken }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan blocked slots niet laden.');
      return;
    }

    const data = await response.json();
    setSlots(data.slots ?? []);
  };

  useEffect(() => {
    if (!ready || !adminToken) return;
    fetchSlots();
  }, [ready, adminToken]);

  const createSlot = async () => {
    setMessage(null);
    setError(null);

    const payloadStart = allDay ? '00:00' : startTime;
    const payloadEnd = allDay ? '23:59' : endTime;

    const response = await fetch('/api/admin/blocked-slots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ date, startTime: payloadStart, endTime: payloadEnd, reason })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan blocked slot niet aanmaken.');
      return;
    }

    setMessage('Blocked slot toegevoegd.');
    setDate('');
    setStartTime('');
    setEndTime('');
    setAllDay(false);
    setReason('');
    fetchSlots();
  };

  const deleteSlot = async (id: string) => {
    setMessage(null);
    setError(null);
    const response = await fetch(`/api/admin/blocked-slots/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan blocked slot niet verwijderen.');
      return;
    }

    setMessage('Blocked slot verwijderd.');
    fetchSlots();
  };

  return (
    <div>
      <Header />
      <section className={styles.admin}>
        <h2>Blocked slots</h2>

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
          <h3>Nieuw blocked slot</h3>
          <div className={styles.tokenActions}>
            <input
              type="date"
              lang="nl-BE"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <select
              value={startTime}
              disabled={allDay}
              onChange={(e) => {
                const value = e.target.value;
                setStartTime(value);
                if (!value) {
                  setEndTime('');
                  return;
                }
                if (endTime && timeSlots.indexOf(endTime) <= timeSlots.indexOf(value)) {
                  setEndTime('');
                }
              }}
            >
              <option value="">Starttijd</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            <select
              value={endTime}
              disabled={allDay}
              onChange={(e) => setEndTime(e.target.value)}
            >
              <option value="">Eindtijd</option>
              {endTimeOptions.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            <label className={styles.inlineLabel}>
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              Hele dag
            </label>
            <input
              type="text"
              placeholder="Reden (optioneel)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button type="button" onClick={createSlot}>Toevoegen</button>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Geblokkeerde tijdsloten</h3>
          <div className={styles.list}>
            {slots.length === 0 && <p>Geen blocked slots gevonden.</p>}
            {slots.map((slot) => (
              <div key={slot.id} className={styles.listItem}>
                <div>
                  <strong>{formatDate(slot.date)}</strong>
                  <div>{slot.startTime} - {slot.endTime}</div>
                  {slot.reason && <div>Reden: {slot.reason}</div>}
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.dangerButton} onClick={() => deleteSlot(slot.id)}>
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
