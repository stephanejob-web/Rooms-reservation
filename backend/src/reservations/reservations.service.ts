import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, StatutReservation } from './reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const dateDebut = new Date(dto.date_debut);
    const dateFin = new Date(dto.date_fin);

    if (dateFin <= dateDebut) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    // Vérifier les conflits de réservation sur la même salle
    const conflit = await this.reservationsRepository
      .createQueryBuilder('r')
      .where('r.salle_id = :salleId', { salleId: dto.salle_id })
      .andWhere('r.statut = :statut', { statut: StatutReservation.CONFIRMEE })
      .andWhere('r.date_debut < :dateFin', { dateFin })
      .andWhere('r.date_fin > :dateDebut', { dateDebut })
      .getOne();

    if (conflit) {
      throw new ConflictException('Cette salle est déjà réservée sur ce créneau');
    }

    const reservation = this.reservationsRepository.create(dto);
    return this.reservationsRepository.save(reservation);
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      relations: ['salle', 'utilisateur'],
    });
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: ['salle', 'utilisateur'],
    });
    if (!reservation) {
      throw new NotFoundException(`Réservation #${id} introuvable`);
    }
    return reservation;
  }

  async annuler(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);
    reservation.statut = StatutReservation.ANNULEE;
    return this.reservationsRepository.save(reservation);
  }

  async remove(id: number): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationsRepository.remove(reservation);
  }
}
