import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salle } from './salle.entity';
import { CreateSalleDto } from './dto/create-salle.dto';

@Injectable()
export class SallesService {
  constructor(
    @InjectRepository(Salle)
    private sallesRepository: Repository<Salle>,
  ) {}

  async create(createSalleDto: CreateSalleDto): Promise<Salle> {
    const salle = this.sallesRepository.create(createSalleDto);
    return this.sallesRepository.save(salle);
  }

  async findAll(): Promise<Salle[]> {
    return this.sallesRepository.find();
  }

  async findOne(id: number): Promise<Salle> {
    const salle = await this.sallesRepository.findOneBy({ id });
    if (!salle) {
      throw new NotFoundException(`Salle #${id} introuvable`);
    }
    return salle;
  }

  async remove(id: number): Promise<void> {
    const salle = await this.findOne(id);
    await this.sallesRepository.remove(salle);
  }
}
