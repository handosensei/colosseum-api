import {
  IsArray,
  ArrayNotEmpty,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class BattleCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  // ISO 8601 date-time string
  @IsDateString()
  @IsNotEmpty()
  startTime!: string;

  // List of participant character UUIDs
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(4, { each: true })
  participations!: string[];
}
