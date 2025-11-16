import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MusicApiService } from './music-api.service';
import { MusicApiController } from './music-api.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'PlaylistAPI/1.0',
      },
    }),
  ],
  controllers: [MusicApiController],
  providers: [MusicApiService],
  exports: [MusicApiService],
})
export class MusicApiModule {}
