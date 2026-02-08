import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminToken } from '@/lib/admin-auth';

const StatusQuerySchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED', 'ALL']).optional()
});

export async function GET(request: Request) {
  const auth = await requireAdminToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? undefined;
  const parsed = StatusQuerySchema.safeParse({ status });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige status filter.' }, { status: 400 });
  }

  const reservations = await prisma.reservation.findMany({
    where: parsed.data.status && parsed.data.status !== 'ALL'
      ? { status: parsed.data.status }
      : undefined,
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  });

  return NextResponse.json({ reservations });
}
