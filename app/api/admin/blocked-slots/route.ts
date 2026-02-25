import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminToken } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';
import { formatZodError, internalError } from '@/lib/api-error';

const BlockedSlotSchema = z.object({
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().optional()
});

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const normalizeDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

export async function GET(request: Request) {
  const auth = await requireAdminToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const slots = await prisma.blockedSlot.findMany({
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  });

  return NextResponse.json({ slots });
}

export async function POST(request: Request) {
  const auth = await requireAdminToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = BlockedSlotSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const { date, startTime, endTime, reason } = parsed.data;
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    return NextResponse.json({ error: 'Eindtijd moet na starttijd liggen.' }, { status: 400 });
  }

  const dateOnly = normalizeDate(date);
  if (!dateOnly) {
    return NextResponse.json({ error: 'Ongeldige datum.' }, { status: 400 });
  }

  try {
    const slot = await prisma.blockedSlot.create({
      data: {
        date: dateOnly,
        startTime,
        endTime,
        reason
      }
    });

    await logAudit({
      action: 'blockedSlot.create',
      entityType: 'blockedSlot',
      entityId: slot.id,
      message: `Blocked slot toegevoegd op ${dateOnly.toLocaleDateString('nl-BE')} ${startTime}-${endTime}`,
      data: {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        description: slot.reason ?? ''
      }
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (err) {
    return internalError('admin.blockedSlots.create', err);
  }
}
