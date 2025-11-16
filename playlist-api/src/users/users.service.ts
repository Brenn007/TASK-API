import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

/**
 * Service de gestion des utilisateurs
 * 
 * Fournit des méthodes pour interagir avec les utilisateurs
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Trouver un utilisateur par son ID
   * 
   * @param id - ID de l'utilisateur
   * @returns L'utilisateur trouvé
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  /**
   * Trouver un utilisateur par son email
   * 
   * @param email - Email de l'utilisateur
   * @returns L'utilisateur trouvé ou null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Bannir un utilisateur (réservé aux admins)
   * 
   * @param id - ID de l'utilisateur à bannir
   * @returns L'utilisateur banni
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async banUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    
    user.isBanned = true;
    await this.userRepository.save(user);
    
    return user;
  }

  /**
   * Débannir un utilisateur (réservé aux admins)
   * 
   * @param id - ID de l'utilisateur à débannir
   * @returns L'utilisateur débanni
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async unbanUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    
    user.isBanned = false;
    await this.userRepository.save(user);
    
    return user;
  }

  /**
   * Promouvoir un utilisateur en ADMIN
   * 
   * @param id - ID de l'utilisateur à promouvoir
   * @returns L'utilisateur promu
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async makeAdmin(id: number): Promise<User> {
    const user = await this.findOne(id);
    
    user.role = UserRole.ADMIN;
    await this.userRepository.save(user);
    
    return user;
  }
}
