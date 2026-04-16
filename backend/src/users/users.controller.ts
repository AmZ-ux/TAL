import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  getUsers(@Query('role') role?: Role) {
    return this.usersService.findAll(role);
  }

  @Get('admin-only')
  @Roles(Role.ADMIN)
  getAdminOnlyMessage() {
    return { message: 'Only ADMIN users can access this route.' };
  }
}
