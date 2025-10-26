import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet, BetStatus } from '../entities/bet.entity';
import { BettingPool } from '../entities/betting-pool.entity';
import { Participation } from '../../battle/entities/participation.entity';
import { Battle } from '../../battle/entities/battle.entity';
import { BattleStatusEnum as BattleStatus } from '../../battle/enum/battle-status.enum';
import { BetCreateDto } from '../dto/bet-create.dto';

@Injectable()
export class BetService {
  constructor(
    @InjectRepository(Bet)
    private readonly betRepo: Repository<Bet>,
    @InjectRepository(BettingPool)
    private readonly poolRepo: Repository<BettingPool>,
    @InjectRepository(Participation)
    private readonly participationRepo: Repository<Participation>,
    @InjectRepository(Battle)
    private readonly battleRepo: Repository<Battle>,
  ) {}

  async create(userId: string, dto: BetCreateDto) {
    // Validate participation
    const participation = await this.participationRepo.findOne({
      where: { id: dto.participationId },
      select: ['id', 'battleId'],
    });
    if (!participation) throw new NotFoundException('Participation not found');

    // Validate battle status (allow betting only when pending)
    const battle = await this.battleRepo.findOne({
      where: { id: participation.battleId },
      select: ['id', 'status'],
    });
    if (!battle) throw new NotFoundException('Battle not found');
    if (battle.status !== BattleStatus.PENDING) {
      throw new BadRequestException('Betting is closed for this battle');
    }

    // Validate amount > 0
    const amountNum = Number(dto.stakedPoints);
    if (!isFinite(amountNum) || amountNum <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }

    // Create a bet
    const bet = this.betRepo.create({
      userId,
      battleId: battle.id,
      participationId: participation.id,
      stakedPoints: dto.stakedPoints,
      status: BetStatus.PENDING,
    });
    const saved = await this.betRepo.save(bet);

    // Ensure pool exists then update aggregate totals using raw SQL arithmetic
    await this.ensurePool(participation.id);
    await this.poolRepo.query(
      'UPDATE betting_pool SET totalVolume = totalVolume + ?, betsCount = betsCount + 1 WHERE participationId = ?',
      [dto.stakedPoints, participation.id],
    );

    return saved;
  }

  private async ensurePool(participationId: string) {
    // Try to find existing; if not, create. Unique constraint prevents duplicates.
    const existing = await this.poolRepo.findOne({
      where: { participationId },
    });
    if (!existing) {
      try {
        await this.poolRepo.insert({
          participationId,
          totalVolume: '0',
          betsCount: 0,
        });
      } catch {
        // ignore duplicate key
      }
    }
  }
}
