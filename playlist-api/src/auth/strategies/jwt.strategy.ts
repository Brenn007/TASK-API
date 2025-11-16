import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * payload JWT contenu dans le token
 */
export interface JwtPayload {
  sub: number; // User ID
  email: string;
  role: string;
}

/**
 * strategie Passport pour l'authentification JWT avec access token
 * 
 * verifie et valide les access tokens JWT
 * extrait l'utilisateur depuis le payload du token
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
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
      //secret pour verifier la signature du token
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * valide le payload du token JWT et retourne l'utilisateur
   * 
   * @param payload - Payload extrait du token JWT
   * @returns L'utilisateur authentifié
   * @throws UnauthorizedException si l'utilisateur n'existe pas ou est banni
   */
  async validate(payload: JwtPayload): Promise<User> {
    const { sub: userId } = payload;

    //recuperer l'utilisateur depuis la base de donnees
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

    //retourner l'utilisateur (sera attache a request.user)
    return user;
  }
}
