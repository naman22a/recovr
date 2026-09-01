import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MikroOrmModule.forRoot(),
        WebhooksModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
