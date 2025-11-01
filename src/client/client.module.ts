import { Module } from '@nestjs/common';
import { CloudflareStreamService } from './service/cloudflare-stream.service';

@Module({
  providers: [CloudflareStreamService],
  exports: [CloudflareStreamService],
})
export class ClientModule {}
