import { Injectable } from '@nestjs/common';
import { CreateBattleDto } from './dto/create-battle.dto';
import { UpdateBattleDto } from './dto/update-battle.dto';

@Injectable()
export class BattleService {
  create(createBattleDto: CreateBattleDto) {
    return 'This action adds a new battle';
  }

  findAll() {
    return `This action returns all battle`;
  }

  findOne(id: string) {
    return `This action returns a #${id} battle`;
  }

  update(id: string, updateBattleDto: UpdateBattleDto) {
    return `This action updates a #${id} battle`;
  }

  remove(id: string) {
    return `This action removes a #${id} battle`;
  }
}
