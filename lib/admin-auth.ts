import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const requireAdminToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminToken')?.value;

  if (!token) {
    return { ok: false as const, error: 'Niet ingelogd.' };
  }

  const master = process.env.ADMIN_MASTER_TOKEN;
  if (master && token === master) {
    return { ok: true as const };
  }

  const stored = await prisma.token.findFirst({
    where: {
      value: token,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  if (!stored) {
    return { ok: false as const, error: 'Ongeldige of verlopen token.' };
  }

  return { ok: true as const };
};
