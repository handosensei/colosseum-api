// battle-status.machine.ts
import { Injectable } from '@nestjs/common';
import { BattleStatusEnum as BattleStatus } from '../../battle/enum/battle-status.enum';

export interface BattleContext {
  battleId: string;
  // Tu peux ajouter d'autres infos utiles si besoin (qui a demandé le changement, timestamp, etc.)
}

@Injectable()
export class BattleStatusStateMachine {
  // Déclaration des transitions autorisées
  private readonly allowedTransitions: Record<BattleStatus, BattleStatus[]> = {
    [BattleStatus.PENDING]: [BattleStatus.ACTIVE, BattleStatus.CANCELLED],
    [BattleStatus.ACTIVE]: [BattleStatus.FINISHED, BattleStatus.CANCELLED],
    [BattleStatus.FINISHED]: [BattleStatus.VALIDATED, BattleStatus.CANCELLED],
    [BattleStatus.VALIDATED]: [BattleStatus.ARCHIVED],
    [BattleStatus.ARCHIVED]: [], // état final
    [BattleStatus.CANCELLED]: [], // état final alternatif
  };

  canTransition(from: BattleStatus, to: BattleStatus): boolean {
    return this.allowedTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Valide et retourne le nouvel état.
   * Si la transition est illégale → throw Error
   */
  transition(
    from: BattleStatus,
    to: BattleStatus,
    _ctx: BattleContext,
  ): BattleStatus {
    if (!this.canTransition(from, to)) {
      throw new Error(`Transition invalide: ${from} -> ${to}`);
    }
    // Ici tu pourrais logger/auditer
    return to;
  }
}
