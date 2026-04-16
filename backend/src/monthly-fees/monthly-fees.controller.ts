import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ListMonthlyFeesQueryDto } from './dto/list-monthly-fees-query.dto';
import { MonthlyFeesService } from './monthly-fees.service';

@Controller('monthly-fees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MonthlyFeesController {
  constructor(private readonly monthlyFeesService: MonthlyFeesService) {}

  @Get()
  findAll(@Query() query: ListMonthlyFeesQueryDto) {
    return this.monthlyFeesService.findAll(query);
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id', ParseUUIDPipe) id: string) {
    return this.monthlyFeesService.markAsPaid(id);
  }
}
