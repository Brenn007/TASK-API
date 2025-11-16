import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SongsModule } from './songs/songs.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { AdminModule } from './admin/admin.module';
import { MusicApiModule } from './music-api/music-api.module';
import { User } from './users/entities/user.entity';
import { Song } from './songs/entities/song.entity';
import { Playlist } from './playlists/entities/playlist.entity';
import { PlaylistTrack } from './playlists/entities/playlist-track.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqljs',
        location: configService.get<string>('DATABASE_PATH', 'database.sqlite'),
        autoSave: true,
        synchronize: true,
        logging: configService.get<string>('NODE_ENV') === 'development',
        entities: [User, Song, Playlist, PlaylistTrack],
      }),
    }),
    AuthModule,
    UsersModule,
    SongsModule,
    PlaylistsModule,
    AdminModule,
    MusicApiModule,
  ],
})
export class AppModule {}
