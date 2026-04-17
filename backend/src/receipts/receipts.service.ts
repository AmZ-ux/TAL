import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReceiptStatus, Role, Status } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApproveReceiptDto } from './dto/approve-receipt.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { ListReceiptsQueryDto } from './dto/list-receipts-query.dto';
import { RejectReceiptDto } from './dto/reject-receipt.dto';

const receiptSelection = {
  id: true,
  monthlyFeeId: true,
  fileUrl: true,
  fileType: true,
  status: true,
  rejectionReason: true,
  adminNotes: true,
  uploadedAt: true,
  analyzedAt: true,
  analyzedBy: true,
  monthlyFee: {
    select: {
      id: true,
      referenceMonth: true,
      amount: true,
      dueDate: true,
      status: true,
      paymentDate: true,
      passenger: {
        select: {
          id: true,
          fullName: true,
          userId: true,
        },
      },
    },
  },
  analyzedByUser: {
    select: {
      id: true,
      email: true,
    },
  },
} satisfies Prisma.ReceiptSelect;

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateReceiptDto, user: JwtPayload) {
    const monthlyFee = await this.prisma.monthlyFee.findUnique({
      where: { id: dto.monthlyFeeId },
      select: {
        id: true,
        passenger: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!monthlyFee) {
      throw new NotFoundException('Monthly fee not found.');
    }

    if (monthlyFee.passenger.userId !== user.sub) {
      throw new ForbiddenException(
        'You cannot upload receipt for this monthly fee.',
      );
    }

    const existingPendingReceipt = await this.prisma.receipt.findFirst({
      where: {
        monthlyFeeId: dto.monthlyFeeId,
        status: ReceiptStatus.PENDING,
      },
      select: { id: true },
    });

    if (existingPendingReceipt) {
      throw new BadRequestException(
        'A pending receipt already exists for this monthly fee.',
      );
    }

    return this.prisma.receipt.create({
      data: {
        monthlyFeeId: dto.monthlyFeeId,
        fileUrl: dto.fileUrl,
        fileType: dto.fileType,
      },
      select: receiptSelection,
    });
  }

  async findAll(query: ListReceiptsQueryDto, user: JwtPayload) {
    const where: Prisma.ReceiptWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(user.role === Role.PASSENGER
        ? {
            monthlyFee: {
              passenger: {
                userId: user.sub,
              },
            },
          }
        : {}),
    };

    const receipts = await this.prisma.receipt.findMany({
      where,
      select: receiptSelection,
      orderBy: [{ status: 'asc' }, { uploadedAt: 'desc' }],
    });

    return receipts;
  }

  async approve(id: string, dto: ApproveReceiptDto, adminId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        monthlyFeeId: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found.');
    }

    if (receipt.status !== ReceiptStatus.PENDING) {
      throw new BadRequestException('Only pending receipts can be approved.');
    }

    const now = new Date();

    const [updatedReceipt] = await this.prisma.$transaction([
      this.prisma.receipt.update({
        where: { id },
        data: {
          status: ReceiptStatus.APPROVED,
          analyzedAt: now,
          analyzedBy: adminId,
          rejectionReason: null,
          adminNotes: dto.adminNotes,
        },
        select: receiptSelection,
      }),
      this.prisma.monthlyFee.update({
        where: { id: receipt.monthlyFeeId },
        data: {
          status: Status.PAID,
          paymentDate: now,
        },
      }),
    ]);

    await this.auditLogsService.createLog({
      actorId: adminId,
      action: 'RECEIPT_APPROVED',
      entity: 'Receipt',
      entityId: updatedReceipt.id,
      payload: {
        monthlyFeeId: updatedReceipt.monthlyFeeId,
        analyzedAt: updatedReceipt.analyzedAt?.toISOString() ?? null,
      },
    });

    return updatedReceipt;
  }

  async reject(id: string, dto: RejectReceiptDto, adminId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found.');
    }

    if (receipt.status !== ReceiptStatus.PENDING) {
      throw new BadRequestException('Only pending receipts can be rejected.');
    }

    const updatedReceipt = await this.prisma.receipt.update({
      where: { id },
      data: {
        status: ReceiptStatus.REJECTED,
        rejectionReason: dto.rejectionReason,
        analyzedAt: new Date(),
        analyzedBy: adminId,
        adminNotes: dto.adminNotes,
      },
      select: receiptSelection,
    });

    await this.auditLogsService.createLog({
      actorId: adminId,
      action: 'RECEIPT_REJECTED',
      entity: 'Receipt',
      entityId: updatedReceipt.id,
      payload: {
        monthlyFeeId: updatedReceipt.monthlyFeeId,
        reason: updatedReceipt.rejectionReason,
      },
    });

    return updatedReceipt;
  }
}
