import {
  IsArray,
  ArrayNotEmpty,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsDateString,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ParticipationCreateDto } from './participation-create.dto';
import { IsFutureDate } from '../validators/is-future-date.validator';
import { ExactlyOneWinner } from '../validators/exactly-one-winner.validator';

export class BattleCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  // ISO 8601 date-time string
  @IsDateString()
  @IsNotEmpty()
  @IsFutureDate({ message: 'startTime must be in the future' })
  startTime!: string;

  // List of participant objects { characterId, isWinner }
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @ExactlyOneWinner()
  @Type(() => ParticipationCreateDto)
  participations!: ParticipationCreateDto[];
}
