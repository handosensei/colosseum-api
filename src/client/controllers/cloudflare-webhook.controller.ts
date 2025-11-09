import {
  Body,
  Controller,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Battle, VideoStatus } from '../../battle/entities/battle.entity';

@Controller('webhooks')
export class CloudflareWebhookController {
  constructor(
    @InjectRepository(Battle)
    private battleRepo: Repository<Battle>,
  ) {}

  @Post('cloudflare-stream')
  async handleWebhook(
    @Query('secret') secret: string,
    @Body() payload: any,
  ) {
    // 1. sécurité webhook
    if (secret !== process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET) {
      throw new BadRequestException('Invalid webhook secret');
    }

    // 2. on récupère les infos envoyées
    // payload typique (simplifié) peut ressembler à :
    // {
    //   uid: "abCDefGhijkLmnoP",
    //   readyToStream: true,
    //   duration: 123.456,
    //   thumbnail: "https://.../thumbnail.jpg",
    //   playback: { id: "playbackId123" }
    // }
    const {
      uid,
      readyToStream,
      duration,
      thumbnail,
      playback,
      error,
    } = payload;

    // 3. trouver la battle qui correspond à cette vidéo
    const battle = await this.battleRepo.findOne({
      where: { streamUid: uid },
    });

    if (!battle) {
      // rien à mettre à jour mais on ne doit pas planter le webhook
      return { ok: true, note: 'battle not found for uid' };
    }

    if (error) {
      // encodage a échoué
      battle.videoStatus = VideoStatus.ERROR;
      await this.battleRepo.save(battle);
      return { ok: true, note: 'marked as error' };
    }

    if (readyToStream) {
      battle.videoStatus = VideoStatus.READY;
      battle.streamPlaybackId = playback?.id || battle.streamPlaybackId;
      battle.durationSec = Math.round(duration);
      battle.thumbnailUrl = thumbnail || battle.thumbnailUrl;
      await this.battleRepo.save(battle);
    }

    return { ok: true };
  }
}
