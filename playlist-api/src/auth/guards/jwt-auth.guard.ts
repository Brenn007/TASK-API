import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * guard JWT pour protéger les routes nécessitant une authentification
 * 
 * utilise la strategie 'jwt' pour verifier l'access token
 * a appliquer sur les routes qui necessitent que l'utilisateur soit connecte
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * async getProtectedResource() { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //appeler la methode parente qui verifie le JWT
    return super.canActivate(context);
  }
}
