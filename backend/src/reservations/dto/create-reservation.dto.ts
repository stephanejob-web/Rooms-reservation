import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  salle_id: number;

  @IsInt()
  utilisateur_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  objet: string;

  @IsDateString()
  date_debut: string;

  @IsDateString()
  date_fin: string;
}
