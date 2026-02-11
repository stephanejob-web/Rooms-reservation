import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from '../reservations/reservation.entity';

@Entity('salles')
export class Salle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'int' })
  capacite: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  localisation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => Reservation, (reservation) => reservation.salle)
  reservations: Reservation[];
}
