import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const StatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED'])
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige status.' }, { status: 400 });
  }

  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status: parsed.data.status }
  });

  return NextResponse.json({ reservation });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
