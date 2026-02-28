import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminToken } from '@/lib/admin-auth';
import { sendMail } from '@/lib/mailer';
import { logAudit } from '@/lib/audit';
import { internalError } from '@/lib/api-error';

const StatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'CANCELED'])
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige status.' }, { status: 400 });
  }

  try {
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

    const mailResult = await sendMail({
      to: reservation.email,
      subject: 'Update over uw reservatie',
      text: userText,
      html: userHtml
    });
    if (!mailResult.ok) console.error('[api:admin.reservations.update] E-mail naar klant mislukt:', mailResult.error);

    await logAudit({
      action: 'reservation.status.update',
      entityType: 'reservation',
      entityId: reservation.id,
      message: `Status gewijzigd naar ${reservation.status} voor ${reservation.email}`,
      data: {
        name: reservation.name,
        email: reservation.email,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        description: reservation.description,
        status: reservation.status
      }
    });

    return NextResponse.json({ reservation });
  } catch (err) {
    return internalError('admin.reservations.update', err);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const existing = await prisma.reservation.findUnique({ where: { id } });
    await prisma.reservation.delete({ where: { id } });
    await logAudit({
      action: 'reservation.delete',
      entityType: 'reservation',
      entityId: id,
      message: 'Reservatie verwijderd',
      data: existing
        ? {
            name: existing.name,
            email: existing.email,
            date: existing.date,
            startTime: existing.startTime,
            endTime: existing.endTime,
            description: existing.description,
            status: existing.status
          }
        : undefined
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return internalError('admin.reservations.delete', err);
  }
}
