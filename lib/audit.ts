import prisma from '@/lib/prisma';

type AuditParams = {
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  data?: Record<string, unknown>;
};

export const logAudit = async (params: AuditParams) => {
  await prisma.auditLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      message: params.message,
      data: params.data ?? undefined
    }
  });
};
