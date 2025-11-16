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
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('songs')
@Controller('songs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les chansons avec pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de la page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Éléments par page (défaut: 10, max: 100)' })
  @ApiResponse({ status: 200, description: 'Liste des chansons retournée avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.songsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir les détails d\'une chanson' })
  @ApiResponse({ status: 200, description: 'Chanson trouvée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Chanson introuvable' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.songsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle chanson' })
  @ApiResponse({ status: 201, description: 'Chanson créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async create(@Body() createSongDto: CreateSongDto, @GetUser() user: User) {
    return this.songsService.create(createSongDto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une chanson (propriétaire ou admin)' })
  @ApiResponse({ status: 200, description: 'Chanson modifiée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Pas le propriétaire' })
  @ApiResponse({ status: 404, description: 'Chanson introuvable' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSongDto: UpdateSongDto,
    @GetUser() user: User,
  ) {
    return this.songsService.update(id, updateSongDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une chanson (propriétaire ou admin)' })
  @ApiResponse({ status: 204, description: 'Chanson supprimée avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Pas le propriétaire' })
  @ApiResponse({ status: 404, description: 'Chanson introuvable' })
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.songsService.remove(id, user);
  }
}
