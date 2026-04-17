import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';

const auditLogSelection = {
  id: true,
  actorId: true,
  action: true,
  entity: true,
  entityId: true,
  payload: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.AuditLogSelect;

export type AuditLogInput = {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  payload?: Prisma.InputJsonValue;
};

function getDateRange(dateIso: string) {
  const base = new Date(dateIso);
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    23,
    59,
    59,
    999,
  );

  return { start, end };
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  createLog(input: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        payload: input.payload,
      },
      select: { id: true },
    });
  }

  findAll(query: ListAuditLogsQueryDto) {
    const dateRange = query.date ? getDateRange(query.date) : null;

    return this.prisma.auditLog.findMany({
      where: {
        ...(query.user ? { actorId: query.user } : {}),
        ...(query.action
          ? {
              action: {
                equals: query.action,
                mode: 'insensitive',
              },
            }
          : {}),
        ...(dateRange
          ? {
              createdAt: {
                gte: dateRange.start,
                lte: dateRange.end,
              },
            }
          : {}),
      },
      select: auditLogSelection,
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
  }
}
