
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    role: UserRole.USER,
    isBanned: false,
    refreshToken: 'hashedRefreshToken',
    createdAt: new Date(),
    updatedAt: new Date(),
    playlists: [],
    songs: [],
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        BCRYPT_SALT_ROUNDS: 10,
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    };

    it('devrait créer un nouvel utilisateur avec succès', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).not.toHaveProperty('refreshToken'); // Le refresh token n'est plus retourné
      expect(result.user.email).toBe(mockUser.email);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('devrait lancer ConflictException si l\'email existe déjà', async () => {
      // Le premier findOne trouve un utilisateur avec cet email
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Cet email est déjà utilisé');
    });

    it('devrait lancer ConflictException si le username existe déjà', async () => {
      // Premier findOne (email) retourne null, deuxième (username) retourne un user
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)  // email check
        .mockResolvedValueOnce(mockUser)  // username check
        .mockResolvedValueOnce(null)  // email check pour le 2e appel
        .mockResolvedValueOnce(mockUser); // username check pour le 2e appel

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow("Ce nom d'utilisateur est déjà utilisé");
    });

    it('devrait hasher le mot de passe avec bcrypt', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('token');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).not.toHaveProperty('refreshToken'); // Le refresh token n'est plus retourné
      expect(result.user.email).toBe(mockUser.email);
    });

    it('devrait lancer UnauthorizedException si l\'utilisateur n\'existe pas', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('devrait lancer UnauthorizedException si le mot de passe est incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('devrait lancer UnauthorizedException si l\'utilisateur est banni', async () => {
      const bannedUser = { ...mockUser, isBanned: true };
      mockUserRepository.findOne.mockResolvedValue(bannedUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow(
        'Votre compte a été banni. Veuillez contacter un administrateur.',
      );
    });
  });

  describe('logout', () => {
    it('devrait supprimer le refresh token', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.logout(1);

      expect(result).toEqual({ message: 'Déconnexion réussie' });
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, { refreshToken: null });
    });
  });

  describe('refreshTokens', () => {
    it('devrait générer un nouvel access token', async () => {
      mockJwtService.signAsync.mockResolvedValue('newAccessToken');

      const result = await service.refreshTokens(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('newAccessToken');
    });

    it('devrait lancer UnauthorizedException si pas de refresh token stocké', async () => {
      const userWithoutToken = { ...mockUser, refreshToken: null };

      await expect(service.refreshTokens(userWithoutToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshTokens(userWithoutToken)).rejects.toThrow('Session invalide');
    });
  });
});
