import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudflareStreamService } from './service/cloudflare-stream.service';
import { CloudflareWebhookController } from './controllers/cloudflare-webhook.controller';
import { Battle } from '../battle/entities/battle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Battle])
  ],
  providers: [CloudflareStreamService],
  exports: [CloudflareStreamService],
  controllers: [CloudflareWebhookController],
})
export class ClientModule {}
