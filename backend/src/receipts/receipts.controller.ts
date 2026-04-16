import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApproveReceiptDto } from './dto/approve-receipt.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { ListReceiptsQueryDto } from './dto/list-receipts-query.dto';
import { RejectReceiptDto } from './dto/reject-receipt.dto';
import { ReceiptsService } from './receipts.service';

@Controller('receipts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  @Roles(Role.PASSENGER)
  create(@Body() dto: CreateReceiptDto, @CurrentUser() user: JwtPayload) {
    return this.receiptsService.create(dto, user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PASSENGER)
  findAll(
    @Query() query: ListReceiptsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.receiptsService.findAll(query, user);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveReceiptDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.receiptsService.approve(id, dto, user.sub);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectReceiptDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.receiptsService.reject(id, dto, user.sub);
  }
}
