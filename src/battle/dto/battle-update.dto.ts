import { PartialType } from '@nestjs/mapped-types';
import { BattleCreateDto } from './battle-create.dto';

export class BattleUpdateDto extends PartialType(BattleCreateDto) {}
