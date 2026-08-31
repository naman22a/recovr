import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare global {
    namespace Express {
        export interface Request {
            rawBody?: Buffer;
        }
    }
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true });
    await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
