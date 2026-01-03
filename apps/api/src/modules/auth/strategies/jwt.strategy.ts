import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.authService.validateUser(payload.sub);

        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException();
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
}
