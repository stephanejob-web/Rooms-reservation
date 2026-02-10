import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSalleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nom: string;

  @IsInt()
  @Min(1)
  capacite: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  localisation?: string;
}
