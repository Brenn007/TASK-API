import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTrackDto {
  @ApiProperty({ example: 1, description: 'ID de la chanson à ajouter' })
  @IsNumber({}, { message: "L'ID de la chanson doit être un nombre" })
  @IsNotEmpty({ message: "L'ID de la chanson est requis" })
  @Min(1, { message: "L'ID de la chanson doit être supérieur à 0" })
  songId: number;
}
