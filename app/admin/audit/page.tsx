'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '../admin.module.css';
import { useRequireAdmin } from '../admin-utils';
import { apiUrl } from '@/lib/api-url';

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
  const { isLoggedIn, ready } = useRequireAdmin();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const visibleLogs = useMemo(
    () => logs.slice((page - 1) * pageSize, page * pageSize),
    [logs, page, pageSize]
  );

  const fetchLogs = useCallback(async () => {
    if (!isLoggedIn) return;
    const response = await fetch(apiUrl('/api/admin/audit'), {
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? 'Kan activiteitslog niet laden.');
      return;
    }

    const data = await response.json();
    setLogs(Array.isArray(data) ? data : (data.logs ?? []));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!ready || !isLoggedIn) return;
    fetchLogs();
  }, [ready, isLoggedIn, fetchLogs]);

  return (
    <section className={styles.admin}>
        <h2>Activiteitslog</h2>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Laatste wijzigingen</h3>
            <div className={styles.pageSizePicker}>
              <span>Toon</span>
              {[10, 20, 50, 100].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.pageSizeBtn}${pageSize === n ? ` ${styles.pageSizeBtnActive}` : ''}`}
                  onClick={() => { setPageSize(n); setPage(1); setExpandedId(null); }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.list}>
            {logs.length === 0 && <p>Geen activiteiten gevonden.</p>}
            {visibleLogs.map((log) => {
              const formattedDate = log.data?.date
                ? formatDateTime(log.data.date)
                : formatDateTime(log.createdAt);
              const labelName = log.data?.name ? ` (${log.data.name})` : '';
              const summary = `${log.action}${labelName} op ${formattedDate}`;
              const isOpen = expandedId === log.id;

              return (
                <div key={log.id} className={styles.auditListItem}>
                  <button
                    type="button"
                    className={styles.auditToggle}
                    onClick={() => setExpandedId(isOpen ? null : log.id)}
                  >
                    <strong>{summary}</strong>
                    <span className={`${styles.auditArrow}${isOpen ? ` ${styles.auditArrowOpen}` : ''}`}>▼</span>
                  </button>
                  <div className={`${styles.auditDetails}${isOpen ? ` ${styles.auditDetailsOpen}` : ''}`}>
                    <div className={styles.auditDetailsInner}>
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
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => { setPage(page - 1); setExpandedId(null); }}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.pageBtn}${p === page ? ` ${styles.pageBtnActive}` : ''}`}
                  onClick={() => { setPage(p); setExpandedId(null); }}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => { setPage(page + 1); setExpandedId(null); }}
              >
                ›
              </button>
              <span className={styles.pageInfo}>
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, logs.length)} van {logs.length}
              </span>
            </div>
          )}
        </div>
    </section>
  );
}
