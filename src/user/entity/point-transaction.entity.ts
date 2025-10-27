import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Battle } from '../../battle/entities/battle.entity';
import { Bet } from '../../bet/entities/bet.entity';

export enum PointTransactionType {
  INITIAL_GRANT = 'initial_grant', // points de départ
  BET_STAKE = 'bet_stake', // on retire des points quand il mise
  BET_PAYOUT = 'bet_payout', // on crédite quand il gagne
  BET_REFUND = 'bet_refund', // on crédite si pari remboursé
  ADMIN_ADJUST = 'admin_adjust', // ajustement manuel modération
}

@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.pointTransactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  // type de mouvement
  @Column({
    type: 'enum',
    enum: PointTransactionType,
  })
  type: PointTransactionType;

  // Montant du mouvement.
  // Positif = on ajoute des points au joueur.
  // Négatif = on retire des points du joueur.
  @Column({ type: 'integer' })
  amount: number;

  // Solde APRÈS application de ce mouvement.
  // Permet de reconstituer l'historique exact du wallet de l'user.
  @Column({ type: 'integer' })
  balanceAfter: number;

  // rattacher à un combat si pertinent (facilite l'audit)
  @ManyToOne(() => Battle, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'battleId' })
  battle: Battle | null;

  @Column({ type: 'uuid', nullable: true })
  battleId: string | null;

  // rattacher à un bet si pertinent
  @ManyToOne(() => Bet, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'betId' })
  bet: Bet | null;

  @Column({ type: 'uuid', nullable: true })
  betId: string | null;

  // note libre pour l'admin ou pour debug
  @Column({ type: 'text', nullable: true })
  memo: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
