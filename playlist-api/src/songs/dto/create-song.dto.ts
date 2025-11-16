import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSongDto {
  @ApiProperty({ example: 'Bohemian Rhapsody', description: 'Titre de la chanson' })
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le titre est requis' })
  title: string;

  @ApiProperty({ example: 'Queen', description: 'Nom de l\'artiste' })
  @IsString({ message: "Le nom de l'artiste doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nom de l'artiste est requis" })
  artist: string;

  @ApiPropertyOptional({ example: 'A Night at the Opera', description: 'Nom de l\'album' })
  @IsOptional()
  @IsString({ message: "Le nom de l'album doit être une chaîne de caractères" })
  album?: string;

  @ApiPropertyOptional({ example: 354, description: 'Durée en secondes' })
  @IsOptional()
  @IsNumber({}, { message: 'La durée doit être un nombre' })
  @Min(1, { message: 'La durée doit être au moins 1 seconde' })
  duration?: number;
}
