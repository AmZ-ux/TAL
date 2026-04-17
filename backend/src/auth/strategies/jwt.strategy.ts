import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_ACCESS_SECRET',
        'access-secret',
      ),
      issuer: 'transport-payments-api',
    });
  }

  validate(payload: JwtPayload) {
    if (!payload?.sub || !payload?.email || !payload?.role) {
      throw new UnauthorizedException('Invalid token payload.');
    }

    if (payload.tokenType && payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid access token.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
