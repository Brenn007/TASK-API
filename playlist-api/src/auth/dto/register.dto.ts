import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email de l\'utilisateur (doit être unique)',
  })
  @IsEmail({}, { message: "L'email doit être valide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Nom d\'utilisateur (doit être unique, minimum 3 caractères)',
  })
  @IsString({ message: "Le nom d'utilisateur doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nom d'utilisateur est requis" })
  @MinLength(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères" })
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mot de passe (minimum 6 caractères)',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;
}
