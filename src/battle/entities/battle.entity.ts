import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Character } from './character.entity';

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

  @Column({ type: 'enum', enum: BattleType, default: BattleType.DUEL })
  type!: BattleType;

  @Column({ type: 'datetime' })
  startTime!: Date;

  @Column({ type: 'enum', enum: BattleStatus, default: BattleStatus.PENDING })
  status!: BattleStatus;

  @ManyToOne(() => Character, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'winnerId' })
  winner!: Character | null;

  @Column({ type: 'enum', enum: BettingType, default: BettingType.PARIMUTUEL })
  bettingType!: BettingType;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @ManyToMany(() => Character, (character) => character.battles)
  @JoinTable({
    name: 'battle_participants',
    joinColumn: { name: 'battleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'characterId', referencedColumnName: 'id' },
  })
  participants!: Character[];
}
