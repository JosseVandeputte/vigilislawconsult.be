import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdminToken } from '@/lib/admin-auth';
import { logAudit } from '@/lib/audit';
import { internalError } from '@/lib/api-error';

const UpdateSchema = z.object({
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige invoer.' }, { status: 400 });
  }

  try {
    const token = await prisma.token.update({
      where: { id },
      data: {
        isActive: parsed.data.isActive,
        expiresAt: parsed.data.expiresAt === undefined
          ? undefined
          : parsed.data.expiresAt
            ? new Date(parsed.data.expiresAt)
            : null
      }
    });

    await logAudit({
      action: 'token.update',
      entityType: 'token',
      entityId: token.id,
      message: `Token bijgewerkt (${token.name})`,
      data: {
        name: token.name,
        value: token.value,
        isActive: token.isActive,
        expiresAt: token.expiresAt
      }
    });

    return NextResponse.json({ token });
  } catch (err) {
    return internalError('admin.tokens.update', err);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminToken(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const deleted = await prisma.token.delete({ where: { id } });
    await logAudit({
      action: 'token.delete',
      entityType: 'token',
      entityId: id,
      message: `Token verwijderd (${deleted.name})`,
      data: {
        name: deleted.name,
        value: deleted.value,
        expiresAt: deleted.expiresAt
      }
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return internalError('admin.tokens.delete', err);
  }
}
