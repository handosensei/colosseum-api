import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { Battle } from './battle.entity';

@Entity({ name: 'character' })
export class Character {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column({ type: 'int', unsigned: true })
  ownerId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner!: User;

  @ManyToMany(() => Battle, (battle) => battle.participants)
  battles!: Battle[];
}
