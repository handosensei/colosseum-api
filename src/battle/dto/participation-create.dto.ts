import { IsBoolean, IsNotEmpty, IsUUID, IsDefined } from 'class-validator';
import { CharacterExists } from '../validators/character-exists.validator';

export class ParticipationCreateDto {
  @IsUUID()
  @IsNotEmpty()
  @CharacterExists({
    message: 'characterId must reference an existing character',
  })
  characterId!: string;

  @IsBoolean()
  @IsDefined()
  isWinner!: boolean;
}
