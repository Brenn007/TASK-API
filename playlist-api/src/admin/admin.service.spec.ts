import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

describe('AdminService', () => {
  let service: AdminService;
  let usersService: UsersService;

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

  const mockUsersService = {
    banUser: jest.fn(),
    unbanUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('banUser', () => {
    it('devrait bannir un utilisateur et retourner un message de succès', async () => {
      const bannedUser = { ...mockUser, isBanned: true };
      mockUsersService.banUser.mockResolvedValue(bannedUser);

      const result = await service.banUser(1);

      expect(result.message).toBe('Utilisateur banni avec succès');
      expect(result.user.isBanned).toBe(true);
      expect(result.user.id).toBe(1);
      expect(mockUsersService.banUser).toHaveBeenCalledWith(1);
    });
  });

  describe('unbanUser', () => {
    it('devrait débannir un utilisateur et retourner un message de succès', async () => {
      const unbannedUser = { ...mockUser, isBanned: false };
      mockUsersService.unbanUser.mockResolvedValue(unbannedUser);

      const result = await service.unbanUser(1);

      expect(result.message).toBe('Utilisateur débanni avec succès');
      expect(result.user.isBanned).toBe(false);
      expect(result.user.id).toBe(1);
      expect(mockUsersService.unbanUser).toHaveBeenCalledWith(1);
    });
  });
});
