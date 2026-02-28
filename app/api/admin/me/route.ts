import { NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/admin-auth';

export async function GET() {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
