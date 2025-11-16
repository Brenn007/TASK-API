import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddTrackDto } from './dto/add-track.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('playlists')
@Controller('playlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les playlists avec pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de la page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Éléments par page (défaut: 10, max: 100)' })
  @ApiResponse({ status: 200, description: 'Liste des playlists retournée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.playlistsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une playlist avec ses chansons' })
  @ApiResponse({ status: 200, description: 'Playlist trouvée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Playlist introuvable' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playlistsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle playlist' })
  @ApiResponse({ status: 201, description: 'Playlist créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async create(@Body() createPlaylistDto: CreatePlaylistDto, @GetUser() user: User) {
    return this.playlistsService.create(createPlaylistDto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une playlist (propriétaire uniquement)' })
  @ApiResponse({ status: 200, description: 'Playlist modifiée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Pas le propriétaire' })
  @ApiResponse({ status: 404, description: 'Playlist introuvable' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @GetUser() user: User,
  ) {
    return this.playlistsService.update(id, updatePlaylistDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une playlist (propriétaire uniquement)' })
  @ApiResponse({ status: 204, description: 'Playlist supprimée avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Pas le propriétaire' })
  @ApiResponse({ status: 404, description: 'Playlist introuvable' })
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.playlistsService.remove(id, user);
  }

  @Post(':id/tracks')
  @ApiOperation({ summary: 'Ajouter une chanson à la playlist' })
  @ApiResponse({ status: 201, description: 'Chanson ajoutée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou chanson déjà présente' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Pas le propriétaire' })
  @ApiResponse({ status: 404, description: 'Playlist ou chanson introuvable' })
  async addTrack(
    @Param('id', ParseIntPipe) id: number,
    @Body() addTrackDto: AddTrackDto,
    @GetUser() user: User,
  ) {
    return this.playlistsService.addTrack(id, addTrackDto.songId, user);
  }

  @Delete(':id/tracks/:trackId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer une chanson de la playlist' })
  @ApiResponse({ status: 204, description: 'Chanson retirée avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Pas le propriétaire' })
  @ApiResponse({ status: 404, description: 'Playlist ou relation introuvable' })
  async removeTrack(
    @Param('id', ParseIntPipe) id: number,
    @Param('trackId', ParseIntPipe) trackId: number,
    @GetUser() user: User,
  ) {
    return this.playlistsService.removeTrack(id, trackId, user);
  }
}
