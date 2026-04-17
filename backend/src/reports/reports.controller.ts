import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MonthlyReportQueryDto } from './dto/monthly-report-query.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  async downloadMonthlyPdf(
    @Query() query: MonthlyReportQueryDto,
    @Res() res: Response,
  ) {
    const report = await this.reportsService.buildMonthlyPdf(query);

    res.setHeader('Content-Type', report.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.filename}"`,
    );
    res.send(report.buffer);
  }

  @Get('monthly/csv')
  async downloadMonthlyCsv(
    @Query() query: MonthlyReportQueryDto,
    @Res() res: Response,
  ) {
    const report = await this.reportsService.buildMonthlyCsv(query);

    res.setHeader('Content-Type', report.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.filename}"`,
    );
    res.send(report.csv);
  }
}
