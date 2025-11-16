import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * service d'intégration avec l'API MusicBrainz
 * API tierce pour rechercher des informations sur des artistes et des chansons
 */
@Injectable()
export class MusicApiService {
  private readonly baseUrl = 'https://musicbrainz.org/ws/2';

  constructor(private readonly httpService: HttpService) {}

  /**
   * rechercher un artiste par nom
   */
  async searchArtist(artistName: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/artist`, {
          params: {
            query: artistName,
            fmt: 'json',
            limit: 5,
          },
        }),
      );

      return {
        results: response.data.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          country: artist.country,
          type: artist.type,
          disambiguation: artist.disambiguation,
        })),
      };
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la recherche d\'artiste',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * rechercher des enregistrements (chansons) par titre
   */
  async searchRecording(title: string, artist?: string) {
    try {
      let query = `recording:"${title}"`;
      if (artist) {
        query += ` AND artist:"${artist}"`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/recording`, {
          params: {
            query,
            fmt: 'json',
            limit: 5,
          },
        }),
      );

      return {
        results: response.data.recordings.map((recording: any) => ({
          id: recording.id,
          title: recording.title,
          artist: recording['artist-credit']?.[0]?.name,
          length: recording.length ? Math.round(recording.length / 1000) : null,
        })),
      };
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la recherche d\'enregistrement',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
