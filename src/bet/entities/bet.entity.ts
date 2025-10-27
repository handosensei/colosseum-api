// src/betting/bet.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Participation } from '../../battle/entities/participation.entity';
import { Battle } from '../../battle/entities/battle.entity';
import { User } from '../../user/entity/user.entity';

export enum BetStatus {
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  SETTLED = 'settled',
}

@Entity({ name: 'bet' })
@Index(['userId'])
@Index(['battleId'])
@Index(['participationId'])
@Index(['status'])
export class Bet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('uuid')
  battleId!: string;

  // 🔁 outcome ciblé = participation au combat
  @Column('uuid')
  participationId!: string;

  @Column('integer')
  stakedPoints!: number;

  @Column({ type: 'enum', enum: BetStatus, default: BetStatus.PENDING })
  status!: BetStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Participation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participationId' })
  participation!: Participation;

  @ManyToOne(() => Battle, (b) => b.bets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'battleId' })
  battle!: Battle;

  @ManyToOne(() => User, (u) => u.bets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
