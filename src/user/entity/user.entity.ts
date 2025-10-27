import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Session } from '../../auth/entity/session.entity';
import { Bet } from '../../bet/entities/bet.entity';
import { PointTransaction } from './point-transaction.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // UUID v4

  @Column({ type: 'varchar', length: 255, unique: true })
  walletAddress!: string;

  @Column({ type: 'integer', default: 0 })
  pointsBalance: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  username!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  role!: string;

  @OneToMany(() => Session, (session) => session.user, { cascade: false })
  sessions!: Session[];

  @OneToMany(() => Bet, (b) => b.user)
  bets: Bet[];

  @OneToMany(
    () => PointTransaction,
    (pointTransaction) => pointTransaction.user,
  )
  pointTransactions: PointTransaction[];
}
