import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';

/**
 * module d'administration
 * 
 * fournit des fonctionnalités réservées aux administrateurs (RBAC)
 * importe UsersModule pour gérer les utilisateurs
 */
@Module({
  imports: [
    //importer UsersModule pour accéder au UsersService
    UsersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
