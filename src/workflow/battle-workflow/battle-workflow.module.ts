// battle-workflow.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BattleStatusStateMachine } from './battle-status.machine';
import { BattleWorkflowQueueService } from './service/battle-workflow-queue.service';
import { BattleWorkflowProcessor } from './service/battle-workflow.processor';
import { Battle } from '../../battle/entities/battle.entity';
//
@Module({
  imports: [
    TypeOrmModule.forFeature([Battle]),
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
  providers: [
    BattleStatusStateMachine,
    BattleWorkflowQueueService,
    BattleWorkflowProcessor,
  ],
  exports: [
    BattleStatusStateMachine,
    BattleWorkflowQueueService,
    BattleWorkflowProcessor,
  ],
})
export class BattleWorkflowModule {}
