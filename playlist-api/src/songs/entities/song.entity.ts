import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PlaylistTrack } from '../../playlists/entities/playlist-track.entity';

/**
 * Entité Song
 * 
 * Représente une chanson avec ses métadonnées
 */
@Entity('song')
export class Song {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column({ nullable: true })
  album: string;

  @Column({ nullable: true })
  genre: string;

  @Column()
  duration: number;

  @Column({ nullable: true })
  releaseYear: number;

  @Column({ nullable: true })
  coverUrl: string;

  @ManyToOne(() => User, (user) => user.songs, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: number;

  @OneToMany(() => PlaylistTrack, (playlistTrack) => playlistTrack.song)
  playlistTracks: PlaylistTrack[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
