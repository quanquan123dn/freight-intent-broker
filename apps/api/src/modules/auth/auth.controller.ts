import {
    Controller,
    Post,
    Body,
    Res,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

class RegisterDto {
    email: string;
    password: string;
    role: 'SHIPPER' | 'BUYER';
    companyName?: string;
}

class LoginDto {
    email: string;
    password: string;
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('register')
    async register(@Body() dto: RegisterDto, @Res() res: Response) {
        const result = await this.authService.register(dto);
        this.setRefreshTokenCookie(res, result.refreshToken);

        return res.json({
            accessToken: result.accessToken,
            user: result.user,
        });
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const deviceId = req.headers['x-device-id'] as string;
        const result = await this.authService.login(dto, deviceId);
        this.setRefreshTokenCookie(res, result.refreshToken);

        return res.json({
            accessToken: result.accessToken,
            user: result.user,
        });
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token' });
        }

        const deviceId = req.headers['x-device-id'] as string;
        const result = await this.authService.refreshTokens(refreshToken, deviceId);
        this.setRefreshTokenCookie(res, result.refreshToken);

        return res.json({
            accessToken: result.accessToken,
            user: result.user,
        });
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        res.clearCookie('refreshToken');
        return res.json({ success: true });
    }

    @Post('logout-all')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logoutAll(@CurrentUser() user: { id: string }, @Res() res: Response) {
        await this.authService.logoutAll(user.id);
        res.clearCookie('refreshToken');
        return res.json({ success: true });
    }

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        const isProduction = this.configService.get('NODE_ENV') === 'production';

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/',
        });
    }
}
