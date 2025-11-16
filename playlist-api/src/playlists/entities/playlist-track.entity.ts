import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Playlist } from './playlist.entity';
import { Song } from '../../songs/entities/song.entity';

/**
 * Entité PlaylistTrack
 * 
 * Table de liaison entre Playlist et Song
 * Permet de gérer l'ordre des chansons dans une playlist
 */
@Entity('playlist_track')
export class PlaylistTrack {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Playlist, (playlist) => playlist.tracks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'playlistId' })
  playlist: Playlist;

  @Column()
  playlistId: number;

  @ManyToOne(() => Song, (song) => song.playlistTracks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'songId' })
  song: Song;

  @Column()
  songId: number;

  @Column()
  position: number;

  @CreateDateColumn()
  addedAt: Date;
}
