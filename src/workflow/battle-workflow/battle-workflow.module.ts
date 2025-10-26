// battle-workflow.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BattleStatusStateMachine } from './battle-status.machine';
import { BattleWorkflowQueueService } from './service/battle-workflow-queue.service';
//
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'battle-workflow', // nom de ta file
    }),
  ],
  providers: [BattleStatusStateMachine, BattleWorkflowQueueService],
  exports: [BattleStatusStateMachine, BattleWorkflowQueueService],
})
export class BattleWorkflowModule {}
