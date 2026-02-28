import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const isDev = process.env.NODE_ENV !== 'production';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token.trim() : '';

  if (!token) {
    return NextResponse.json({ error: 'Token is vereist.' }, { status: 400 });
  }

  const master = process.env.ADMIN_MASTER_TOKEN;
  let valid = false;

  if (master && token === master) {
    valid = true;
  } else {
    const stored = await prisma.token.findFirst({
      where: {
        value: token,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    valid = !!stored;
  }

  if (!valid) {
    return NextResponse.json({ error: 'Ongeldige of verlopen token.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('adminToken', token, {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    path: '/',
    domain: isDev ? undefined : '.vigilislawconsult.be',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
