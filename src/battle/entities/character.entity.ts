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
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 36 })
  ownerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner!: User;

  @ManyToMany(() => Battle, (battle) => battle.participants)
  battles!: Battle[];
}
