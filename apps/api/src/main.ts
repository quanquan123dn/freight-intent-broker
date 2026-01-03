import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Security
    app.use(helmet());
    app.use(cookieParser());

    // CORS - allow from nginx proxy
    app.enableCors({
        origin: configService.get('CORS_ORIGIN', 'http://localhost'),
        credentials: true,
    });

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    const port = configService.get('PORT', 3001);
    await app.listen(port);
    console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();
