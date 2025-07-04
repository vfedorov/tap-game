import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        allowedHeaders: '*',
        origin: '*',
        credentials: true,
    });
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3000; // Значение по умолчанию 3000
    await app.listen(port);
}
bootstrap();