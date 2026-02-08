import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminToken } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';

const CreateTokenSchema = z.object({
  name: z.string().min(2),
  expiresAt: z.string().datetime().optional()
});

const generateToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

export async function GET(request: Request) {
  const auth = await requireAdminToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const tokens = await prisma.token.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ tokens });
}

export async function POST(request: Request) {
  const auth = await requireAdminToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = CreateTokenSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige invoer.' }, { status: 400 });
  }

  const value = generateToken();
  const token = await prisma.token.create({
    data: {
      name: parsed.data.name,
      value,
      isActive: true,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null
    }
  });

  await logAudit({
    action: 'token.create',
    entityType: 'token',
    entityId: token.id,
    message: `Token aangemaakt (${token.name})`,
    data: {
      name: token.name,
      value: token.value,
      expiresAt: token.expiresAt
    }
  });

  return NextResponse.json({ token }, { status: 201 });
}
