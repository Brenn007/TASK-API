import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MusicApiService } from './music-api.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('music-api')
@Controller('music-api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class MusicApiController {
  constructor(private readonly musicApiService: MusicApiService) {}

  @Get('search/artist')
  @ApiOperation({ 
    summary: 'Rechercher un artiste via MusicBrainz API',
    description: 'Utilise l\'API tierce MusicBrainz pour rechercher des artistes',
  })
  @ApiQuery({ name: 'name', example: 'Queen', description: 'Nom de l\'artiste à rechercher' })
  @ApiResponse({ status: 200, description: 'Résultats de la recherche' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 503, description: 'API tierce indisponible' })
  async searchArtist(@Query('name') name: string) {
    return this.musicApiService.searchArtist(name);
  }

  @Get('search/recording')
  @ApiOperation({ 
    summary: 'Rechercher un enregistrement (chanson) via MusicBrainz API',
    description: 'Utilise l\'API tierce MusicBrainz pour rechercher des chansons',
  })
  @ApiQuery({ name: 'title', example: 'Bohemian Rhapsody', description: 'Titre de la chanson' })
  @ApiQuery({ name: 'artist', required: false, example: 'Queen', description: 'Nom de l\'artiste (optionnel)' })
  @ApiResponse({ status: 200, description: 'Résultats de la recherche' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 503, description: 'API tierce indisponible' })
  async searchRecording(
    @Query('title') title: string,
    @Query('artist') artist?: string,
  ) {
    return this.musicApiService.searchRecording(title, artist);
  }
}
