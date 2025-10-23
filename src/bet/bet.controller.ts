import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { BetCreateDto } from './dto/bet-create.dto';
import { BetService } from './service/bet.service';

@Controller('bets')
export class BetController {
  constructor(private readonly betService: BetService) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(
    @Req() req: Request & { user?: { sub: string } },
    @Body() dto: BetCreateDto,
  ) {
    const userId = req.user?.sub as string;
    return this.betService.create(userId, dto);
  }
}
