import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.institution.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            passengers: true,
          },
        },
      },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found.');
    }

    return institution;
  }

  create(dto: CreateInstitutionDto) {
    return this.prisma.institution.create({
      data: {
        name: dto.name,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdateInstitutionDto) {
    await this.ensureInstitutionExists(id);

    return this.prisma.institution.update({
      where: { id },
      data: dto,
    });
  }

  private async ensureInstitutionExists(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!institution) {
      throw new NotFoundException('Institution not found.');
    }
  }
}
