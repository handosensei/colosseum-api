import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity({ name: 'session' })
export class Session {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Index()
  @Column({ type: 'int', unsigned: true })
  userId!: number;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({ type: 'varchar', length: 128, unique: true })
  jwtId!: string;

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
