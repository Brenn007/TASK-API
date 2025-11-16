import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

/**
 * Module de gestion des utilisateurs
 * 
 * Exporte le service pour être utilisé par d'autres modules
 * (notamment par AuthModule et AdminModule)
 */
@Module({
  imports: [
    // Enregistrer l'entité User dans TypeORM
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService],
  exports: [UsersService], // Exporter le service pour les autres modules
})
export class UsersModule {}
