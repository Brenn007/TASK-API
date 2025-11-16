import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { Song } from './entities/song.entity';

/**
 * Module de gestion des chansons
 * 
 * Fournit les fonctionnalités CRUD pour les chansons
 */
@Module({
  imports: [
    // Enregistrer l'entité Song dans TypeORM
    TypeOrmModule.forFeature([Song]),
  ],
  controllers: [SongsController],
  providers: [SongsService],
  exports: [TypeOrmModule], // Exporter pour utilisation dans PlaylistsModule
})
export class SongsModule {}
