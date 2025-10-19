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

export enum BattleType {
  DUEL = 'DUEL',
  FREE_FOR_ALL = 'FREE_FOR_ALL',
}

export enum BattleStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

export enum BettingType {
  PARIMUTUEL = 'PARIMUTUEL',
  FIXED_ODDS = 'FIXED_ODDS',
}

@Entity({ name: 'battle' })
export class Battle {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'enum', enum: BattleType })
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
