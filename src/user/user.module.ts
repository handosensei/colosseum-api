import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entity/user.entity';
import { PointTransaction } from './entity/point-transaction.entity';

import { UserService } from './user.service';
import { PointTransactionService } from './point-transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, PointTransaction])],
  providers: [UserService, PointTransactionService],
  exports: [UserService, PointTransactionService],
})
export class UserModule {}
