'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminToken } from './admin-utils';

export default function AdminPage() {
  const router = useRouter();
  const { adminToken, ready } = useAdminToken();

  useEffect(() => {
    if (!ready) return;
    router.replace(adminToken ? '/admin/calendar' : '/admin/login');
  }, [adminToken, ready, router]);

  return null;
}
