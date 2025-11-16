import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    role: UserRole.USER,
    isBanned: false,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    playlists: [],
    songs: [],
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('devrait retourner un utilisateur par son ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('devrait lancer une NotFoundException si l\'utilisateur n\'existe pas', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Utilisateur non trouvé');
    });
  });

  describe('findByEmail', () => {
    it('devrait retourner un utilisateur par email', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('banUser', () => {
    it('devrait bannir un utilisateur', async () => {
      const unbannedUser = { ...mockUser, isBanned: false };
      const bannedUser = { ...mockUser, isBanned: true };

      mockUserRepository.findOne.mockResolvedValue(unbannedUser);
      mockUserRepository.save.mockResolvedValue(bannedUser);

      const result = await service.banUser(1);

      expect(result.isBanned).toBe(true);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('devrait lancer une NotFoundException si l\'utilisateur n\'existe pas', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.banUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unbanUser', () => {
    it('devrait débannir un utilisateur', async () => {
      const bannedUser = { ...mockUser, isBanned: true };
      const unbannedUser = { ...mockUser, isBanned: false };

      mockUserRepository.findOne.mockResolvedValue(bannedUser);
      mockUserRepository.save.mockResolvedValue(unbannedUser);

      const result = await service.unbanUser(1);

      expect(result.isBanned).toBe(false);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('devrait lancer une NotFoundException si l\'utilisateur n\'existe pas', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.unbanUser(999)).rejects.toThrow(NotFoundException);
    });
  });
});
