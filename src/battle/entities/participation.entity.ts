import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Battle } from './battle.entity';
import { Character } from './character.entity';

@Entity({ name: 'participation' })
export class Participation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36, name: 'battleId' })
  battleId!: string;

  @Column({ type: 'varchar', length: 36, name: 'characterId' })
  characterId!: string;

  @Column({ type: 'boolean', default: false })
  isWinner!: boolean;

  @ManyToOne(() => Battle, (battle) => battle.participations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'battleId' })
  battle!: Battle;

  // Character relation may be enabled later if needed
  @ManyToOne(() => Character, (character) => character.participations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'characterId' })
  character!: Character;
}
