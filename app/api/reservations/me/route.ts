import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get('reservationEmail')?.value;

  if (!email) {
    return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
  }

  return NextResponse.json({ email });
}
