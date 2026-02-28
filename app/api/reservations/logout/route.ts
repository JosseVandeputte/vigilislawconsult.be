import { NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV !== 'production';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('reservationEmail', '', {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    path: '/',
    domain: isDev ? undefined : '.vigilislawconsult.be',
    maxAge: 0,
  });
  return response;
}
