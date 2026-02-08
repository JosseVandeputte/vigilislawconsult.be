'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/header';
import Footer from '../../components/footer';
import styles from '../admin.module.css';
import { useAdminToken, useRequireAdmin } from '../admin-utils';

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('nl-BE')} ${date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}`;
};

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  data?: {
    name?: string;
    email?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    status?: string;
    value?: string;
    expiresAt?: string;
  };
  createdAt: string;
};

export default function AdminAuditPage() {
  const { adminToken, ready } = useAdminToken();
  useRequireAdmin();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!adminToken) return;
    const response = await fetch('/api/admin/audit', {
      headers: { 'x-admin-token': adminToken }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan audit logs niet laden.');
      return;
    }

    const data = await response.json();
    setLogs(data.logs ?? []);
  }, [adminToken]);

  useEffect(() => {
    if (!ready || !adminToken) return;
    fetchLogs();
  }, [ready, adminToken, fetchLogs]);

  return (
    <div>
      <Header />
      <section className={styles.admin}>
        <h2>Audit log</h2>

        <div className={styles.adminNav}>
          <Link href="/admin/calendar">Kalender</Link>
          <Link href="/admin/reservations">Reservaties</Link>
          <Link href="/admin/tokens">Tokens</Link>
          <Link href="/admin/blocked-slots">Blocked slots</Link>
          <Link href="/admin/audit">Audit log</Link>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.card}>
          <h3>Laatste wijzigingen</h3>
          <div className={styles.list}>
            {logs.length === 0 && <p>Geen audit logs gevonden.</p>}
            {logs.map((log) => {
              const formattedDate = log.data?.date
                ? formatDateTime(log.data.date)
                : formatDateTime(log.createdAt);
              const labelName = log.data?.name ? ` (${log.data.name})` : '';
              const summary = `${log.action}${labelName} op ${formattedDate}`;

              return (
                <div key={log.id} className={styles.listItem}>
                  <button
                    type="button"
                    className={styles.auditToggle}
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <strong>{summary}</strong>
                    <span>{expandedId === log.id ? '▲' : '▼'}</span>
                  </button>
                  {expandedId === log.id && (
                    <div className={styles.auditDetails}>
                      <div>{log.message}</div>
                      <div>{log.entityType} • {log.entityId}</div>
                      {log.data?.name && <div><strong>Naam:</strong> {log.data.name}</div>}
                      {log.data?.email && <div><strong>Email:</strong> {log.data.email}</div>}
                      {log.data?.date && <div><strong>Datum:</strong> {formatDateTime(log.data.date)}</div>}
                      {log.data?.startTime && log.data?.endTime && (
                        <div><strong>Tijd:</strong> {log.data.startTime} - {log.data.endTime}</div>
                      )}
                      {log.data?.description && <div><strong>Beschrijving:</strong> {log.data.description}</div>}
                      {log.data?.status && <div><strong>Status:</strong> {log.data.status}</div>}
                      {log.data?.value && <div><strong>Token:</strong> {log.data.value}</div>}
                      {log.data?.expiresAt && <div><strong>Vervalt:</strong> {formatDateTime(log.data.expiresAt)}</div>}
                      <div><strong>Aangemaakt:</strong> {formatDateTime(log.createdAt)}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
