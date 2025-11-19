import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudflareStreamService } from './service/cloudflare-stream.service';
import { CloudflareWebhookController } from './controllers/cloudflare-webhook.controller';
import { Battle } from '../battle/entities/battle.entity';
import { BattleWorkflowModule } from '../workflow/battle-workflow/battle-workflow.module';

@Module({
  imports: [TypeOrmModule.forFeature([Battle]), BattleWorkflowModule],
  providers: [CloudflareStreamService],
  exports: [CloudflareStreamService],
  controllers: [CloudflareWebhookController],
})
export class ClientModule {}
