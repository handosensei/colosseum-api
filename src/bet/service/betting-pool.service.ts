import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BettingPool } from '../entities/betting-pool.entity';
import { Battle } from '../../battle/entities/battle.entity';

@Injectable()
export class BettingPoolService {
  private readonly logger = new Logger(BettingPoolService.name);

  constructor(
    @InjectRepository(BettingPool)
    private readonly poolRepo: Repository<BettingPool>,
  ) {}

  // Ensure there is one betting pool per participation for a given battle
  async ensurePoolsForBattle(battle: Battle): Promise<void> {
    let participationIds: string[] = [];
    const parts = battle.participations;
    participationIds = parts.map((p) => p.id);

    if (!participationIds.length) return;

    try {
      await Promise.all(
        participationIds.map((pid) =>
          this.poolRepo.upsert({ participationId: pid }, ['participationId']),
        ),
      );
    } catch (e) {
      this.logger.warn(
        `ensurePoolsForBattle error: ${e instanceof Error ? e.message : e}`,
      );
      throw e;
    }
  }
}
