import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import type { SignOptions } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.usersService.updateRefreshTokenHash(
      user.id,
      await hash(tokens.refreshToken, 12),
    );

    await this.auditLogsService.createLog({
      actorId: user.id,
      action: 'AUTH_LOGIN',
      entity: 'User',
      entityId: user.id,
      payload: {
        email: user.email,
        role: user.role,
      },
    });

    return {
      ...tokens,
      user: await this.usersService.findById(user.id),
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'refresh-secret',
        ),
        issuer: 'transport-payments-api',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const userWithHash = await this.usersService.findByEmail(payload.email);
    if (!userWithHash?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token not registered.');
    }

    const tokenMatches = await compare(
      refreshToken,
      userWithHash.refreshTokenHash,
    );
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.usersService.updateRefreshTokenHash(
      user.id,
      await hash(tokens.refreshToken, 12),
    );

    return {
      ...tokens,
      user,
    };
  }

  async me(userId: string) {
    return this.usersService.findById(userId);
  }

  private async generateTokens(payload: JwtPayload) {
    const accessExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m',
    ) as SignOptions['expiresIn'];

    const refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    ) as SignOptions['expiresIn'];

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, tokenType: 'refresh' as const },
      {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'refresh-secret',
        ),
        expiresIn: refreshExpiresIn,
        subject: payload.sub,
        issuer: 'transport-payments-api',
      },
    );

    const accessWithType = await this.jwtService.signAsync(
      { ...payload, tokenType: 'access' as const },
      {
        secret: this.configService.get<string>(
          'JWT_ACCESS_SECRET',
          'access-secret',
        ),
        expiresIn: accessExpiresIn,
        subject: payload.sub,
        issuer: 'transport-payments-api',
      },
    );

    return { accessToken: accessWithType, refreshToken };
  }
}
