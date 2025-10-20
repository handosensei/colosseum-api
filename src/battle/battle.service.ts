import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

import { BattleCreateDto } from './dto/battle-create.dto';
import { BattleUpdateDto } from './dto/battle-update.dto';
import { Battle } from './entities/battle.entity';
import { Participation } from './entities/participation.entity';

type FindAllParams = { page: number; limit: number; search?: string };

@Injectable()
export class BattleService {
  constructor(
    @InjectRepository(Battle)
    private readonly battleRepo: Repository<Battle>,
    @InjectRepository(Participation)
    private readonly participationRepo: Repository<Participation>,
  ) {}

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
    return await this.battleRepo.save(battle);
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
