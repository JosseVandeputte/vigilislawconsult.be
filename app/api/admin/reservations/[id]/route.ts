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

  const formattedDate = reservation.date.toLocaleDateString('nl-BE');
  const userText = `Beste ${reservation.name},\n\nUw reservatie bij ons op ${formattedDate} van ${reservation.startTime} tot ${reservation.endTime} is ${statusMap[reservation.status]}.\n\nMet vriendelijke groeten,\nVigilis Law Consult`;
  const userHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e2d40;">
      <p>Beste ${reservation.name},</p>
      <p>Uw reservatie bij ons op <strong>${formattedDate}</strong> van <strong>${reservation.startTime}</strong> tot <strong>${reservation.endTime}</strong> is ${statusMap[reservation.status]}.</p>
      <p>Met vriendelijke groeten,<br />Vigilis Law Consult</p>
    </div>
  `;

  await sendMail({
    to: reservation.email,
    subject: 'Update over uw reservatie',
    text: userText,
    html: userHtml
  });

  return NextResponse.json({ reservation });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
