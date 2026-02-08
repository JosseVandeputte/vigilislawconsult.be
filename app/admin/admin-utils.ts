'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useAdminToken = () => {
  const [adminToken, setAdminToken] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.sessionStorage.getItem('adminToken') ?? '';
    setAdminToken(stored);
    setReady(true);
  }, []);

  const updateToken = (value: string) => {
    setAdminToken(value);
    window.sessionStorage.setItem('adminToken', value);
  };

  const clearToken = () => {
    setAdminToken('');
    window.sessionStorage.removeItem('adminToken');
  };

  return { adminToken, setAdminToken: updateToken, clearToken, ready };
};

export const useRequireAdmin = () => {
  const router = useRouter();
  const { adminToken, ready } = useAdminToken();

  useEffect(() => {
    if (ready && !adminToken) {
      router.push('/admin/login');
    }
  }, [ready, adminToken, router]);

  return { adminToken, ready };
};
