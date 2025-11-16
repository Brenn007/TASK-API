import {
  Controller,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('users/:id/ban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bannir un utilisateur (ADMIN uniquement)' })
  @ApiResponse({ status: 200, description: 'Utilisateur banni avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Pas de rôle ADMIN' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async banUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.banUser(id);
  }

  @Post('users/:id/unban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Débannir un utilisateur (ADMIN uniquement)' })
  @ApiResponse({ status: 200, description: 'Utilisateur débanni avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Pas de rôle ADMIN' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async unbanUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.unbanUser(id);
  }

  @Post('users/:id/make-admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Promouvoir un utilisateur en ADMIN' })
  @ApiResponse({ status: 200, description: 'Utilisateur promu en ADMIN avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async makeAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.makeAdmin(id);
  }
}
