import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Salle } from '../salles/salle.entity';
import { Utilisateur } from '../users/user.entity';

export enum StatutReservation {
  CONFIRMEE = 'confirmee',
  ANNULEE = 'annulee',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  salle_id: number;

  @ManyToOne(() => Salle, (salle) => salle.reservations)
  @JoinColumn({ name: 'salle_id' })
  salle: Salle;

  @Column()
  utilisateur_id: number;

  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.reservations)
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;

  @Column({ type: 'varchar', length: 255 })
  objet: string;

  @Column({ type: 'datetime' })
  date_debut: Date;

  @Column({ type: 'datetime' })
  date_fin: Date;

  @Column({
    type: 'enum',
    enum: StatutReservation,
    default: StatutReservation.CONFIRMEE,
  })
  statut: StatutReservation;

  @CreateDateColumn()
  date_creation: Date;
}
