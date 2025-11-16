import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song } from './entities/song.entity';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

/**
 * Service de gestion des chansons
 * 
 * Implémente toutes les opérations CRUD pour les chansons
 */
@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
  ) {}

  /**
   * Créer une nouvelle chanson
   * 
   * @param createSongDto - Données de la chanson à créer
   * @param userId - ID de l'utilisateur qui crée la chanson
   * @returns La chanson créée
   */
  async create(createSongDto: CreateSongDto, userId: number): Promise<Song> {
    const song = this.songRepository.create({
      ...createSongDto,
      createdById: userId,
    });

    return await this.songRepository.save(song);
  }

  /**
   * Récupérer toutes les chansons avec pagination
   * 
   * @param paginationDto - Paramètres de pagination (page, limit)
   * @returns Réponse paginée avec les chansons et métadonnées
   */
  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Song>> {
    const { page = 1, limit = 10 } = paginationDto;
    
    // Calculer le offset (nombre d'éléments à sauter)
    const skip = (page - 1) * limit;

    // Récupérer les chansons avec pagination
    const [songs, totalItems] = await this.songRepository.findAndCount({
      relations: ['createdBy'],
      select: {
        createdBy: {
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

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: songs,
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
   * Récupérer une chanson par son ID
   * 
   * @param id - ID de la chanson
   * @returns La chanson trouvée
   * @throws NotFoundException si la chanson n'existe pas
   */
  async findOne(id: number): Promise<Song> {
    const song = await this.songRepository.findOne({
      where: { id },
      relations: ['createdBy'],
      select: {
        createdBy: {
          id: true,
          username: true,
          email: true,
        },
      },
    });

    if (!song) {
      throw new NotFoundException('Chanson non trouvée');
    }

    return song;
  }

  /**
   * Modifier une chanson existante
   * 
   * Seul le créateur de la chanson ou un admin peut la modifier
   * 
   * @param id - ID de la chanson à modifier
   * @param updateSongDto - Nouvelles données de la chanson
   * @param user - Utilisateur qui effectue la modification
   * @returns La chanson modifiée
   * @throws NotFoundException si la chanson n'existe pas
   * @throws ForbiddenException si l'utilisateur n'a pas les droits
   */
  async update(
    id: number,
    updateSongDto: UpdateSongDto,
    user: User,
  ): Promise<Song> {
    const song = await this.findOne(id);

    // Vérifier que l'utilisateur est le créateur ou un admin
    if (song.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de modifier cette chanson",
      );
    }

    // Mettre à jour les champs modifiés
    Object.assign(song, updateSongDto);

    return await this.songRepository.save(song);
  }

  /**
   * Supprimer une chanson
   * 
   * Seul le créateur de la chanson ou un admin peut la supprimer
   * 
   * @param id - ID de la chanson à supprimer
   * @param user - Utilisateur qui effectue la suppression
   * @throws NotFoundException si la chanson n'existe pas
   * @throws ForbiddenException si l'utilisateur n'a pas les droits
   */
  async remove(id: number, user: User): Promise<void> {
    const song = await this.findOne(id);

    // Vérifier que l'utilisateur est le créateur ou un admin
    if (song.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de supprimer cette chanson",
      );
    }

    await this.songRepository.remove(song);
  }
}
