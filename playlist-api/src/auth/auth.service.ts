import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * service d'authentification
 * 
 * gere l'inscription, la connexion, la deconnexion et le rafraichissement des tokens
 * implemente une authentification JWT securisee avec access et refresh tokens
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * inscription d'un nouvel utilisateur
   * 
   * @param registerDto - Données d'inscription (email, username, password)
   * @returns Les tokens JWT et les informations de l'utilisateur
   * @throws ConflictException si l'email ou le username existe déjà
   */
  async register(registerDto: RegisterDto) {
    const { email, username, password } = registerDto;

    //verifier si l'email existe deja
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // verifier si le username existe deja
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUserByUsername) {
      throw new ConflictException("Ce nom d'utilisateur est déjà utilisé");
    }

    //hasher le mot de passe avec bcrypt
    //le salt est automatiquement genere par bcrypt
    const saltRounds = parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'), 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //creer le nouvel utilisateur
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
    });

    //sauvegarder l'utilisateur en base de donnees
    await this.userRepository.save(user);

    //generer les tokens JWT
    const tokens = await this.generateTokens(user);

    //stocker le refresh token hashe dans la base de donnees
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    //retourner les tokens et les infos utilisateur (sans le password)
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * connexion d'un utilisateur existant
   * 
   * @param loginDto - Données de connexion (email, password)
   * @returns Les tokens JWT et les informations de l'utilisateur
   * @throws UnauthorizedException si les identifiants sont incorrects ou si l'utilisateur est banni
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    //rechercher l'utilisateur par email
    const user = await this.userRepository.findOne({ where: { email } });

    //verifier que l'utilisateur existe
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    //verifier que l'utilisateur n'est pas banni
    if (user.isBanned) {
      throw new UnauthorizedException(
        'Votre compte a été banni. Veuillez contacter un administrateur.',
      );
    }

    //verifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    //generer les tokens JWT
    const tokens = await this.generateTokens(user);

    //stocker le refresh token hashe dans la base de donnees
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    //retourner les tokens et les infos utilisateur (sans le password)
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * deconnexion d'un utilisateur
   * 
   * supprime le refresh token de la base de donnees pour invalider la session
   * 
   * @param userId - ID de l'utilisateur à déconnecter
   */
  async logout(userId: number) {
    //supprimer le refresh token de la base de donnees
    await this.userRepository.update(userId, { refreshToken: null });
    
    return { message: 'Déconnexion réussie' };
  }

  /**
   * rafraichir l'access token en utilisant un refresh token valide
   * 
   * @param user - Utilisateur authentifié via le refresh token
   * @returns Un nouvel access token
   * @throws UnauthorizedException si le refresh token est invalide
   */
  async refreshTokens(user: User) {
    //verifier que l'utilisateur a un refresh token stocke
    if (!user.refreshToken) {
      throw new UnauthorizedException('Session invalide');
    }

    //generer un nouvel access token
    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  /**
   * generer les tokens JWT (access + refresh)
   * 
   * @param user - Utilisateur pour lequel générer les tokens
   * @returns Un objet contenant l'access token et le refresh token
   */
  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    //generer l'access token (courte duree)
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
    });

    //generer le refresh token (longue duree)
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return { accessToken, refreshToken };
  }

  /**
   * generer un nouvel access token
   * 
   * @param user - Utilisateur pour lequel générer le token
   * @returns Un access token JWT
   */
  private async generateAccessToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
    });
  }

  /**
   * mettre a jour le refresh token dans la base de donnees
   * 
   * le refresh token est hashe avant d'etre stocke pour plus de securite
   * 
   * @param userId - ID de l'utilisateur
   * @param refreshToken - Refresh token à stocker
   */
  private async updateRefreshToken(userId: number, refreshToken: string) {
    //hasher le refresh token avant de le stocker
    const saltRounds = parseInt(this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'), 10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);

    //mettre a jour le refresh token dans la base de donnees
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }
}
