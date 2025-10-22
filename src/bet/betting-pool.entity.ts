// src/betting/betting-pool.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Participation } from '../battle/participation.entity';

@Entity({ name: 'betting_pool' })
@Unique(['participationId']) // garantit un seul pool par outcome
export class BettingPool {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  participationId!: string;

  @Column('decimal', { precision: 18, scale: 6, default: 0 })
  totalVolume!: string; // stocké en string pour éviter la perte de précision

  @Column({ type: 'int', default: 0 })
  betsCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 1–1 avec Participation
  @OneToOne(() => Participation, (p) => p.pool)
  @JoinColumn({ name: 'participationId' })
  participation!: Participation;
}
