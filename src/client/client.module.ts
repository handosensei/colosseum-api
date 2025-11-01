import { Module } from '@nestjs/common';
import { CloudflareStreamService } from './cloudflare-stream/cloudflare-stream.service';

@Module({
  providers: [CloudflareStreamService],
  exports: [CloudflareStreamService],
})
export class ClientModule {}
