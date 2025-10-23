import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Participation } from './participation.entity';
import { Bet } from '../bet/entities/bet.entity';

export enum BattleStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export enum BattleType {
  DUEL = 'duel',
  // TEAM_BATTLE = 'TEAM_BATTLE',
  // BATTLE_ROYALE = 'BATTLE_ROYALE',
}

export enum BettingType {
  PARIMUTUEL = 'parimutuel',
  // AMM = 'amm',
  // FIXED_ODDS = 'FIXED_ODDS',
}

@Entity({ name: 'battle' })
export class Battle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'simple-enum', enum: BattleType, default: BattleType.DUEL })
  type!: BattleType;

  @Column({ type: 'datetime' })
  startTime!: Date;

  @Column({
    type: 'simple-enum',
    enum: BattleStatus,
    default: BattleStatus.PENDING,
  })
  status!: BattleStatus;

  @Column({
    type: 'simple-enum',
    enum: BettingType,
    default: BettingType.PARIMUTUEL,
  })
  bettingType!: BettingType;

  @OneToMany(() => Participation, (p) => p.battle, { cascade: ['insert'] })
  participations: Participation[];

  @OneToMany(() => Bet, (b) => b.battle, { cascade: ['insert'] })
  bets: Bet[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
