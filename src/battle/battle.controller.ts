import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleCreateDto } from './dto/battle-create.dto';
import { BattleUpdateDto } from './dto/battle-update.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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
  findAll() {
    return this.battleService.findAll();
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
