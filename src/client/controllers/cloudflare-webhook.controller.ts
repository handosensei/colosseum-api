import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Battle, VideoStatus } from '../../battle/entities/battle.entity';
import { CloudflareStreamService } from '../service/cloudflare-stream.service';
import { BattleWorkflowQueueService } from '../../workflow/battle-workflow/service/battle-workflow-queue.service';
import { BattleStatusEnum } from '../../battle/enum/battle-status.enum';

type StreamPayload = {
  uid: string;
  readyToStream?: boolean;
  status?: {
    state?: string;
    pctComplete?: string;
    errorReasonCode?: string;
    errorReasonText?: string;
  };
  playback?: { hls?: string; dash?: string };
  duration?: number;
  thumbnail?: string;
  // ... autres champs selon tes besoins
};

@Controller('webhooks')
export class CloudflareWebhookController {
  constructor(
    @InjectRepository(Battle)
    private battleRepo: Repository<Battle>,
    private cfStream: CloudflareStreamService,
    private readonly battleWorkflowQueueService: BattleWorkflowQueueService,
  ) {}

  @Post('cloudflare-stream')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleWebhook(@Req() req: Request) {
    try {
      this.cfStream.checkWebhookValidity(
        req.headers['webhook-signature'],
        req.body,
      );
    } catch (e) {
      console.log('CF Stream webhook ERROR:', e);
    }

    const rawBody: Buffer = req.body as any;
    let payload: StreamPayload;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new HttpException('Invalid JSON', HttpStatus.BAD_REQUEST);
    }

    const battle = await this.battleRepo.findOne({
      where: { streamUid: payload.uid },
    });
    if (battle) {
      battle.videoStatus =
        payload.status?.state === 'error'
          ? VideoStatus.ERROR
          : payload.readyToStream
            ? VideoStatus.READY
            : VideoStatus.UPLOADING;
      battle.durationSec = Math.round(
        payload.duration ?? battle.durationSec ?? 0,
      );
      battle.thumbnailUrl = payload.thumbnail ?? battle.thumbnailUrl;

      battle.streamPlaybackHls =
        payload.playback?.hls ?? battle.streamPlaybackHls;
      battle.streamPlaybackDash =
        payload.playback?.dash ?? battle.streamPlaybackDash;
      battle.streamPlaybackId = this.cfStream.extractStreamPlaybackId(
        battle.streamPlaybackDash,
      );

      await this.battleRepo.save(battle);
      if (
        payload.readyToStream === true &&
        payload.status?.state === 'ready' && // optionnel mais plus strict
        battle.status === BattleStatusEnum.PENDING
      ) {
        await this.battleWorkflowQueueService.handleBattleStatusChange(
          battle.id,
          BattleStatusEnum.ACTIVE,
        );
      }
    }

    return {};
  }
}
