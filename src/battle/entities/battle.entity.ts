import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Participation } from './participation.entity';
import { Bet } from '../../bet/entities/bet.entity';
import { BattleStatusEnum } from '../enum/battle-status.enum';

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

export enum VideoStatus {
  NONE = 'none', // aucune vidéo déclarée
  UPLOADING = 'uploading', // l'admin a lancé l'upload chez Cloudflare
  READY = 'ready', // Cloudflare a fini l'encodage
  ERROR = 'error', // encodage raté
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
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.NONE,
  })
  videoStatus: VideoStatus;

  @Column({
    type: 'simple-enum',
    enum: BattleStatusEnum,
    default: BattleStatusEnum.PENDING,
  })
  status!: BattleStatusEnum;

  @Column({
    type: 'simple-enum',
    enum: BettingType,
    default: BettingType.PARIMUTUEL,
  })
  bettingType!: BettingType;

  @Column({ type: 'varchar', nullable: true })
  streamPlaybackId?: string | null;
  // Cloudflare Stream te renvoie un playback ID (c’est ce que tu utilises pour lire la vidéo)

  @Column({ nullable: true })
  streamUid?: string;
  // ID interne Cloudflare Stream de l’asset (utile pour debug / suppression / stats)

  @Column({ type: 'int', nullable: true })
  durationSec?: number;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ nullable: true })
  streamPlaybackHls?: string;

  @Column({ nullable: true })
  streamPlaybackDash?: string;

  @OneToMany(() => Participation, (p) => p.battle, { cascade: ['insert'] })
  participations: Participation[];

  @OneToMany(() => Bet, (b) => b.battle, { cascade: ['insert'] })
  bets: Bet[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
