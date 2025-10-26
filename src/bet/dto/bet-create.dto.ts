import { IsUUID, IsInt } from 'class-validator';

export class BetCreateDto {
  @IsUUID()
  participationId!: string;

  @IsInt()
  stakedPoints!: number;
}
