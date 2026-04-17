import { Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AutomationService } from './automation.service';

@Controller('automation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('charges/run')
  runCharges() {
    return this.automationService.triggerChargesManually();
  }
}
