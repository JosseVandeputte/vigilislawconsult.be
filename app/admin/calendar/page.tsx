'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/header';
import Footer from '../../components/footer';
import styles from '../admin.module.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import nlLocale from '@fullcalendar/core/locales/nl';
import { useAdminToken, useRequireAdmin } from '../admin-utils';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('nl-BE');
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

type BlockedSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
};

const statusColors: Record<Reservation['status'], string> = {
  PENDING: '#f59f00',
  ACCEPTED: '#2f9e44',
  REJECTED: '#d9480f',
  CANCELED: '#495057'
};

export default function AdminCalendarPage() {
  const { adminToken, setAdminToken, ready } = useAdminToken();
  useRequireAdmin();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [calendarView, setCalendarView] = useState<'timeGridWeek' | 'dayGridMonth'>('timeGridWeek');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);

  const fetchReservations = async () => {
    if (!adminToken) return;
    const response = await fetch('/api/admin/reservations?status=ALL', {
      headers: { 'x-admin-token': adminToken }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan reservaties niet laden.');
      return;
    }

    const data = await response.json();
    setReservations(data.reservations ?? []);
  };

  const fetchBlockedSlots = async () => {
    if (!adminToken) return;
    const response = await fetch('/api/admin/blocked-slots', {
      headers: { 'x-admin-token': adminToken }
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setBlockedSlots(data.slots ?? []);
  };

  useEffect(() => {
    if (!ready || !adminToken) return;
    fetchReservations();
    fetchBlockedSlots();
  }, [ready, adminToken]);

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    setError(null);
    setMessage(null);
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
    setError(null);
    setMessage(null);
    const response = await fetch(`/api/admin/reservations/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan reservatie niet verwijderen.');
      return;
    }

    setSelected(null);
    setMessage('Reservatie verwijderd.');
    fetchReservations();
  };

  const events = useMemo(() => {
    const reservationEvents = reservations.map((reservation) => {
      const baseDate = new Date(reservation.date);
      const [startHour, startMinute] = reservation.startTime.split(':').map(Number);
      const [endHour, endMinute] = reservation.endTime.split(':').map(Number);
      const start = new Date(baseDate);
      start.setHours(startHour, startMinute, 0, 0);
      const end = new Date(baseDate);
      end.setHours(endHour, endMinute, 0, 0);

      return {
        id: reservation.id,
        title: `${reservation.name}`,
        start,
        end,
        backgroundColor: statusColors[reservation.status],
        borderColor: statusColors[reservation.status],
        textColor: '#fff'
      };
    });

    const blockedEvents = blockedSlots.map((slot) => {
      const baseDate = new Date(slot.date);
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);
      const start = new Date(baseDate);
      start.setHours(startHour, startMinute, 0, 0);
      const end = new Date(baseDate);
      end.setHours(endHour, endMinute, 0, 0);

      return {
        id: `blocked-${slot.id}`,
        title: slot.reason ? `Geblokkeerd: ${slot.reason}` : 'Geblokkeerd',
        start,
        end,
        backgroundColor: '#6c757d',
        borderColor: '#6c757d',
        textColor: '#fff'
      };
    });

    return [...reservationEvents, ...blockedEvents];
  }, [reservations, blockedSlots]);

  return (
    <div>
      <Header />
      <section className={styles.admin}>
        <h2>Admin kalender</h2>

        <div className={styles.adminNav}>
          <Link href="/admin/calendar">Kalender</Link>
          <Link href="/admin/reservations">Reservaties</Link>
          <Link href="/admin/tokens">Tokens</Link>
          <Link href="/admin/blocked-slots">Blocked slots</Link>
          <Link href="/admin/audit">Audit log</Link>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.calendarCard}>
          <div className={styles.cardHeader}>
            <h3>Kalender overzicht</h3>
            <div className={styles.viewToggle}>
              <button
                type="button"
                className={calendarView === 'timeGridWeek' ? styles.activeToggle : ''}
                onClick={() => {
                  setCalendarView('timeGridWeek');
                  calendarRef.current?.getApi().changeView('timeGridWeek');
                }}
              >
                Week
              </button>
              <button
                type="button"
                className={calendarView === 'dayGridMonth' ? styles.activeToggle : ''}
                onClick={() => {
                  setCalendarView('dayGridMonth');
                  calendarRef.current?.getApi().changeView('dayGridMonth');
                }}
              >
                Maand
              </button>
            </div>
          </div>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={calendarView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            buttonText={{
              today: 'Vandaag'
            }}
            firstDay={1}
            locale={nlLocale}
            height="auto"
            nowIndicator
            allDaySlot={false}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            events={events}
            eventClick={(info) => {
              const match = reservations.find((res) => res.id === info.event.id);
              if (!match) return;
              const event = info.jsEvent as MouseEvent;
              setSelected(match);
              setPopoverPosition({ x: event.pageX, y: event.pageY });
            }}
          />

          <div className={styles.legend}>
            <span><i style={{ backgroundColor: statusColors.PENDING }} />In afwachting</span>
            <span><i style={{ backgroundColor: statusColors.ACCEPTED }} />Goedgekeurd</span>
            <span><i style={{ backgroundColor: statusColors.REJECTED }} />Geweigerd</span>
            <span><i style={{ backgroundColor: statusColors.CANCELED }} />Geannuleerd</span>
            <span><i style={{ backgroundColor: '#6c757d' }} />Geblokkeerd</span>
          </div>
        </div>

        {selected && popoverPosition && (
          <div
            className={styles.popover}
            style={{
              left: popoverPosition.x + 12,
              top: popoverPosition.y + 12
            }}
          >
            <div className={styles.popoverHeader}>
              <h4>Afspraak details</h4>
              <button
                type="button"
                className={styles.popoverClose}
                onClick={() => {
                  setSelected(null);
                  setPopoverPosition(null);
                }}
              >
                ×
              </button>
            </div>
            <div className={styles.popoverContent}>
              <p><strong>Naam:</strong> {selected.name}</p>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Datum:</strong> {formatDate(selected.date)}</p>
              <p><strong>Tijd:</strong> {selected.startTime} - {selected.endTime}</p>
              <p><strong>Beschrijving:</strong> {selected.description}</p>
              <p><strong>Status:</strong> {selected.status}</p>
            </div>
            <div className={styles.detailActions}>
              <button type="button" onClick={() => updateReservationStatus(selected.id, 'ACCEPTED')}>Accepteer</button>
              <button type="button" onClick={() => updateReservationStatus(selected.id, 'REJECTED')}>Weiger</button>
              <button type="button" onClick={() => updateReservationStatus(selected.id, 'CANCELED')}>Annuleer</button>
              <button type="button" className={styles.dangerButton} onClick={() => deleteReservation(selected.id)}>Verwijder</button>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
