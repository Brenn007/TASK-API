import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSongDto {
  @ApiPropertyOptional({ example: 'Nouveau titre', description: 'Titre de la chanson' })
  @IsOptional()
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  title?: string;

  @ApiPropertyOptional({ example: 'Nouvel artiste', description: 'Nom de l\'artiste' })
  @IsOptional()
  @IsString({ message: "Le nom de l'artiste doit être une chaîne de caractères" })
  artist?: string;

  @ApiPropertyOptional({ example: 'Nouvel album', description: 'Nom de l\'album' })
  @IsOptional()
  @IsString({ message: "Le nom de l'album doit être une chaîne de caractères" })
  album?: string;

  @ApiPropertyOptional({ example: 300, description: 'Durée en secondes' })
  @IsOptional()
  @IsNumber({}, { message: 'La durée doit être un nombre' })
  @Min(1, { message: 'La durée doit être au moins 1 seconde' })
  duration?: number;
}
