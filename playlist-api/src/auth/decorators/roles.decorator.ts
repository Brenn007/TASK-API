import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';

/**
 * clé pour stocker les métadonnees des roles
 */
export const ROLES_KEY = 'roles';

/**
 * decorateur personnalise pour spécifier les roles requis sur une route
 * 
 * utilise en combinaison avec le RolesGuard pour implementer le RBAC
 * 
 * Usage:
 * @Roles(UserRole.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async adminOnlyRoute() { ... }
 * 
 * @param roles - Un ou plusieurs rôles requis pour accéder à la route
 * @returns Décorateur de métadonnées
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
