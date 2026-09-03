import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

declare global {
    namespace Express {
        export interface Request {
            rawBody?: Buffer;
        }
    }
}

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        rawBody: true,
    });
    app.enableCors({
        origin: [process.env.CLIENT_URL!],
    });
    await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
