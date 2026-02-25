'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const { adminToken, ready } = useAdminToken();
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

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingSlots = useMemo(
    () => slots.filter((s) => s.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)),
    [slots, todayStr]
  );
  const pastSlots = useMemo(
    () => slots.filter((s) => s.date < todayStr).sort((a, b) => b.date.localeCompare(a.date)),
    [slots, todayStr]
  );

  const fetchSlots = useCallback(async () => {
    if (!adminToken) return;
    try {
      const response = await fetch('/api/admin/blocked-slots', {
        headers: { 'x-admin-token': adminToken }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Kan geblokkeerde slots niet laden.');
        return;
      }

      const data = await response.json();
      setSlots(data.slots ?? []);
    } catch {
      setError('Netwerkfout. Kan geblokkeerde slots niet laden.');
    }
  }, [adminToken]);

  useEffect(() => {
    if (!ready || !adminToken) return;
    fetchSlots();
  }, [ready, adminToken, fetchSlots]);

  const createSlot = async () => {
    setMessage(null);
    setError(null);

    const payloadStart = allDay ? '00:00' : startTime;
    const payloadEnd = allDay ? '23:59' : endTime;

    try {
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
        setError(data?.error ?? 'Kan geblokkeerd slot niet aanmaken.');
        return;
      }

      setMessage('Geblokkeerd slot toegevoegd.');
      setDate('');
      setStartTime('');
      setEndTime('');
      setAllDay(false);
      setReason('');
      fetchSlots();
    } catch {
      setError('Netwerkfout. Kan geblokkeerd slot niet aanmaken.');
    }
  };

  const deleteSlot = async (id: string) => {
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/blocked-slots/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? 'Kan geblokkeerd slot niet verwijderen.');
        return;
      }

      setMessage('Geblokkeerd slot verwijderd.');
      fetchSlots();
    } catch {
      setError('Netwerkfout. Kan geblokkeerd slot niet verwijderen.');
    }
  };

  return (
    <section className={styles.admin}>
        <h2>Geblokkeerde slots</h2>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.card}>
          <h3>Nieuw geblokkeerd slot</h3>
          <div className={styles.tokenActions}>
            <div className={styles.formField}>
              <label htmlFor="slot-date" className={styles.formLabel}>Datum</label>
              <input
                id="slot-date"
                type="date"
                lang="nl-BE"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="slot-start" className={styles.formLabel}>Starttijd</label>
              <select
                id="slot-start"
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
                <option value="">—</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div className={styles.formField}>
              <label htmlFor="slot-end" className={styles.formLabel}>Eindtijd</label>
              <select
                id="slot-end"
                value={endTime}
                disabled={allDay}
                onChange={(e) => setEndTime(e.target.value)}
              >
                <option value="">—</option>
                {endTimeOptions.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div className={styles.formField}>
              <span className={styles.formLabel} aria-hidden="true">&nbsp;</span>
              <label className={styles.inlineLabel}>
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                />
                Hele dag
              </label>
            </div>
            <div className={styles.formField}>
              <label htmlFor="slot-reason" className={styles.formLabel}>Reden (optioneel)</label>
              <input
                id="slot-reason"
                type="text"
                placeholder="Optioneel"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <button type="button" onClick={createSlot}>Toevoegen</button>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Geblokkeerde tijdsloten</h3>

          {slots.length === 0 && <p>Geen geblokkeerde slots gevonden.</p>}

          {upcomingSlots.length > 0 && (
            <>
              <p className={styles.listSubheading}>Aankomend</p>
              <div className={styles.list}>
                {upcomingSlots.map((slot) => (
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
            </>
          )}

          {pastSlots.length > 0 && (
            <>
              <p className={styles.listSubheading}>Verleden</p>
              <div className={styles.list}>
                {pastSlots.map((slot) => (
                  <div key={slot.id} className={`${styles.listItem} ${styles.listItemMuted}`}>
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
            </>
          )}
        </div>
    </section>
  );
}
