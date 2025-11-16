import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../common/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * guard pour le contrôle d'acces base sur les roles (RBAC)
 * 
 * verifie que l'utilisateur authentifie possede les roles requis
 * doit etre utilise en combinaison avec le decorateur @Roles()
 * 
 * Usage:
 * @Roles(UserRole.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async adminOnlyRoute() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * verifie si l'utilisateur a les roles requis pour acceder a la route
   * 
   * @param context - Contexte d'exécution de la requête
   * @returns true si l'utilisateur a les rôles requis, false sinon
   */
  canActivate(context: ExecutionContext): boolean {
    // recuperer les roles requis depuis les metadonnees du decorateur @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    //si aucun rôle n'est requis, autoriser l'acces
    if (!requiredRoles) {
      return true;
    }

    //recuperer l'utilisateur depuis la requete (injecte par JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    //verifier si l'utilisateur possede au moins un des roles requis
    return requiredRoles.some((role) => user.role === role);
  }
}
