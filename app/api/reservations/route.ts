import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';

const ReservationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  description: z.string().min(5)
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
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  if (dateParam) {
    const dateOnly = normalizeDate(dateParam);
    if (!dateOnly) {
      return NextResponse.json({ error: 'Ongeldige datum.' }, { status: 400 });
    }

    const dayStart = new Date(dateOnly);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dateOnly);
    dayEnd.setHours(23, 59, 59, 999);

    const reservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd
        },
        status: { in: ['PENDING', 'ACCEPTED'] }
      },
      orderBy: [{ startTime: 'asc' }]
    });

    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      orderBy: [{ startTime: 'asc' }]
    });

    return NextResponse.json({ reservations, blockedSlots });
  }

  const reservations = await prisma.reservation.findMany({
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  });

  return NextResponse.json({ reservations });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ReservationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige invoer.' }, { status: 400 });
  }

  const { name, email, date, startTime, endTime, description } = parsed.data;
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    return NextResponse.json({ error: 'Eindtijd moet na starttijd liggen.' }, { status: 400 });
  }

  const dateOnly = normalizeDate(date);
  if (!dateOnly) {
    return NextResponse.json({ error: 'Ongeldige datum.' }, { status: 400 });
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (dateOnly.getTime() <= todayStart.getTime()) {
    return NextResponse.json({ error: 'Selecteer een datum in de toekomst.' }, { status: 400 });
  }

  const dayStart = new Date(dateOnly);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateOnly);
  dayEnd.setHours(23, 59, 59, 999);

  const existing = await prisma.reservation.findMany({
    where: {
      date: {
        gte: dayStart,
        lte: dayEnd
      },
      status: { in: ['PENDING', 'ACCEPTED'] }
    }
  });

  const blocked = await prisma.blockedSlot.findMany({
    where: {
      date: {
        gte: dayStart,
        lte: dayEnd
      }
    }
  });

  const overlaps = (startA: number, endA: number, startB: number, endB: number) =>
    startA < endB && endA > startB;

  const hasConflict = existing.some((reservation) => {
    const existingStart = timeToMinutes(reservation.startTime);
    const existingEnd = timeToMinutes(reservation.endTime);
    return overlaps(startMinutes, endMinutes, existingStart, existingEnd);
  });

  const hasBlocked = blocked.some((slot) => {
    const blockedStart = timeToMinutes(slot.startTime);
    const blockedEnd = timeToMinutes(slot.endTime);
    return overlaps(startMinutes, endMinutes, blockedStart, blockedEnd);
  });

  if (hasConflict || hasBlocked) {
    return NextResponse.json(
      { error: 'Dit tijdslot is niet beschikbaar.' },
      { status: 409 }
    );
  }

  const reservation = await prisma.reservation.create({
    data: {
      name,
      email,
      date: dateOnly,
      startTime,
      endTime,
      description,
      status: 'PENDING'
    }
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    await sendMail({
      to: adminEmail,
      subject: 'Nieuwe reservatie aanvraag',
      text: `Nieuwe reservatie van ${name} (${email}).\nDatum: ${dateOnly.toLocaleDateString('nl-BE')}\nTijd: ${startTime} - ${endTime}\n\nBeschrijving:\n${description}`
    });
  }

  return NextResponse.json({ reservation }, { status: 201 });
}
