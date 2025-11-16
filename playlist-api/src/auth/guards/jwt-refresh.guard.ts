import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * guard JWT Refresh pour protéger la route de rafraichissement des tokens
 * 
 * utilise la stratégie 'jwt-refresh' pour verifier le refresh token
 * utilise uniquement sur la route /auth/refresh
 * 
 * Usage:
 * @UseGuards(JwtRefreshGuard)
 * async refreshToken() { ... }
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //appeler la méthode parente qui vérifie le refresh token JWT
    return super.canActivate(context);
  }
}
