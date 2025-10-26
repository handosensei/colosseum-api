// service.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BattleStatusEnum as BattleStatus } from '../../../battle/enum/battle-status.enum';

@Injectable()
export class BattleWorkflowQueueService {
  constructor(
    @InjectQueue('battle-workflow')
    private readonly battleWorkflowQueue: Queue,
  ) {}

  async handleBattleStatusChange(battleId: string, newStatus: BattleStatus) {
    // On envoie un job dans la queue asynchrone.
    // Chaque status peut déclencher une logique différente.
    await this.battleWorkflowQueue.add(
      'battle-status-changed',
      {
        battleId,
        newStatus,
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}
