'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/api-url';

/**
 * Checks auth status by calling GET /api/admin/me.
 * The adminToken HttpOnly cookie is sent automatically (credentials: 'include').
 */
export const useAdminAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/admin/me'), { credentials: 'include' })
      .then((res) => {
        setIsLoggedIn(res.ok);
        setReady(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setReady(true);
      });
  }, []);

  return { isLoggedIn, ready };
};

/**
 * Guards an admin page. Redirects to /admin/login when not authenticated.
 */
export const useRequireAdmin = () => {
  const router = useRouter();
  const { isLoggedIn, ready } = useAdminAuth();

  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.push('/admin/login');
    }
  }, [ready, isLoggedIn, router]);

  return { isLoggedIn, ready };
};
