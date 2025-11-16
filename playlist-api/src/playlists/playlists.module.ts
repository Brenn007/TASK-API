import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { Playlist } from './entities/playlist.entity';
import { PlaylistTrack } from './entities/playlist-track.entity';
import { SongsModule } from '../songs/songs.module';

/**
 * Module de gestion des playlists
 * 
 * Fournit les fonctionnalités CRUD pour les playlists
 * et la gestion des chansons dans les playlists
 */
@Module({
  imports: [
    // Enregistrer les entités Playlist et PlaylistTrack dans TypeORM
    TypeOrmModule.forFeature([Playlist, PlaylistTrack]),
    
    // Importer SongsModule pour accéder à l'entité Song
    SongsModule,
  ],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
})
export class PlaylistsModule {}
