import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from './jwt.strategy';

/**
 * strategie Passport pour l'authentification JWT avec refresh token
 * 
 * verifie et valide les refresh tokens JWT
 * utilise pour renouveler l'access token
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      //extraire le token depuis le header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //ne pas ignorer l'expiration du token
      ignoreExpiration: false,
      //secret pour verifier la signature du refresh token (different de l'access token)
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  /**
   * valide le payload du refresh token et retourne l'utilisateur
   * 
   * @param payload - Payload extrait du refresh token JWT
   * @returns L'utilisateur authentifié
   * @throws UnauthorizedException si l'utilisateur n'existe pas ou est banni
   */
  async validate(payload: JwtPayload): Promise<User> {
    const { sub: userId } = payload;

    //rcuperer l'utilisateur depuis la base de donnees
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    //verifier que l'utilisateur existe
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    //verifier que l'utilisateur n'est pas banni
    if (user.isBanned) {
      throw new UnauthorizedException(
        'Votre compte a été banni. Veuillez contacter un administrateur.',
      );
    }

    //verifier que l'utilisateur a un refresh token stocke
    if (!user.refreshToken) {
      throw new UnauthorizedException('Session invalide');
    }

    //retourner l'utilisateur (sera attache a request.user)
    return user;
  }
}
