import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { ListPassengersQueryDto } from './dto/list-passengers-query.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';

const passengerSelection = {
  id: true,
  fullName: true,
  phone: true,
  email: true,
  course: true,
  shift: true,
  boardingPoint: true,
  notes: true,
  status: true,
  institutionId: true,
  createdAt: true,
  updatedAt: true,
  institution: {
    select: {
      id: true,
      name: true,
      status: true,
    },
  },
} satisfies Prisma.PassengerProfileSelect;

@Injectable()
export class PassengersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListPassengersQueryDto) {
    const where: Prisma.PassengerProfileWhereInput = {
      ...(query.search
        ? {
            fullName: {
              contains: query.search,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.institutionId ? { institutionId: query.institutionId } : {}),
    };

    return this.prisma.passengerProfile.findMany({
      where,
      select: passengerSelection,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const passenger = await this.prisma.passengerProfile.findUnique({
      where: { id },
      select: passengerSelection,
    });

    if (!passenger) {
      throw new NotFoundException('Passenger not found.');
    }

    return passenger;
  }

  async create(dto: CreatePassengerDto) {
    await this.ensureInstitutionExists(dto.institutionId);

    return this.prisma.passengerProfile.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        course: dto.course,
        shift: dto.shift,
        boardingPoint: dto.boardingPoint,
        notes: dto.notes,
        status: dto.status,
        institutionId: dto.institutionId,
      },
      select: passengerSelection,
    });
  }

  async update(id: string, dto: UpdatePassengerDto) {
    await this.ensurePassengerExists(id);

    if (dto.institutionId) {
      await this.ensureInstitutionExists(dto.institutionId);
    }

    return this.prisma.passengerProfile.update({
      where: { id },
      data: dto,
      select: passengerSelection,
    });
  }

  private async ensureInstitutionExists(institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found.');
    }
  }

  private async ensurePassengerExists(id: string) {
    const passenger = await this.prisma.passengerProfile.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!passenger) {
      throw new NotFoundException('Passenger not found.');
    }
  }
}
