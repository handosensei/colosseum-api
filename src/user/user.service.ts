import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(walletAddress: string): Promise<User> {
    return await this.userRepo.save(
      this.userRepo.create({ walletAddress: walletAddress }),
    );
  }
}
