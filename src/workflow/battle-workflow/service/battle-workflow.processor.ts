import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Battle } from '../../../battle/entities/battle.entity';
import {
  BattleStatusEnum,
  BattleStatusEnum as BattleStatus,
} from '../../../battle/enum/battle-status.enum';
import { BattleStatusStateMachine } from '../battle-status.machine';

@Processor('battle-workflow')
export class BattleWorkflowProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Battle)
    private readonly battleRepo: Repository<Battle>,
    private readonly battleStatusStateMachine: BattleStatusStateMachine,
  ) {
    super();
  }

  // Cette méthode est appelée pour chaque job de la queue "battle-workflow"
  async process(
    job: Job<{ battleId: string; newStatus: BattleStatus }>,
  ): Promise<void> {
    // Optionnel : filtrer par nom de job
    if (job.name !== 'battle-status-changed') {
      return;
    }

    const { battleId, newStatus } = job.data;

    const battle = await this.battleRepo.findOne({ where: { id: battleId } });
    if (!battle) {
      // Ici tu peux logger ou lancer une erreur
      console.warn(
        `[BattleWorkflowProcessor] Battle ${battleId} not found, skipping`,
      );
      return;
    }

    const from = battle.status as BattleStatusEnum;

    // Sécurité supplémentaire (même si transition() throw déjà)
    if (!this.battleStatusStateMachine.canTransition(from, newStatus)) {
      console.warn(
        `[BattleWorkflowProcessor] Invalid transition ${from} -> ${newStatus} for battle ${battleId}`,
      );
      return;
    }

    const to = this.battleStatusStateMachine.transition(from, newStatus, {
      battleId,
    });

    battle.status = to;
    await this.battleRepo.save(battle);

    console.log(
      `[BattleWorkflowProcessor] Battle status ${battleId} moved ${from} -> ${to}`,
    );
  }
}
