import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { CloudflareStreamService } from '../../client/service/cloudflare-stream.service';

import { Battle, VideoStatus } from '../entities/battle.entity';
import { BattleStatusEnum } from '../enum/battle-status.enum';


@Controller('battles')
export class BattleVideoController {
  constructor(
    private cfStream: CloudflareStreamService,
    @InjectRepository(Battle)
    private battleRepo: Repository<Battle>,
  ) {}

  @Post(':id/video-upload-url')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  async createUploadUrl(@Param('id') battleId: string) {
    const battle = await this.battleRepo.findOneBy({ id: battleId });
    if (!battle) throw new BadRequestException('Battle not found');

    if (battle.status !== BattleStatusEnum.PENDING) {
      throw new BadRequestException('Battle must be pending to attach video');
    }

    const cfRes = await this.cfStream.createDirectUpload();

    const uid = cfRes?.result?.uid;
    const uploadURL = cfRes?.result?.uploadURL;

    if (!uid || !uploadURL) {
      throw new BadRequestException('Cloudflare did not return upload URL');
    }

    battle.videoStatus = VideoStatus.UPLOADING;
    battle.streamUid = uid;
    await this.battleRepo.save(battle);

    return {
      uploadURL,
      uid,
    };
  }
}
