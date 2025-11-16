import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * decorateur personnalisé pour extraire l'utilisateur authentifie depuis la requete
 * 
 * l'utilisateur est injecte dans la requete par le JwtAuthGuard
 * apres validation du token JWT
 * 
 * Usage:
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@GetUser() user: User) {
 *   return user;
 * }
 * 
 * @returns L'utilisateur authentifie ou une propriete specifique si demandee
 */
export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    //si une propriete specifique est demandee, la retourner
    //ex: @GetUser('id') retournera uniquement l'ID de l'utilisateur
    return data ? user?.[data] : user;
  },
);
