import {
  Controller,
  Get,
  Param,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';



import { CloudflareStreamService } from '../../client/service/cloudflare-stream.service';

import { Battle, VideoStatus } from '../entities/battle.entity';
import { BattleStatusEnum } from '../enum/battle-status.enum';
import { JwtGuard } from '../../auth/guards/jwt.guard';

@Controller('battles')
export class BattlePlaybackController {
  constructor(
    @InjectRepository(Battle)
    private battleRepo: Repository<Battle>,
    private cfStream: CloudflareStreamService,
  ) {}

  @Get(':id/stream')
  @UseGuards(JwtGuard)
  async getStream(@Param('id') battleId: string) {
    const battle = await this.battleRepo.findOneBy({ id: battleId });

    if (!battle) {
      throw new ForbiddenException('Battle not found');
    }

    // 1. statut actif ?
    if (battle.status !== BattleStatusEnum.ACTIVE) {
      throw new ForbiddenException('Battle not active');
    }

    // 2. l’heure de début est passée ?
    const now = new Date();
    if (now < battle.startTime) {
      throw new ForbiddenException('Battle not started yet');
    }

    // 3. vidéo prête ?
    if (
      battle.videoStatus !== VideoStatus.READY ||
      !battle.streamPlaybackId
    ) {
      throw new ForbiddenException('Video not ready');
    }

    // MVP: URL publique
    const playbackUrl = this.cfStream.getPublicPlaybackUrl(
      battle.streamPlaybackId,
    );

    // version sécurisée plus tard :
    // const playbackUrl = this.cfStream.generateSignedPlaybackUrl(
    //   battle.streamPlaybackId,
    //   user.id, // si tu as un req.user
    // );

    return {
      playbackUrl,
      thumbnailUrl: battle.thumbnailUrl,
      durationSec: battle.durationSec,
      startTime: battle.startTime,
    };
  }
}
