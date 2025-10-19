import { Injectable } from '@nestjs/common';
import { BattleCreateDto } from './dto/battle-create.dto';
import { BattleUpdateDto } from './dto/battle-update.dto';

@Injectable()
export class BattleService {
  create(createBattleDto: BattleCreateDto) {
    return 'This action adds a new battle';
  }

  findAll() {
    return `This action returns all battle`;
  }

  findOne(id: string) {
    return `This action returns a #${id} battle`;
  }

  update(id: string, updateBattleDto: BattleUpdateDto) {
    return `This action updates a #${id} battle`;
  }

  remove(id: string) {
    return `This action removes a #${id} battle`;
  }
}
