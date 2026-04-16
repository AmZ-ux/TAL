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
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { ListPassengersQueryDto } from './dto/list-passengers-query.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';
import { PassengersService } from './passengers.service';

@Controller('passengers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PassengersController {
  constructor(private readonly passengersService: PassengersService) {}

  @Get()
  findAll(@Query() query: ListPassengersQueryDto) {
    return this.passengersService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.passengersService.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePassengerDto) {
    return this.passengersService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePassengerDto,
  ) {
    return this.passengersService.update(id, dto);
  }
}
