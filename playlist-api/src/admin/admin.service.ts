import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

/**
 * service d'administration
 * 
 * fournit des fonctionnalites reservees aux administrateurs
 * notamment le bannissement d'utilisateurs
 */
@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * bannir un utilisateur
   * 
   * @param userId - ID de l'utilisateur à bannir
   * @returns L'utilisateur banni
   */
  async banUser(userId: number) {
    const user = await this.usersService.banUser(userId);
    
    return {
      message: 'Utilisateur banni avec succès',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isBanned: user.isBanned,
      },
    };
  }

  /**
   * debannir un utilisateur
   * 
   * @param userId - ID de l'utilisateur à débannir
   * @returns L'utilisateur débanni
   */
  async unbanUser(userId: number) {
    const user = await this.usersService.unbanUser(userId);
    
    return {
      message: 'Utilisateur débanni avec succès',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isBanned: user.isBanned,
      },
    };
  }

  /**
   * promouvoir un utilisateur en ADMIN
   * 
   * @param userId - ID de l'utilisateur à promouvoir
   * @returns L'utilisateur promu
   */
  async makeAdmin(userId: number) {
    const user = await this.usersService.makeAdmin(userId);
    
    return {
      message: 'Utilisateur promu en ADMIN avec succès',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
