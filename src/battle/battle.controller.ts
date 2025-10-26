import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { BattleService } from './battle.service';

import { BattleCreateDto } from './dto/battle-create.dto';
import { BattleUpdateDto } from './dto/battle-update.dto';

import { BattleStatusEnum } from './enum/battle-status.enum';

@Controller('battles')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createBattleDto: BattleCreateDto) {
    return this.battleService.create(createBattleDto);
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    return this.battleService.findAll({ page: p, limit: l, search });
  }

  @Get('next')
  @UseGuards(JwtGuard)
  async findNext() {
    const next = await this.battleService.findNext();
    if (!next) {
      return { message: 'No battle' };
    }
    return next;
  }

  @Patch(':id/status')
  async setStatus(
    @Param('id') id: string,
    @Body('status') status: BattleStatusEnum,
  ) {
    return this.battleService.updateStatus(id, status);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(@Param('id') id: string) {
    return this.battleService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateBattleDto: BattleUpdateDto) {
    return this.battleService.update(id, updateBattleDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.battleService.remove(id);
  }
}
