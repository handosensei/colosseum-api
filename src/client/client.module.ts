import { Module } from '@nestjs/common';
import { CloudflareStreamService } from './cloudflare-stream/cloudflare-stream.service';

@Module({
  providers: [CloudflareStreamService],
})
export class ClientModule {}
