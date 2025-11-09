import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudflareStreamService {
  private accountId: string;
  private apiToken: string;
  private playbackBase: string;

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
