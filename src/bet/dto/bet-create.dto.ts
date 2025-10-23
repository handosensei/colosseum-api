import { IsUUID, IsString, Matches } from 'class-validator';

// amount as decimal string: positive, up to 18,6
const DECIMAL_REGEX = /^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/;

export class BetCreateDto {
  @IsUUID()
  participationId!: string;

  @IsString()
  @Matches(DECIMAL_REGEX, {
    message: 'amount must be a positive decimal string with up to 6 decimals',
  })
  amount!: string; // stored as string to preserve DECIMAL precision
}
