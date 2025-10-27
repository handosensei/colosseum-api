import { Injectable } from '@nestjs/common';
import { User } from '../../user/user.entity';
import {
  PointTransaction,
  PointTransactionType,
} from '../entities/point-transaction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PointTransactionService {
  constructor(
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepo: Repository<PointTransaction>,
  ) {}

  async init(user: User) {
    await this.pointTransactionRepo.save({
      user: user,
      amount: 10000,
      type: PointTransactionType.INITIAL_GRANT,
    });
  }
}
