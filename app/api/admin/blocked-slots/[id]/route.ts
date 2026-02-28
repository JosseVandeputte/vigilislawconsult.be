import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminToken } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';
import { internalError } from '@/lib/api-error';

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
    const existing = await prisma.blockedSlot.findUnique({ where: { id } });
    await prisma.blockedSlot.delete({ where: { id } });

    await logAudit({
      action: 'blockedSlot.delete',
      entityType: 'blockedSlot',
      entityId: id,
      message: 'Blocked slot verwijderd',
      data: existing
        ? {
            date: existing.date,
            startTime: existing.startTime,
            endTime: existing.endTime,
            description: existing.reason ?? ''
          }
        : undefined
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return internalError('admin.blockedSlots.delete', err);
  }
}
