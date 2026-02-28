'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from './admin-utils';

export default function AdminPage() {
  const router = useRouter();
  const { isLoggedIn, ready } = useAdminAuth();

  useEffect(() => {
    if (!ready) return;
    router.replace(isLoggedIn ? '/admin/calendar' : '/admin/login');
  }, [isLoggedIn, ready, router]);

  return null;
}
