import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty({ example: 'L. Messi', description: 'Nombre corto del jugador' })
  @IsString()
  short_name: string;

  @ApiProperty({ example: 'Inter Miami CF', description: 'Club del jugador' })
  @IsString()
  club_name: string;

  @ApiProperty({ example: 'Argentina', description: 'Nacionalidad' })
  @IsString()
  nationality_name: string;

  @ApiProperty({ example: 'RW, ST', description: 'Posiciones del jugador' })
  @IsString()
  player_positions: string;

  @ApiProperty({ example: 91, description: 'Calificación general (1-100)' })
  @IsNumber()
  overall: number;

  @ApiProperty({ example: 85 })
  @IsNumber()
  pace: number;

  @ApiProperty({ example: 92 })
  @IsNumber()
  shooting: number;

  @ApiProperty({ example: 91 })
  @IsNumber()
  passing: number;

  @ApiProperty({ example: 95 })
  @IsNumber()
  dribbling: number;

  @ApiProperty({ example: 35 })
  @IsNumber()
  defending: number;

  @ApiProperty({ example: 65 })
  @IsNumber()
  physic: number;

  @ApiProperty({ example: 23, description: 'Versión de FIFA (ej: 23)' })
  @IsNumber()
  fifa_version: number;

  @ApiProperty({ example: 'M', description: 'Género del jugador: M o F', required: false })
  @IsString()
  gender?: string;
}