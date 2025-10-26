import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { Battle } from '../../battle/entities/battle.entity';
import { Bet } from '../../bet/entities/bet.entity';

export enum PointTransactionType {
  INITIAL_GRANT = 'INITIAL_GRANT', // points de départ
  BET_STAKE = 'BET_STAKE', // on retire des points quand il mise
  BET_PAYOUT = 'BET_PAYOUT', // on crédite quand il gagne
  BET_REFUND = 'BET_REFUND', // on crédite si pari remboursé
  ADMIN_ADJUST = 'ADMIN_ADJUST', // ajustement manuel modération
}

@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.pointTransactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
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
  @JoinColumn({ name: 'battle_id' })
  battle: Battle | null;

  @Column({ type: 'uuid', nullable: true })
  battleId: string | null;

  // rattacher à un bet si pertinent
  @ManyToOne(() => Bet, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bet_id' })
  bet: Bet | null;

  @Column({ type: 'uuid', nullable: true })
  betId: string | null;

  // note libre pour l'admin ou pour debug
  @Column({ type: 'text', nullable: true })
  memo: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
