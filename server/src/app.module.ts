import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        WebhooksModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
