import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { PlaylistTrack } from './entities/playlist-track.entity';
import { Song } from '../songs/entities/song.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

/**
 * Service de gestion des playlists
 * 
 * Implémente toutes les opérations CRUD pour les playlists
 * et la gestion des chansons dans les playlists
 */
@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(PlaylistTrack)
    private playlistTrackRepository: Repository<PlaylistTrack>,
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
  ) {}

  /**
   * Créer une nouvelle playlist
   * 
   * @param createPlaylistDto - Données de la playlist à créer
   * @param userId - ID de l'utilisateur qui crée la playlist
   * @returns La playlist créée
   */
  async create(
    createPlaylistDto: CreatePlaylistDto,
    userId: number,
  ): Promise<Playlist> {
    const playlist = this.playlistRepository.create({
      ...createPlaylistDto,
      userId,
    });

    return await this.playlistRepository.save(playlist);
  }

  /**
   * Récupérer toutes les playlists avec pagination
   * 
   * @param paginationDto - Paramètres de pagination (page, limit)
   * @returns Réponse paginée avec les playlists et métadonnées
   */
  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Playlist>> {
    const { page = 1, limit = 10 } = paginationDto;
    
    // Calculer le offset
    const skip = (page - 1) * limit;

    // Récupérer les playlists avec pagination
    const [playlists, totalItems] = await this.playlistRepository.findAndCount({
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
        },
      },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC', // Plus récentes en premier
      },
    });

    // Calculer les métadonnées
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: playlists,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  /**
   * Récupérer une playlist par son ID avec toutes ses chansons
   * 
   * @param id - ID de la playlist
   * @returns La playlist avec ses chansons
   * @throws NotFoundException si la playlist n'existe pas
   */
  async findOne(id: number): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: ['user', 'playlistTracks', 'playlistTracks.song'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist non trouvée');
    }

    return playlist;
  }

  /**
   * Modifier une playlist existante
   * 
   * Seul le propriétaire peut modifier sa playlist
   * 
   * @param id - ID de la playlist à modifier
   * @param updatePlaylistDto - Nouvelles données de la playlist
   * @param user - Utilisateur qui effectue la modification
   * @returns La playlist modifiée
   * @throws NotFoundException si la playlist n'existe pas
   * @throws ForbiddenException si l'utilisateur n'est pas le propriétaire
   */
  async update(
    id: number,
    updatePlaylistDto: UpdatePlaylistDto,
    user: User,
  ): Promise<Playlist> {
    const playlist = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    if (playlist.userId !== user.id) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de modifier cette playlist",
      );
    }

    // Mettre à jour les champs modifiés
    Object.assign(playlist, updatePlaylistDto);

    return await this.playlistRepository.save(playlist);
  }

  /**
   * Supprimer une playlist
   * 
   * Seul le propriétaire peut supprimer sa playlist
   * 
   * @param id - ID de la playlist à supprimer
   * @param user - Utilisateur qui effectue la suppression
   * @throws NotFoundException si la playlist n'existe pas
   * @throws ForbiddenException si l'utilisateur n'est pas le propriétaire
   */
  async remove(id: number, user: User): Promise<void> {
    const playlist = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    if (playlist.userId !== user.id) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de supprimer cette playlist",
      );
    }

    await this.playlistRepository.remove(playlist);
  }

  /**
   * Ajouter une chanson à une playlist
   * 
   * @param playlistId - ID de la playlist
   * @param songId - ID de la chanson à ajouter
   * @param user - Utilisateur qui effectue l'ajout
   * @returns La relation playlist-chanson créée
   * @throws NotFoundException si la playlist ou la chanson n'existe pas
   * @throws ForbiddenException si l'utilisateur n'est pas le propriétaire
   * @throws BadRequestException si la chanson est déjà dans la playlist
   */
  async addTrack(
    playlistId: number,
    songId: number,
    user: User,
  ): Promise<PlaylistTrack> {
    // Vérifier que la playlist existe et que l'utilisateur en est le propriétaire
    const playlist = await this.findOne(playlistId);
    if (playlist.userId !== user.id) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de modifier cette playlist",
      );
    }

    // Vérifier que la chanson existe
    const song = await this.songRepository.findOne({ where: { id: songId } });
    if (!song) {
      throw new NotFoundException('Chanson non trouvée');
    }

    // Vérifier que la chanson n'est pas déjà dans la playlist
    const existingTrack = await this.playlistTrackRepository.findOne({
      where: { playlistId, songId },
    });
    if (existingTrack) {
      throw new BadRequestException('Cette chanson est déjà dans la playlist');
    }

    // Créer la relation playlist-chanson
    const playlistTrack = this.playlistTrackRepository.create({
      playlistId,
      songId,
    });

    return await this.playlistTrackRepository.save(playlistTrack);
  }

  /**
   * Retirer une chanson d'une playlist
   * 
   * @param playlistId - ID de la playlist
   * @param trackId - ID de la relation playlist-chanson à supprimer
   * @param user - Utilisateur qui effectue la suppression
   * @throws NotFoundException si la playlist ou la relation n'existe pas
   * @throws ForbiddenException si l'utilisateur n'est pas le propriétaire
   */
  async removeTrack(
    playlistId: number,
    trackId: number,
    user: User,
  ): Promise<void> {
    // Vérifier que la playlist existe et que l'utilisateur en est le propriétaire
    const playlist = await this.findOne(playlistId);
    if (playlist.userId !== user.id) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de modifier cette playlist",
      );
    }

    // Vérifier que la relation existe
    const playlistTrack = await this.playlistTrackRepository.findOne({
      where: { id: trackId, playlistId },
    });
    if (!playlistTrack) {
      throw new NotFoundException('Chanson non trouvée dans cette playlist');
    }

    await this.playlistTrackRepository.remove(playlistTrack);
  }
}
