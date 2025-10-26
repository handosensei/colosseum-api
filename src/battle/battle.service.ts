import {
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

import { BattleCreateDto } from './dto/battle-create.dto';
import { BattleUpdateDto } from './dto/battle-update.dto';

import { BattleStatusEnum as BattleStatus } from './enum/battle-status.enum';

import { Battle } from './entities/battle.entity';

import { BettingPoolService } from '../bet/service/betting-pool.service';

import { BattleStatusStateMachine } from '../workflow/battle-workflow/battle-status.machine';
import { BattleWorkflowQueueService } from '../workflow/battle-workflow/service/battle-workflow-queue.service';

type FindAllParams = { page: number; limit: number; search?: string };

@Injectable()
export class BattleService {
  constructor(
    @InjectRepository(Battle)
    private readonly battleRepo: Repository<Battle>,
    private readonly bettingPoolService: BettingPoolService,
    private readonly battleStateMachine: BattleStatusStateMachine,
    private readonly battleWorkflowQueue: BattleWorkflowQueueService,
  ) {}

  async findNext(): Promise<Battle | null> {
    const now = new Date();
    return this.battleRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.participations', 'p')
      .leftJoinAndSelect('p.pool', 'po')
      .leftJoinAndSelect('p.character', 'c')
      .where('b.startTime > :now', { now })
      .orderBy('b.startTime', 'ASC')
      .getOne();
  }

  async create(battleCreateDto: BattleCreateDto) {
    const ids = battleCreateDto.participations.map((p) => p.characterId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Duplicate characterId in participations');
    }

    const battle = this.battleRepo.create({
      title: battleCreateDto.title,
      startTime: new Date(battleCreateDto.startTime),
      participations: battleCreateDto.participations.map((p) => ({
        character: { id: p.characterId },
        isWinner: p.isWinner,
      })),
    });

    const saved = await this.battleRepo.save(battle);

    const reloaded = await this.battleRepo.findOne({
      where: { id: saved.id },
      relations: { participations: true },
      select: { id: true, participations: { id: true } },
    });

    await this.bettingPoolService.ensurePoolsForBattle(reloaded!);

    return reloaded;
  }

  async findAll({
    page,
    limit,
    search,
  }: FindAllParams): Promise<Pagination<Battle>> {
    const qb = this.battleRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.participations', 'p')
      .orderBy('b.startTime', 'DESC');

    if (search?.trim()) {
      qb.andWhere('LOWER(b.title) LIKE :q', { q: `%${search.toLowerCase()}%` });
    }

    return paginate<Battle>(qb, { page, limit, route: '/battles' });
  }

  async updateStatus(battleId: string, requestedStatus: BattleStatus) {
    const battle = await this.battleRepo.findOne({ where: { id: battleId } });
    if (!battle) {
      throw new NotFoundException('Battle not found');
    }

    // 1. Vérifier la transition métier
    let newStatus: BattleStatus;
    try {
      newStatus = this.battleStateMachine.transition(
        battle.status,
        requestedStatus,
        { battleId },
      );
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }

    // 2. Persister le nouvel état
    battle.status = newStatus;
    const saved = await this.battleRepo.save(battle);

    // 3. Déclencher l'asynchrone (BullMQ)
    await this.battleWorkflowQueue.handleBattleStatusChange(
      battle.id,
      newStatus,
    );

    return saved;
  }

  findOne(id: string) {
    return `This action returns a #${id} battle`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: string, _updateBattleDto: BattleUpdateDto) {
    return `This action updates a #${id} battle`;
  }

  remove(id: string) {
    return `This action removes a #${id} battle`;
  }
}
