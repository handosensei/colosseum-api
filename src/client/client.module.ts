import { Module } from '@nestjs/common';
import { CloudflareStreamService } from './service/cloudflare-stream.service';
import { CloudflareWebhookController } from './controllers/cloudflare-webhook.controller';

@Module({
  providers: [CloudflareStreamService],
  exports: [CloudflareStreamService],
  controllers: [CloudflareWebhookController],
})
export class ClientModule {}
