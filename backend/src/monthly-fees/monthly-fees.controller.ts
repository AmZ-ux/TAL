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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ListMonthlyFeesQueryDto } from './dto/list-monthly-fees-query.dto';
import { MonthlyFeesService } from './monthly-fees.service';

@Controller('monthly-fees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonthlyFeesController {
  constructor(private readonly monthlyFeesService: MonthlyFeesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.PASSENGER)
  findAll(
    @Query() query: ListMonthlyFeesQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.monthlyFeesService.findAll(query, user);
  }

  @Patch(':id/pay')
  @Roles(Role.ADMIN)
  markAsPaid(@Param('id', ParseUUIDPipe) id: string) {
    return this.monthlyFeesService.markAsPaid(id);
  }
}
