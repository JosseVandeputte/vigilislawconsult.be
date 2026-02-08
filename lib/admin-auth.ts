import prisma from '@/lib/prisma';

export const requireAdminToken = async (request: Request) => {
  const token = request.headers.get('x-admin-token');
  if (!token) {
    return { ok: false as const, error: 'Ontbrekende admin token.' };
  }

  const master = process.env.ADMIN_MASTER_TOKEN;
  if (master && token === master) {
    return { ok: true as const };
  }

  const stored = await prisma.token.findFirst({
    where: {
      value: token,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
    }
  });

  if (!stored) {
    return { ok: false as const, error: 'Ongeldige of verlopen token.' };
  }

  return { ok: true as const };
};
