import { Injectable, InternalServerErrorException } from '@nestjs/common';

import {
  BadRequestException,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CloudflareStreamService {
  private accountId: string;
  private apiToken: string;
  private playbackBase: string;
  private readonly maxSkewSec = 5 * 60;

  constructor(private readonly config: ConfigService) {
    const raw = this.config.get<string>('CLOUDFLARE_ACCOUNT_ID') ?? '';

    this.accountId = raw.trim().replace(/^["']|["']$/g, '');
    this.apiToken = this.config.get<string>('CLOUDFLARE_STREAM_API_TOKEN')!;
    this.playbackBase =
      this.config.get<string>('CLOUDFLARE_STREAM_PLAYBACK_URL_BASE') ||
      'https://watch.cloudflarestream.com';

    if (!/^[a-f0-9]{32}$/i.test(this.accountId)) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID invalide ou non chargé');
    }
    if (!this.apiToken) {
      throw new Error('CLOUDFLARE_STREAM_API_TOKEN manquant.');
    }
  }

  /**
   * Crée un "direct upload" chez Cloudflare Stream.
   * Réponse attendue (simplifiée):
   * {
   *   result: {
   *     uid: "abCDefGhijkLmnoP",
   *     uploadURL: "https://upload.videodelivery.net/stream/..."
   *   }
   * }
   */
  async createDirectUpload() {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/direct_upload`
    try {
      const res = await axios.post(
        url,
        { maxDurationSeconds: 15 * 60 },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return res.data;
    } catch (e) {
      console.error(
        'Cloudflare createDirectUpload error:',
        e?.response?.data || e,
      );
      throw new InternalServerErrorException(
        'Unable to create Cloudflare direct upload',
      );
    }
  }

  checkWebhookValidity(webhookSignature: string | undefined, body: any) {
    const secret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('Missing CLOUDFLARE_STREAM_WEBHOOK_SECRET');
    }

    if (!webhookSignature) {
      throw new HttpException('Missing Webhook-Signature', HttpStatus.UNAUTHORIZED);
    }

    const parts = Object.fromEntries(
      webhookSignature.split(',').map(kv => {
        const [k, v] = kv.split('=');
        return [k.trim(), (v ?? '').trim()];
      }),
    );
    const timeStr = parts.time;
    const sig1 = parts.sig1;

    if (!timeStr || !sig1) {
      throw new HttpException('Invalid signature format', HttpStatus.UNAUTHORIZED);
    }

    const now = Math.floor(Date.now() / 1000);
    const t = Number(timeStr);
    if (!Number.isFinite(t) || Math.abs(now - t) > this.maxSkewSec) {
      throw new HttpException('Stale webhook timestamp', HttpStatus.UNAUTHORIZED);
    }

    const rawBody: Buffer = body;
    const source = Buffer.concat([Buffer.from(timeStr + '.', 'utf8'), rawBody]);

    const expectedHex = crypto
      .createHmac('sha256', Buffer.from(secret, 'utf8'))
      .update(source)
      .digest('hex');

    const isValid =
      expectedHex.length === sig1.length &&
      crypto.timingSafeEqual(Buffer.from(expectedHex, 'hex'), Buffer.from(sig1, 'hex'));

    if (!isValid) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }

  extractStreamPlaybackId(url: string): string | null {
    try {
      const u = new URL(url);
      const segments = u.pathname.split("/").filter(Boolean);

      if (segments.length >= 1) {
        return segments[0]; // premier segment = playbackId
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Récupère les infos d'une vidéo Stream par UID.
   * Utile si jamais tu veux resynchroniser manuellement.
   */
  async getVideoInfo(uid: string) {
    try {
      const res = await axios.get(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        },
      );
      return res.data;
    } catch (e) {
      console.error('Cloudflare getVideoInfo error:', e?.response?.data || e);
      throw new InternalServerErrorException(
        'Unable to fetch Cloudflare video info',
      );
    }
  }

  /**
   * Génère une URL playback sécurisée avec un token signé (JWT).
   * Optionnel pour MVP : tu peux commencer sans ça (URL publique),
   * et l'ajouter quand tu veux empêcher le partage sauvage.
   */
  generateSignedPlaybackUrl(playbackId: string, userId: string) {
    // 1. Création d'un JWT court
    //    Cloudflare Stream supporte des tokens style JWT pour restreindre la lecture.
    //    Ici on signe avec CLOUDFLARE_STREAM_WEBHOOK_SECRET juste pour l'exemple,
    //    mais en vrai Cloudflare conseille une clé dédiée Token Signing Key.
    const privateKey = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET!;
    const expiresInSeconds = 10 * 60; // 10 min

    const token = jwt.sign(
      {
        sub: userId,
        // tu peux aussi ajouter: "kid", "exp", "m" (ACL paths), etc. selon les règles Cloudflare Stream
      },
      privateKey,
      { expiresIn: expiresInSeconds },
    );

    // 2. Construire l’URL HLS sécurisée
    // Forme classique :
    // https://watch.cloudflarestream.com/<playbackId>/manifest/video.m3u8?token=<JWT>
    return `${this.playbackBase}/${playbackId}/manifest/video.m3u8?token=${token}`;
  }

  /**
   * URL playback publique (MVP)
   * Sans token, juste pour aller vite.
   */
  getPublicPlaybackUrl(playbackId: string) {
    return `${this.playbackBase}/${playbackId}/manifest/video.m3u8`;
  }
}
