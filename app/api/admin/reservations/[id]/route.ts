import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminToken } from '@/lib/admin-auth';
import { sendMail } from '@/lib/mailer';

const StatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'CANCELED'])
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige status.' }, { status: 400 });
  }

  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status: parsed.data.status }
  });

  const statusMap: Record<string, string> = {
    ACCEPTED: 'goedgekeurd',
    REJECTED: 'geweigerd',
    CANCELED: 'geannuleerd'
  };

  await sendMail({
    to: reservation.email,
    subject: 'Update over uw reservatie',
    text: `Beste ${reservation.name},\n\nUw reservatie op ${reservation.date.toLocaleDateString('nl-BE')} van ${reservation.startTime} tot ${reservation.endTime} is ${statusMap[reservation.status]}.\n\nMet vriendelijke groet,\nVigilis Law Consult`
  });

  return NextResponse.json({ reservation });
}
