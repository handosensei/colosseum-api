import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { Battle } from './battle.entity';
import { Character } from '../character/character.entity';
import { BettingPool } from '../bet/entities/betting-pool.entity';

@Entity({ name: 'participation' })
export class Participation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  battleId!: string;

  @Column('uuid')
  characterId!: string;

  @Column({ type: 'boolean', default: false })
  isWinner!: boolean;

  @ManyToOne(() => Battle, (b) => b.participations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'battleId' })
  battle!: Battle;

  // Character relation may be enabled later if needed
  @ManyToOne(() => Character, (c) => c.participations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'characterId' })
  character!: Character;

  @OneToOne(() => BettingPool, (p) => p.participation)
  pool?: BettingPool;
}
