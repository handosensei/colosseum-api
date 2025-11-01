import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query, BadRequestException,
} from '@nestjs/common';

import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { BattleService } from '../battle.service';

import { BattleCreateDto } from '../dto/battle-create.dto';
import { BattleUpdateDto } from '../dto/battle-update.dto';

import { BattleStatusEnum } from '../enum/battle-status.enum';

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
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
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
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  async findNext() {
    const next = await this.battleService.findNext();
    if (!next) {
      return { message: 'No battle' };
    }
    return next;
  }

  @Post(':id/video-upload-url')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  async getDirectUploadUrl(@Param('id') battleId: string) {
    const battle = await this.battleService.findBattleById(battleId);

    if (battle?.status !== BattleStatusEnum.PENDING) {
      throw new BadRequestException('Battle not pending');
    }

    // Appel Cloudflare Stream API: créer un "direct upload"
    // Body typique: { maxDurationSeconds?, requireSignedURLs?: true, ... }
    // Réponse: { uploadURL, uid, ... }
    return {};
    // const cfRes = await this.cloudflareStreamService.createDirectUpload();
    // // cfRes.uploadURL, cfRes.result.uid ...
    //
    // battle.videoStatus = VideoStatus.UPLOADING;
    // battle.streamUid = cfRes.result.uid;
    // await this.battleRepo.save(battle);
    //
    // return {
    //   uploadURL: cfRes.result.uploadURL,
    //   uid: cfRes.result.uid,
    // };
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard)
  async setStatus(
    @Param('id') id: string,
    @Body('status') status: BattleStatusEnum,
  ) {
    return this.battleService.updateStatus(id, status);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(@Param('id') id: string) {
    return this.battleService.findBattleById(id);
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
