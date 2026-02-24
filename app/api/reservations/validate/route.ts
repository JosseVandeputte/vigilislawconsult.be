import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const ValidateSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ValidateSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige invoer.' }, { status: 400 });
  }

  const { email, token } = parsed.data;

  const found = await prisma.token.findFirst({
    where: {
      value: token,
      email: email.toLowerCase(),
      isActive: true
    }
  });

  if (!found) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres of token.' }, { status: 401 });
  }

  if (found.expiresAt && found.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Deze token is verlopen.' }, { status: 401 });
  }

  return NextResponse.json({ valid: true });
}
