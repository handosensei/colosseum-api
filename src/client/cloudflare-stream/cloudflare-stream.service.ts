import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class CloudflareStreamService {
  private accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  private apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN!;
  private playbackBase =
    process.env.CLOUDFLARE_STREAM_PLAYBACK_URL_BASE ||
    'https://watch.cloudflarestream.com';

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
    try {
      return await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/direct_upload`,
        {
          // Tu peux forcer certaines règles ici
          // requireSignedURLs: true, // utile si tu veux obliger un token pour la lecture
          maxDurationSeconds: 15 * 60, // 15 minutes max, par exemple
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
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
      return await axios.get(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        },
      );
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
