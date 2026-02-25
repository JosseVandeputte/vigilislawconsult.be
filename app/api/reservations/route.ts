import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';
import { formatZodError, internalError } from '@/lib/api-error';

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
  const monthParam = searchParams.get('month');

  if (monthParam) {
    const match = /^(\d{4})-(\d{2})$/.exec(monthParam);
    if (!match) {
      return NextResponse.json({ error: 'Ongeldige maand.' }, { status: 400 });
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (!year || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Ongeldige maand.' }, { status: 400 });
    }

    const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });

    return NextResponse.json({ blockedSlots });
  }

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
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
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

  try {
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

    const formatDate = dateOnly.toLocaleDateString('nl-BE');
    const customerText = `Beste ${name},\n\nWe hebben uw aanvraag voor een afspraak bij ons goed ontvangen.\n\nDatum: ${formatDate}\nTijd: ${startTime} - ${endTime}\n\nU krijgt bericht zodra de aanvraag is goedgekeurd of geweigerd.\n\nMet vriendelijke groeten,\nVigilis Law Consult`;
    const customerHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e2d40;">
      <p>Beste ${name},</p>
      <p>We hebben uw aanvraag voor een afspraak bij ons goed ontvangen.</p>
      <p><strong>Datum:</strong> ${formatDate}<br />
      <strong>Tijd:</strong> ${startTime} - ${endTime}</p>
      <p>U krijgt bericht zodra de aanvraag is goedgekeurd of geweigerd.</p>
      <p>Met vriendelijke groeten,<br />Vigilis Law Consult</p>
    </div>
  `;

    const customerMailResult = await sendMail({
      to: email,
      subject: 'Bevestiging van uw reservatie-aanvraag',
      text: customerText,
      html: customerHtml
    });
    if (!customerMailResult.ok) console.error('[api:reservations] Klant e-mail mislukt:', customerMailResult.error);

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      const token = await prisma.token.findFirst({ where: { email: email.toLowerCase() } });

      const tokenSection = token
        ? `Token: ${token.name} (aangemaakt op: ${token.createdAt.toLocaleDateString('nl-BE')}${token.expiresAt ? `, vervalt op: ${token.expiresAt.toLocaleDateString('nl-BE')}` : ', geen vervaldatum'})`
        : 'Geen token gevonden voor dit e-mailadres.';

      const tokenHtml = token
        ? `<p><strong>Token naam:</strong> ${token.name}<br />
           <strong>Aangemaakt op:</strong> ${token.createdAt.toLocaleDateString('nl-BE')}<br />
           <strong>Vervaldatum:</strong> ${token.expiresAt ? token.expiresAt.toLocaleDateString('nl-BE') : 'geen'}</p>`
        : `<p><em>Geen token gevonden voor dit e-mailadres.</em></p>`;

      const adminText = `Nieuwe reservatie van ${name} (met email: ${email}).\n\nDatum: ${formatDate}\nTijd: ${startTime} - ${endTime}\n\nBeschrijving:\n${description}\n\n---\n${tokenSection}`;
      const adminHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e2d40;">
        <p>Nieuwe reservatie van <strong>${name}</strong> (met email: ${email}).</p>
        <p><strong>Datum:</strong> ${formatDate}<br />
        <strong>Tijd:</strong> ${startTime} - ${endTime}</p>
        <p><strong>Beschrijving:</strong><br />${description}</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 1.5rem 0;" />
        <p style="color: #666; font-size: 0.9rem;"><strong>Gebruikte toegangstoken</strong></p>
        ${tokenHtml}
      </div>
    `;
      const adminMailResult = await sendMail({
        to: adminEmail,
        subject: 'Nieuwe reservatie aanvraag',
        text: adminText,
        html: adminHtml
      });
      if (!adminMailResult.ok) console.error('[api:reservations] Admin e-mail mislukt:', adminMailResult.error);
    }

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (err) {
    return internalError('reservations.create', err);
  }
}
